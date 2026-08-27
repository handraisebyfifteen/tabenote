/**
 * 課金(フェーズ8)。RevenueCat の薄いラッパー。
 *
 * モデルは「tabenote 月額プラン」1本(申請準備指示書・2026-08-17 決定)。
 * 無料プランは無く、アプリ全体を購読の後ろに置く(ゲートは app/_layout)。
 * Product ID は tabenote.premium.monthly だが、これは変更不能な内部識別子。
 * UI文言に「プレミアム」「PRO」「アップグレード」等は使わない(指示書の禁止事項)。
 *
 * 公開APIキーは EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY で渡す。
 * 未設定の間とWebでは無効(billingEnabled() が false)で、ゲートも掛からない。
 *
 * Expo Go では SDK が Preview API Mode(ネイティブ呼び出しをJSのモックに差し替える)
 * で動くため画面遷移の確認はできるが、実際の購入は開発ビルドが必要。
 */
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { CustomerInfo, PurchasesError, PurchasesPackage } from 'react-native-purchases';

import { IS_CLOSED_TEST } from '@/config/closedTest';

/** RevenueCat ダッシュボードで作る entitlement の識別子 */
export const ENTITLEMENT_ID = 'pro';

/** 公開APIキー(ストアごとに別。秘密鍵ではないのでアプリに載せてよい) */
const API_KEY =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
  }) ?? '';

type PurchasesApi = typeof import('react-native-purchases').default;

let sdkCache: PurchasesApi | null = null;

/** Web にはネイティブモジュールが無いので、そもそも読み込まない */
function sdk(): PurchasesApi | null {
  if (Platform.OS === 'web') return null;
  if (sdkCache === null) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdkCache = (require('react-native-purchases') as { default: PurchasesApi }).default;
  }
  return sdkCache;
}

/**
 * 以下3つの抜け道を効かせてよい状況か。
 *
 * 開発ビルドか、シミュレータで動いているときだけ許す。撮影に使う EAS の simulator 系
 * プロファイルはリリースビルドなので `__DEV__` だけでは足りないが、App Store に出る
 * ビルドは「リリース かつ 実機」なので、この条件には決して当てはまらない。
 *
 * つまり環境変数が本番ビルドに紛れ込んでも、実機では無効になる。eas.json 側で
 * 打ち消す必要はない(そもそも EAS は env に空文字を許さない)。
 * 例外は DEV_APP_USER_ID だけ(クローズドテスト配布ビルドでも効く。宣言側の注記を参照)。
 */
const HATCHES_ALLOWED = __DEV__ || !Device.isDevice;

/**
 * スクリーンショット撮影用の抜け道。
 *
 * シミュレータや、まだ審査に出していない商品では StoreKit がプランを返さないため、
 * APIキー入りのビルドだとゲートの向こうへ行けず、中の画面を撮れない。
 * EXPO_PUBLIC_SKIP_PAYWALL=1 を渡すと課金機能ごと無効になり、
 * ゲートも課金の導線も出なくなる(= キー未設定と同じ状態)。
 */
const SKIP_PAYWALL = HATCHES_ALLOWED && process.env.EXPO_PUBLIC_SKIP_PAYWALL === '1';

/**
 * 「購読者」として起動するための App User ID(撮影・動作確認・クローズドテスト用)。
 *
 * RevenueCat ダッシュボードで promotional entitlement を付けても、既定のアプリは
 * 匿名ID($RCAnonymousID:…)で動くので権利が届かない。付けた相手の ID を渡すと、
 * その人として configure して、購読済みの状態で起動できる。
 *
 * SKIP_PAYWALL と違い課金機能は生きたままなので、appUserId が中継サーバーへ渡り、
 * AI献立提案も通る(AI欄まで撮るならこちらの経路)。
 * 両方を同時に設定した場合は SKIP_PAYWALL が勝つ(課金機能ごと無効になるため)。
 *
 * 3つの抜け道で唯一、クローズドテスト配布ビルド(config/closedTest)でも効かせる。
 * 実機のリリースビルドだが、eas.json の closedtest プロファイルが渡す共有ID
 * (closed_test_tester)に promotional entitlement を付けておくことで、サーバー側で
 * 購読を検証するAI機能までテスターに通すため(設計書 rev.4 §7 の 2026-08-27 追記)。
 */
const DEV_APP_USER_ID =
  HATCHES_ALLOWED || IS_CLOSED_TEST
    ? (process.env.EXPO_PUBLIC_DEV_APP_USER_ID ?? '').trim()
    : '';

/**
 * ペイウォールを撮影するためのダミープラン(撮影専用ビルド限定)。
 *
 * App内課金の審査用スクリーンショットには価格の出たペイウォールが要るが、
 * シミュレータには StoreKit の商品情報が無いので「取得できませんでした」で止まる。
 * 価格表記(例: ¥1,000)を渡すと、その月額1本だけを並べた状態で撮れる。
 *
 * この状態では RevenueCat を一切呼ばない(購入も復元も成立しない)。撮影以外に使わないこと。
 * 表示は実際の価格と一致させること。違う価格を審査に出すと不正確な申請になる。
 */
const MOCK_PLAN_PRICE = HATCHES_ALLOWED
  ? (process.env.EXPO_PUBLIC_MOCK_PLAN_PRICE ?? '').trim()
  : '';
