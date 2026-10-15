/**
 * 課金の Web 版(フェーズ8)。
 *
 * 公開サイト(tabenote.app)に課金は無く、react-native-purchases もネイティブ専用なので、
 * Metro がこちらを解決することで SDK 自体を Web バンドルに含めない。
 * billingEnabled() が常に false のため、アプリ全体の購読ゲートも Web では掛からない。
 * 型は billing.ts と共有する(type-only なので実体は取り込まれない)。
 */
import type { BillingPlan, PurchaseOutcome, SubscriptionStatus } from './billing';

export type { BillingPlan, PurchaseOutcome, SubscriptionStatus } from './billing';

export const ENTITLEMENT_ID = 'pro';

/** billing.ts と同じ値。Web はこのファイルが解決されるので、値を持たせておく */
export const TRIAL_OFFER = { count: 2, unit: 'WEEK' } as const;

export function billingEnabled(): boolean {
  return false;
}

export async function configureBilling(): Promise<void> {}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return { active: false, appUserId: null };
}

export async function getPlans(): Promise<BillingPlan[]> {
  return [];
}

export async function purchasePlan(): Promise<PurchaseOutcome> {
  return 'failed';
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}

export function onSubscriptionChange(): () => void {
  return () => {};
}
