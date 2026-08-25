/**
 * デモの薄い実行層(デモ仕様書 v2 §4)。
 *
 * すべてのアクションを開始時刻からの絶対値で登録する。相対的な連鎖にすると
 * setTimeout の誤差が累積して曲とずれるため、必ずこの形を保つこと。
 */
export type DemoAction = {
  /** 開始からのミリ秒 */
  at: number;
  run: () => void;
  /** ログ用 */
  label?: string;
};

export function runDemo(actions: DemoAction[], onLog?: (s: string) => void) {
  const t0 = Date.now();
  const timers: ReturnType<typeof setTimeout>[] = [];

  for (const a of actions) {
    timers.push(
      setTimeout(() => {
        onLog?.(`${Date.now() - t0}ms  ${a.label ?? ''}`);
        a.run();
      }, a.at),
    );
  }

  // 停止用
  return () => timers.forEach(clearTimeout);
}
