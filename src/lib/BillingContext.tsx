/**
 * 購読状態をアプリ全体で共有する(フェーズ8)。
 *
 * モデルは月額プラン1本。enabled かつ未購読の間は、app/_layout がアプリ全体を
 * オンボーディング+購読案内で覆う(ハードペイウォール)。
 * 課金が無効(APIキー未設定・Web)のときは enabled=false でゲートも掛からない。
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { IS_CLOSED_TEST } from '@/config/closedTest';

import {
  billingEnabled,
  configureBilling,
  getPlans,
  getSubscriptionStatus,
  onSubscriptionChange,
  purchasePlan,
  restorePurchases,
} from './billing';
import type { BillingPlan, PurchaseOutcome } from './billing';

interface BillingValue {
  /** 課金の導線を出してよいか(APIキー未設定・Webでは false) */
  enabled: boolean;
  /** 有効な購読があるか */
  active: boolean;
  /** AI中継サーバーに渡す app_user_id */
  appUserId: string | null;
  /** 起動直後の購読状態の確認が済んだか(済むまでゲートを出さない) */
  ready: boolean;
  plans: BillingPlan[];
  plansLoading: boolean;
  /** 購読案内を開いたときに呼ぶ */
  loadPlans: () => Promise<void>;
  purchase: (planId: string) => Promise<PurchaseOutcome>;
  restore: () => Promise<boolean>;
}

const BillingContext = createContext<BillingValue>({
  enabled: false,
  active: false,
  appUserId: null,
  ready: true,
  plans: [],
  plansLoading: false,
  loadPlans: async () => {},
  purchase: async () => 'failed',
  restore: async () => false,
});

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const enabled = billingEnabled();
  const [active, setActive] = useState(false);
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(!enabled);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let unsubscribe = () => {};

    (async () => {
      await configureBilling();
      const status = await getSubscriptionStatus();
      if (!alive) return;
      setActive(status.active);
      setAppUserId(status.appUserId);
      setReady(true);
      // 更新・失効・別端末での購入を拾う
      unsubscribe = onSubscriptionChange((next) => {
        if (alive) setActive(next);
      });
    })();

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [enabled]);

  const loadPlans = useCallback(async () => {
    if (!enabled) return;
    setPlansLoading(true);
    try {
      setPlans(await getPlans());
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [enabled]);

  const purchase = useCallback(async (planId: string): Promise<PurchaseOutcome> => {
    const outcome = await purchasePlan(planId);
    if (outcome === 'purchased') {
      const status = await getSubscriptionStatus();
      setActive(status.active);
      setAppUserId(status.appUserId);
    }
    return outcome;
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    const restored = await restorePurchases();
    const status = await getSubscriptionStatus();
    setActive(status.active);
    setAppUserId(status.appUserId);
    return restored;
  }, []);

  return (
    <BillingContext.Provider
      value={{
        enabled,
        // ここが購読判定の集約点。クローズドテスト配布ビルドだけは「購読中」に固定する
        // (config/closedTest)。内部状態は本物の RevenueCat を追い続け、初回確認・
        // 更新リスナー・購入・復元のどの経路にも手を入れない(偽の購入は作らない)
        active: IS_CLOSED_TEST ? true : active,
        appUserId,
        ready,
        plans,
        plansLoading,
        loadPlans,
        purchase,
        restore,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  return useContext(BillingContext);
}
