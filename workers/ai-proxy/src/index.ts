/**
 * tabenote AI 中継サーバー(フェーズ9、Cloudflare Workers)。
 *
 * アプリに API キーを載せないための小さなプロキシ。
 *   POST /suggest — 選択食材+季節から献立のアイデアを返す(有料機能)
 *   POST /similar — 図鑑に無い食材名から、図鑑の中の近い食材を挙げる(有料機能)
 *
 * 表現の制約(設計書 9章)はシステムプロンプトで強制する:
 * 効能・症状・病名・点数を出さない。
 *
 * デプロイ手順は同ディレクトリの README.md を参照。
 */
import Anthropic from '@anthropic-ai/sdk';

// アプリと同じ参照データを見る(コピーを置くと図鑑とずれる)。
// wrangler(esbuild)がバンドル時に取り込むので、実行時のファイル読み込みは無い
import rawFoods from '../../../src/data/tabenote_foods.json';

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** RevenueCat の購読確認を有効にする場合に設定(未設定なら確認をスキップ) */
  REVENUECAT_API_KEY?: string;
}

const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `あなたは薬膳手帳アプリ「tabenote」の献立提案アシスタントです。
ユーザーが選んだ食材と、いまの五季・推奨される味の情報をもとに、料理(献立)のアイデアを提案します。

必ず守ること:
- 「治る」「効く」「予防する」「改善します」などの効能表現を使わない
- 症状名・病名に言及しない。医学的な助言をしない
- 点数や優劣の断定をしない(「正解」を押し付けない)
- 分量や厳密なレシピ手順は書かない。料理名と方向性(調理法・組み合わせの意図)まで
- 提案は最大3案。各案は2〜3文で簡潔に
- 中医学の用語を使うときは「〜とされています」の伝聞形にとどめる
- lang が "en" なら英語で、それ以外は日本語で回答する`;

interface SuggestRequest {
  foods: string[];
  season: string;
  recommendedFlavors?: string[];
  missingFlavors?: string[];
  lang?: 'ja' | 'en';
}

/* ---------------- /similar(図鑑に無い食材 → 近い食材) ---------------- */

interface CatalogFood {
  id: string;
  name: string;
  nature: string;
  flavors: string[];
  visible?: boolean;
}

/**
 * 候補になる食材。非表示3件と、性が空の「参照のみ項目」を除く
 * (アプリ側の SELECTABLE_FOODS と同じ母集合。選べないものを案内しない)
 */
const CANDIDATES: CatalogFood[] = (rawFoods as CatalogFood[]).filter(
  (f) => f.visible !== false && f.nature !== '',
);

/** モデルに見せる一覧。「番号 名前|性|味」の1行1件(約6KB) */
const CATALOG = CANDIDATES.map(
  (f, i) => `${i} ${f.name}|${f.nature}|${f.flavors.join('')}`,
).join('\n');

const SIMILAR_SYSTEM_PROMPT = `あなたは薬膳手帳アプリ「tabenote」の食材案内アシスタントです。
利用者が図鑑(下の一覧)に載っていない食材の名前を検索したとき、一覧の中から性・味・料理での使われかたが近いものを最大3件挙げ、なぜ近いのかを述べます。

必ず守ること:
- 挙げてよいのは一覧にある食材だけ。一覧に無い名前は絶対に返さない
- 検索された食材そのものの性・味・帰経を断定しない(出典に無いため)
- 「治る」「効く」「予防する」「改善します」などの効能表現を使わない
- 症状名・病名に言及しない。医学的な助言をしない
- 中医学の用語を使うときは「〜とされています」の伝聞形にとどめる
- reason は1〜2文。性(温める/冷ます方向)・味・調理での使われかたのうち、近いと言える点を書く
- 近い順に並べる。思い当たらない・検索語が食材でないときは items を空にする
- note は1文。その食材が図鑑に無いこと(または判断できないこと)を伝える
- lang が "en" なら英語で、それ以外は日本語で書く

一覧(番号 名前|性|味):
${CATALOG}`;

/**
 * 返答の形。index と name の両方を返させて、取り違えをサーバー側で弾く。
 * 件数の上限は構造化出力の制約として書けない(配列の個数制限は非対応)ので、
 * システムプロンプトで指示し、最後に3件へ切る
 */
const SIMILAR_SCHEMA = {
  type: 'object',
  properties: {
    note: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          name: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['index', 'name', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: ['note', 'items'],
  additionalProperties: false,
} as const;

interface SimilarRequest {
  query: string;
  lang?: 'ja' | 'en';
}

function isValidSimilarRequest(body: unknown): body is SimilarRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.query === 'string' && b.query.trim() !== '' && b.query.length <= 40;
}

/** 名前が一意な食材の逆引き(「かき」「さけ」は同名2件あるので入れない) */
const BY_UNIQUE_NAME = (() => {
  const counts = new Map<string, number>();
  for (const f of CANDIDATES) counts.set(f.name, (counts.get(f.name) ?? 0) + 1);
  const map = new Map<string, CatalogFood>();
  for (const f of CANDIDATES) if (counts.get(f.name) === 1) map.set(f.name, f);
  return map;
})();

/**
 * モデルの返答を図鑑の ID に落とす。
 * 番号と名前が食い違ったら名前を優先し(reason は名前について書かれているため)、
 * 同名2件で決められないものは落とす。ここを通ったものだけがアプリに渡る
 */
function resolveSimilarItems(
  raw: unknown,
): { items: { id: string; reason: string }[]; note: string } {
  if (typeof raw !== 'object' || raw === null) return { items: [], note: '' };
  const r = raw as { note?: unknown; items?: unknown };
  const note = typeof r.note === 'string' ? r.note : '';
  if (!Array.isArray(r.items)) return { items: [], note };

  const seen = new Set<string>();
  const items: { id: string; reason: string }[] = [];
  for (const entry of r.items) {
    if (typeof entry !== 'object' || entry === null) continue;
    const e = entry as { index?: unknown; name?: unknown; reason?: unknown };
    const reason = typeof e.reason === 'string' ? e.reason : '';
    const name = typeof e.name === 'string' ? e.name : '';
    const byIndex =
      typeof e.index === 'number' && Number.isInteger(e.index)
        ? CANDIDATES[e.index]
        : undefined;
    const food =
      byIndex !== undefined && byIndex.name === name
        ? byIndex
        : BY_UNIQUE_NAME.get(name);
    if (food === undefined || reason === '' || seen.has(food.id)) continue;
    seen.add(food.id);
    items.push({ id: food.id, reason });
  }
  return { items: items.slice(0, 3), note };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type, authorization',
    },
  });
}

