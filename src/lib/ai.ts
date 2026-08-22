/**
 * AI献立提案のクライアント(フェーズ9、指示書 6-2「AIによる献立提案(有料)」)と、
 * 図鑑に無い食材を検索したときの「近い食材」の案内。
 *
 * 実体は workers/ai-proxy(Cloudflare Worker)。アプリはAPIキーを持たない。
 * AI_PROXY_URL を設定するまでこの機能は無効(aiEnabled() が false)。
 * 呼び出し側は useBilling() の isPro でゲートし、appUserId をそのまま渡す(lib/BillingContext)。
 */
import type { Lang } from '@/i18n/terms';

/** Worker の URL(例: 'https://tabenote-ai.xxx.workers.dev')。.env.local / EAS の環境変数で渡す */
export const AI_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL ?? '';

export function aiEnabled(): boolean {
  return AI_PROXY_URL !== '';
}

export interface SuggestParams {
  /** 食材名(表示名でよい) */
  foods: string[];
  /** 五季のラベル(例: 長夏(夏土用)) */
  season: string;
  recommendedFlavors: string[];
  missingFlavors: string[];
  lang: Lang;
  /** RevenueCat の app_user_id(課金ゲート有効時に必要) */
  appUserId?: string;
}

/** 献立の提案文を取得する。無効時・失敗時は例外 */
export async function suggestMenu(params: SuggestParams): Promise<string> {
  if (!aiEnabled()) {
    throw new Error('AI提案は未設定です(AI_PROXY_URL を設定してください)');
  }
  const res = await fetch(`${AI_PROXY_URL}/suggest`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(params.appUserId ? { authorization: `Bearer ${params.appUserId}` } : {}),
    },
    body: JSON.stringify({
      foods: params.foods,
      season: params.season,
      recommendedFlavors: params.recommendedFlavors,
      missingFlavors: params.missingFlavors,
      lang: params.lang,
    }),
  });
  if (res.status === 402) {
    throw new Error('subscription_required');
  }
  // 使いすぎ。通信エラーと同じ文面を出すと不具合に見えるので、呼び出し側で分ける
  if (res.status === 429) {
    throw new Error('rate_limited');
  }
  if (!res.ok) {
    throw new Error(`AI提案の取得に失敗しました (${res.status})`);
  }
  const data = (await res.json()) as { suggestion?: string };
  return data.suggestion ?? '';
}

/** 図鑑の食材ひとつと、それが近いとされる理由(サーバーが図鑑のIDに解決済み) */
export interface SimilarFood {
  /** 図鑑の食材ID。サーバー側で実在を検証済み */
  id: string;
  reason: string;
}

export interface SimilarFoodsResult {
  items: SimilarFood[];
  /** 「図鑑にありません」の一文。近いものが無いときの説明もここに来る */
  note: string;
}

export interface SimilarParams {
  /** 検索窓に入力された、図鑑に無い食材名 */
  query: string;
  lang: Lang;
  appUserId?: string;
}

/**
 * 図鑑に無い食材名から、図鑑の中の近い食材を挙げてもらう。
 * 返るのは図鑑にある食材のIDだけ(検索された食材そのものの性・味は出さない)。
 * 無効時・失敗時は例外
 */
export async function suggestSimilarFoods(
  params: SimilarParams,
): Promise<SimilarFoodsResult> {
  if (!aiEnabled()) {
    throw new Error('AI提案は未設定です(AI_PROXY_URL を設定してください)');
  }
  const res = await fetch(`${AI_PROXY_URL}/similar`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(params.appUserId ? { authorization: `Bearer ${params.appUserId}` } : {}),
    },
    body: JSON.stringify({ query: params.query, lang: params.lang }),
  });
  if (res.status === 402) {
    throw new Error('subscription_required');
  }
  if (res.status === 429) {
    throw new Error('rate_limited');
  }
  if (!res.ok) {
    throw new Error(`近い食材の取得に失敗しました (${res.status})`);
  }
  const data = (await res.json()) as Partial<SimilarFoodsResult>;
  return { items: data.items ?? [], note: data.note ?? '' };
}
