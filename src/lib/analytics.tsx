/**
 * 計測(Layers SDK 導入指示・2026-08-18)。@layers/expo の薄いラッパー。
 *
 * 送るのは行動の有無と件数のみ。判定ロジックの内部値・メモ内容・食材名は送らない。
 * appId(EXPO_PUBLIC_LAYERS_APP_ID)が未設定なら何もしない(開発時の既定)。
 * Web には analytics.web.tsx の無効版が使われ、@layers はバンドルに入らない。
 *
 * ATT は当面出さない方針(requestTracking={false} を必ず維持)。同意は
 * 解析のみ有効・広告トラッキング無効で固定する。広告出稿を始める判断を
 * した時のみ requestExpoTrackingPermission を任意のタイミングで呼ぶこと。
 */
import {
  LayersProvider,
  useLayers,
  useLayersExpoRouterTracking,
  useLayersTrack,
} from '@layers/expo';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';

/** 公開前提の識別子(秘密鍵ではない)。ソースにハードコードしないこと */
const APP_ID = process.env.EXPO_PUBLIC_LAYERS_APP_ID ?? '';

/** スクリーン自動計測と、初期化直後に一度だけ行う同意設定 */
function AnalyticsSetup() {
  const { sdk } = useLayers();
  // Expo Router の遷移を自動でスクリーンイベントにする(sdk が null の間は待機)
  useLayersExpoRouterTracking(sdk, usePathname, useGlobalSearchParams);

  const consented = useRef(false);
  useEffect(() => {
    if (sdk === null || consented.current) return;
    consented.current = true;
    // 解析は有効、広告トラッキングは無効。この状態でも SDK signal は取れる
    sdk.setConsent({ analytics: true, advertising: false }).catch((e) => {
      console.error('[Layers] setConsent failed:', e);
    });
  }, [sdk]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (APP_ID === '') {
    return <>{children}</>;
  }
  return (
    <LayersProvider
      config={{ appId: APP_ID, environment: 'production' }}
      // true にするとマウント時に ATT ダイアログが出る。絶対に維持すること
      requestTracking={false}
      enableDeepLinks={true}
      onError={(e) => console.error('[Layers]', e)}
    >
      <AnalyticsSetup />
      {children}
    </LayersProvider>
  );
}

/**
 * イベント送信。SDK 初期化前・appId 未設定・Web では自動で no-op。
 * 戻り値の関数は初期化が済むと参照が替わるので、表示イベントを effect で
 * 送るときは useAnalyticsReady() と組み合わせて取りこぼしを防ぐ。
 */
export function useTrack(): (
  eventName: string,
  properties?: Record<string, string | number | boolean>,
) => void {
  return useLayersTrack();
}

/** SDK の初期化が済んだか。マウント時発火のイベントの送り時の判定に使う */
export function useAnalyticsReady(): boolean {
  return useLayers().isReady;
}