const MOCK_PLAN: BillingPlan | null =
  MOCK_PLAN_PRICE === ''
    ? null
    : { id: 'mock.monthly', period: 'monthly', priceString: MOCK_PLAN_PRICE, trial: null };

/** 課金機能が使える状態か。false の間はUIを出さず、常に未購入として扱う */
export function billingEnabled(): boolean {
  if (Platform.OS === 'web' || SKIP_PAYWALL) return false;
  // 撮影用のダミープランは、APIキーが無くてもゲートとペイウォールを出す
  return API_KEY !== '' || MOCK_PLAN !== null;
}

let configured = false;

/** アプリ起動時に一度だけ呼ぶ。無効なら何もしない */
export async function configureBilling(): Promise<void> {
  if (configured || !billingEnabled() || MOCK_PLAN !== null) return;
  const P = sdk();
  if (P === null) return;
  if (__DEV__) await P.setLogLevel(P.LOG_LEVEL.DEBUG);
  if (DEV_APP_USER_ID !== '') {
    console.warn(`[billing] 開発用の App User ID で起動: ${DEV_APP_USER_ID}`);
    P.configure({ apiKey: API_KEY, appUserID: DEV_APP_USER_ID });
  } else {
    P.configure({ apiKey: API_KEY });
  }
  configured = true;
}

function hasEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export interface SubscriptionStatus {
  /** 有効な購読があるか */
  active: boolean;
  /** AI中継サーバーに渡す app_user_id。課金無効時は null */
  appUserId: string | null;
}

const NOT_SUBSCRIBED: SubscriptionStatus = { active: false, appUserId: null };

/** 現在の購読状態を取り直す。失敗しても落とさず未購読を返す */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const P = sdk();
  if (P === null || !billingEnabled() || MOCK_PLAN !== null) return NOT_SUBSCRIBED;
  try {
    await configureBilling();
    const [info, appUserId] = await Promise.all([P.getCustomerInfo(), P.getAppUserID()]);
    return { active: hasEntitlement(info), appUserId };
  } catch {
    return NOT_SUBSCRIBED;
  }
}

/** ペイウォールに並べる1プラン */
export interface BillingPlan {
  /** 購入時にそのまま渡す package identifier */
  id: string;
  period: 'monthly' | 'annual' | 'other';
  /** ストアがローカライズ済みの価格表記(例: ¥1,000) */
  priceString: string;
  /** 無料トライアルの長さ。無ければ null */
  trial: { count: number; unit: string } | null;
}

function toPlan(pkg: PurchasesPackage): BillingPlan {
  const intro = pkg.product.introPrice;
  const isFreeTrial = intro !== null && intro.price === 0;
  const type = String(pkg.packageType);
  return {
    id: pkg.identifier,
    period: type === 'ANNUAL' ? 'annual' : type === 'MONTHLY' ? 'monthly' : 'other',
    priceString: pkg.product.priceString,
    trial:
      isFreeTrial && intro !== null
        ? { count: intro.periodNumberOfUnits, unit: intro.periodUnit }
        : null,
  };
}

/**
 * 現在の Offering のプラン一覧。
 * ダッシュボード未設定・通信失敗のときは空配列(ペイウォールは「取得できない」表示にする)。
 */
export async function getPlans(): Promise<BillingPlan[]> {
  if (MOCK_PLAN !== null) return [MOCK_PLAN];
  const P = sdk();
  if (P === null || !billingEnabled()) return [];
  await configureBilling();
  const offerings = await P.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  // 月額を先、年額を後に並べる(指示書 7章の価格提示順)
  const order = { monthly: 0, annual: 1, other: 2 };
  return packages.map(toPlan).sort((a, b) => order[a.period] - order[b.period]);
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'failed';

/** プランを購入する。ユーザーのキャンセルは失敗と区別する(エラー表示を出さないため) */
export async function purchasePlan(planId: string): Promise<PurchaseOutcome> {
  // 撮影用のダミープランは購入できない。cancelled にしてエラー表示を出さない
  if (MOCK_PLAN !== null) return 'cancelled';
  const P = sdk();
  if (P === null || !billingEnabled()) return 'failed';
  try {
    await configureBilling();
    const offerings = await P.getOfferings();
    const pkg = offerings.current?.availablePackages.find((p) => p.identifier === planId);
    if (pkg === undefined) return 'failed';
    const { customerInfo } = await P.purchasePackage(pkg);
    return hasEntitlement(customerInfo) ? 'purchased' : 'failed';
  } catch (e) {
    return (e as PurchasesError).userCancelled === true ? 'cancelled' : 'failed';
  }
}

/** 購入の復元。復元後に有効な entitlement があれば true */
export async function restorePurchases(): Promise<boolean> {
  const P = sdk();
  if (P === null || !billingEnabled() || MOCK_PLAN !== null) return false;
  await configureBilling();
  const info = await P.restorePurchases();
  return hasEntitlement(info);
}

/**
 * 購読状態の変化(更新・失効・別端末での購入)を受け取る。
 * 戻り値を呼ぶと購読解除。
 */
export function onSubscriptionChange(listener: (active: boolean) => void): () => void {
  const P = sdk();
  if (P === null || !billingEnabled() || MOCK_PLAN !== null) return () => {};
  const handler = (info: CustomerInfo) => listener(hasEntitlement(info));
  P.addCustomerInfoUpdateListener(handler);
  return () => {
    P.removeCustomerInfoUpdateListener(handler);
  };
}
