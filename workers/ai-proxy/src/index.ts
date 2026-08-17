/**
 * tabenote AI 中継サーバー(フェーズ9、Cloudflare Workers)。
 *
 * アプリに API キーを載せないための小さなプロキシ。
 *   POST /suggest — 選択食材+季節から献立のアイデアを返す(有料機能)
 *
 * 表現の制約(設計書 9章)はシステムプロンプトで強制する:
 * 効能・症状・病名・点数を出さない。
 *
 * デプロイ手順は同ディレクトリの README.md を参照。
 */
import Anthropic from '@anthropic-ai/sdk';

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

/**
 * RevenueCat の購読確認。
 * Authorization: Bearer <app_user_id> を受け取り、有効な entitlement を持つか確認する。
 * REVENUECAT_API_KEY 未設定の間(開発中)はスキップして許可する。
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
  if (!res.ok) return false;
  const data = (await res.json()) as {
    subscriber?: { entitlements?: Record<string, { expires_date: string | null }> };
  };
  const entitlements = data.subscriber?.entitlements ?? {};
  const now = Date.now();
  return Object.values(entitlements).some(
    (e) => e.expires_date === null || Date.parse(e.expires_date) > now,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return jsonResponse(null, 204);
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/suggest') {
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
    if (!isValidRequest(body)) {
      return jsonResponse({ error: 'invalid_request' }, 400);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
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

    const text = message.content.find((block) => block.type === 'text');
    return jsonResponse({ suggestion: text?.type === 'text' ? text.text : '' });
  },
};
