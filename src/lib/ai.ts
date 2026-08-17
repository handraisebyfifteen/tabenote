/**
 * AI献立提案のクライアント(フェーズ9、指示書 6-2「AIによる献立提案(有料)」)。
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
  if (!res.ok) {
    throw new Error(`AI提案の取得に失敗しました (${res.status})`);
  }
  const data = (await res.json()) as { suggestion?: string };
  return data.suggestion ?? '';
}