function isValidRequest(body: unknown): body is SuggestRequest {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    Array.isArray(b.foods) &&
    b.foods.length >= 1 &&
    b.foods.length <= 30 &&
    b.foods.every((f) => typeof f === 'string' && f.length <= 60) &&
    typeof b.season === 'string' &&
    b.season.length <= 60
  );
}

/** アプリ側の src/lib/billing.ts の ENTITLEMENT_ID と一致させる */
const ENTITLEMENT_ID = 'pro';

/**
 * RevenueCat の購読確認。
 * Authorization: Bearer <app_user_id> を受け取り、有効な entitlement を持つか確認する。
 * 見るのは pro だけ(過去に作った別の entitlement で通ってしまわないように)。
 *
 * REVENUECAT_API_KEY 未設定の間(開発中)はスキップして許可する。
 * 裏を返すと、キーを入れ忘れた本番はエンドポイントが開放されたままになる
 * (誰でも ANTHROPIC_API_KEY 経由で Claude を叩けてしまう)。
 * docs/release-checklist.md の該当項目を必ず確認すること。
 *
 * キーは v1 API (/v1/subscribers) を叩けるもの = 権限を絞らない secret key が要る。
 * 権限を制限したキーは v2 専用で、v1 には 401 "Invalid API Key" で弾かれる。
 */
async function hasActiveSubscription(request: Request, env: Env): Promise<boolean> {
  if (!env.REVENUECAT_API_KEY) return true;
  const auth = request.headers.get('authorization') ?? '';
  const appUserId = auth.replace(/^Bearer\s+/i, '').trim();
  if (appUserId === '') return false;
  const res = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    { headers: { authorization: `Bearer ${env.REVENUECAT_API_KEY}` } },
  );
  if (!res.ok) {
    // キーの権限不足・貼り間違い等の切り分け用(wrangler tail で見る)
    console.error('revenuecat_error', res.status, (await res.text()).slice(0, 300));
    return false;
  }
  const data = (await res.json()) as {
    subscriber?: { entitlements?: Record<string, { expires_date: string | null }> };
  };
  const pro = data.subscriber?.entitlements?.[ENTITLEMENT_ID];
  if (pro === undefined) return false;
  // expires_date が null なら無期限(買い切り・生涯)
  return pro.expires_date === null || Date.parse(pro.expires_date) > Date.now();
}

/** 返答から最初のテキストブロックを取り出す */
function firstText(message: Anthropic.Message): string {
  const text = message.content.find((block) => block.type === 'text');
  return text?.type === 'text' ? text.text : '';
}

async function handleSuggest(body: unknown, env: Env): Promise<Response> {
  if (!isValidRequest(body)) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            foods: body.foods,
            season: body.season,
            recommendedFlavors: body.recommendedFlavors ?? [],
            missingFlavors: body.missingFlavors ?? [],
            lang: body.lang ?? 'ja',
          }),
        },
      ],
    });
  } catch (err) {
    // キー無効・レート超過など上流のエラー。詳細はログ(wrangler tail)で見る
    console.error('anthropic_error', err instanceof Error ? err.message : err);
    return jsonResponse({ error: 'upstream_error' }, 502);
  }

  return jsonResponse({ suggestion: firstText(message) });
}

async function handleSimilar(body: unknown, env: Env): Promise<Response> {
  if (!isValidSimilarRequest(body)) {
    return jsonResponse({ error: 'invalid_request' }, 400);
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // 一覧(約6KB)は毎回同じなので、まるごとキャッシュに載せる
      system: [
        {
          type: 'text',
          text: SIMILAR_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      output_config: { format: { type: 'json_schema', schema: SIMILAR_SCHEMA } },
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            query: body.query.trim(),
            lang: body.lang ?? 'ja',
          }),
        },
      ],
    });
  } catch (err) {
    console.error('anthropic_error', err instanceof Error ? err.message : err);
    return jsonResponse({ error: 'upstream_error' }, 502);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(firstText(message));
  } catch {
    console.error('similar_parse_error', firstText(message).slice(0, 300));
    return jsonResponse({ error: 'upstream_error' }, 502);
  }
  return jsonResponse(resolveSimilarItems(parsed));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return jsonResponse(null, 204);
    }

    const url = new URL(request.url);
    if (
      request.method !== 'POST' ||
      (url.pathname !== '/suggest' && url.pathname !== '/similar')
    ) {
      return jsonResponse({ error: 'not_found' }, 404);
    }

    if (!(await hasActiveSubscription(request, env))) {
      return jsonResponse({ error: 'subscription_required' }, 402);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'invalid_json' }, 400);
    }

    return url.pathname === '/suggest'
      ? handleSuggest(body, env)
      : handleSimilar(body, env);
  },
};
