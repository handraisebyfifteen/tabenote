/**
 * デモ用のなめらかスクロール(デモ仕様書 v2 §9 の scrollTo(y, durationMs))。
 *
 * RN の scrollTo は時間を指定できないので、rAF で easeInOutCubic に沿って
 * animated: false の scrollTo を毎フレーム打つ。手帳・図鑑・解説の3セクションが
 * useDemoScroll で共通の 'notebookScroll' として登録する(同時にマウントされるのは
 * 常に1つなので、いま出ているセクションが動く)。
 */
import { useEffect, useRef } from 'react';

import { DEMO_MODE } from './config';
import { registerDemoScreen, type DemoHandlers } from './registry';

export function smoothScroll(
  apply: (y: number) => void,
  from: number,
  to: number,
  durationMs: number,
): () => void {
  const start = Date.now();
  let raf = 0;
  const tick = () => {
    const p = Math.min(1, (Date.now() - start) / Math.max(1, durationMs));
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    apply(from + (to - from) * eased);
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/**
 * スクロールできるセクションが 'notebookScroll.by(dy, ms)' と
 * 'notebookScroll.toTop()' に応えられるようにする。
 * apply には「オフセット y へ即座に移動する」関数を渡す。
 */
export function useDemoScroll(apply: (y: number) => void) {
  const handlers = useRef<DemoHandlers>({});
  const applyRef = useRef(apply);
  const offset = useRef(0);
  const cancel = useRef<(() => void) | null>(null);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (!DEMO_MODE) return;
    handlers.current = {
      by: (dy: number, ms: number) => {
        cancel.current?.();
        const from = offset.current;
        const to = Math.max(0, from + dy);
        offset.current = to;
        cancel.current = smoothScroll((y) => applyRef.current(y), from, to, ms);
      },
      /**
       * 先頭へ即座に戻す(撮り直し用)。手帳は停止しても同じセクションのままで
       * 再マウントされないので、この offset と実際の位置を明示的に戻す。
       */
      toTop: () => {
        cancel.current?.();
        cancel.current = null;
        offset.current = 0;
        applyRef.current(0);
      },
    };
  });

  useEffect(() => {
    if (!DEMO_MODE) return;
    const unregister = registerDemoScreen('notebookScroll', handlers);
    return () => {
      cancel.current?.();
      unregister();
    };
  }, []);
}
