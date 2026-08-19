/**
 * 計測の Web 向け無効版(billing.web.ts と同じ流儀)。
 * Layers SDK はネイティブアプリの計測にだけ使うので、Web では
 * @layers をバンドルに入れず、すべて no-op にする。
 */
import React from 'react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const noop = () => {};

export function useTrack(): (
  eventName: string,
  properties?: Record<string, string | number | boolean>,
) => void {
  return noop;
}

export function useAnalyticsReady(): boolean {
  return false;
}
