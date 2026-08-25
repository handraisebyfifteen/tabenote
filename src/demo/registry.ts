/**
 * 画面側の操作をデモの台本から呼ぶための名前付きレジストリ。
 *
 * 各画面は DEMO_MODE のときだけ、自分の state を動かすハンドラ群を
 * 「接頭辞 + ref」で登録する(ref の中身は毎レンダー更新されるので、
 * ハンドラは常に最新の state を閉じ込めている)。台本側は
 * demoCall('combine.tapTile', id) のように画面名.操作名で呼ぶ。
 *
 * 画面がまだマウントされていない等でハンドラが無いときは、落とさず
 * 警告ログだけ出す(撮影中にクラッシュさせない)。
 */

export type DemoHandlers = Record<string, (...args: any[]) => void>;

const screens = new Map<string, { current: DemoHandlers }>();

export function registerDemoScreen(
  prefix: string,
  ref: { current: DemoHandlers },
): () => void {
  screens.set(prefix, ref);
  return () => {
    // 別のインスタンスが先に登録し直していたら消さない(セグメント切替時など)
    if (screens.get(prefix) === ref) screens.delete(prefix);
  };
}

export function demoCall(name: string, ...args: unknown[]): void {
  const dot = name.indexOf('.');
  const ref = dot > 0 ? screens.get(name.slice(0, dot)) : undefined;
  const fn = ref?.current[name.slice(dot + 1)];
  if (fn === undefined) {
    console.warn(`[demo] ハンドラ未登録: ${name}`);
    return;
  }
  fn(...args);
}
