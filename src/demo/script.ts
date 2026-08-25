/**
 * デモの台本(デモ仕様書 v2 §3・§8)。
 *
 * 時刻はすべて「▶ボタン押下」からの絶対値。押下と同時にカウントイン
 * (1小節 = 4拍)が始まり、その間スプラッシュの下で初期状態を作る。
 * カウントイン明け(COUNT_IN_MS)が楽曲の 0:00.00。
 *
 * 「決定」の対応(仕様書の confirm() の割り当て):
 *   決定(1回目) = ぶりタイルへの2タップ目(この画面の語彙での「決定」)
 *   決定(2回目) = 画面下の決定ボタン → アドバイスへ遷移
 * にがうりの2タップ目(21小節)と検索を畳む操作(22小節)は、
 * 23小節3拍目の決定ボタンまでに合成後の五角形を見せるために足した。
 */
import { router } from 'expo-router';

import {
  DEMO_QUERY,
  DEMO_SEASON,
  DEMO_TYPE_MODE,
  ENDING_SPLASH_TOTAL_MS,
  FOOD_AJI,
  FOOD_BURI,
  FOOD_NIGAURI,
  LEAD,
  TYPE_INTERVAL_MS,
} from './config';
import type { DemoAction } from './driver';
import { demoCall } from './registry';
import { BAR_MS, bar, beat } from './timing';

/** カウントイン(1小節ぶん)。この間に画面の初期化を済ませる */
export const COUNT_IN_MS = Math.round(BAR_MS);

export function buildDemoActions(): DemoAction[] {
  const actions: DemoAction[] = [];
  const add = (at: number, label: string, run: () => void) =>
    actions.push({ at: Math.round(at), run, label });
  /** 楽曲の 0:00.00 起点 → 押下起点へ */
  const t = (ms: number) => COUNT_IN_MS + ms;

  /* ---- カウントイン中の準備(スプラッシュの下で初期状態を作る) ---- */
  // スプラッシュの合計表示時間は、幕が引き切る瞬間が 2小節2拍目に当たる長さにする
  add(0, 'スプラッシュを被せる', () =>
    demoCall('root.showSplash', COUNT_IN_MS + beat(2, 2)),
  );
  // スプラッシュは押下+4390ms まで画面を覆うので、その内側で余裕を持って並べる。
  // アプリ起動後の最初の▶はタブが未マウントで、マウントとハンドラ登録に
  // 数百 ms かかることがある(間に合わないと reset が空振りする)。
  add(100, '(準備) 組み合わせ画面をマウント', () =>
    router.navigate({ pathname: '/(tabs)/combine', params: { ids: FOOD_AJI } }),
  );
  add(1200, '(準備) 組み合わせ画面を初期化(★=あじ)', () =>
    demoCall('combine.reset', [FOOD_AJI]),
  );
  add(1500, '(準備) 手帳をマウント', () => router.navigate('/(tabs)/notebook'));
  add(2200, '(準備) 手帳を初期化', () => {
    demoCall('notebookScroll.toTop');
    demoCall('notebook.reset');
  });
  add(2900, '(準備) Home へ戻す', () => router.navigate('/'));

  /* ---- 本編(t = 楽曲 0:00.00 起点) ---- */

  // 2小節2拍目: スプラッシュの幕がここで引き切り、Home が現れる(遷移自体は showSplash の長さで作る)
  add(t(beat(2, 2)), 'Home(スプラッシュが捌ける)', () => router.navigate('/'));

  // 4小節: Combination。タブ切り替えは即時なので頭で呼ぶ
  add(t(bar(4)), 'Combination', () =>
    router.navigate({ pathname: '/(tabs)/combine', params: { ids: FOOD_AJI } }),
  );

  // 5〜7小節: 季節設定。モーダルの fade ぶん手前で呼ぶ
  add(t(bar(5) - LEAD.modalOpen), '季節を開く', () => demoCall('combine.openSeason'));
  add(t(bar(6)), '季節を選ぶ', () => demoCall('combine.pickSeason', DEMO_SEASON));
  add(t(bar(7) - LEAD.modalClose), '季節を閉じる', () => demoCall('combine.closeSeason'));

  // 9〜11小節: ★の差し替え。あじを外し、魚介タブでぶりを選ぶ
  add(t(bar(9)), '★(あじ)を外す → 魚介タブ', () => {
    demoCall('combine.removeChip', FOOD_AJI);
    demoCall('combine.setCatTab', 'gyokai', FOOD_BURI);
  });
  add(t(bar(10)), 'ぶりにカーソル', () => demoCall('combine.tapTile', FOOD_BURI));
  add(t(beat(11, 3)), '決定(1回目: ぶり)', () => demoCall('combine.tapTile', FOOD_BURI));

  // 13〜15小節: カテゴリー横スライド
  add(t(bar(13)), 'カテゴリー→', () => demoCall('combine.slideCat'));
  add(t(bar(14)), 'カテゴリー→', () => demoCall('combine.slideCat'));
  add(t(bar(15)), 'カテゴリー→', () => demoCall('combine.slideCat'));

  // 17小節〜: 検索。入力の開始だけ拍に合わせ、以降は一定間隔
  add(t(bar(17)), '検索を開く', () => demoCall('combine.searchSound'));
  if (DEMO_TYPE_MODE === 'per-char') {
    for (let i = 1; i <= DEMO_QUERY.length; i++) {
      const text = DEMO_QUERY.slice(0, i);
      add(t(bar(18) + (i - 1) * TYPE_INTERVAL_MS), `入力 "${text}"`, () =>
        demoCall('combine.setQueryText', text),
      );
    }
  } else {
    add(t(bar(18)), `入力 "${DEMO_QUERY}"`, () =>
      demoCall('combine.setQueryText', DEMO_QUERY),
    );
  }
  add(t(bar(20)), 'にがうりにカーソル', () => demoCall('combine.tapTile', FOOD_NIGAURI));
  add(t(bar(21)), 'にがうりを決定', () => demoCall('combine.tapTile', FOOD_NIGAURI));
  add(t(bar(22)), '検索を畳む(合成後の五角形を見せる)', () =>
    demoCall('combine.clearSearch'),
  );

  // 23小節3拍目: 決定ボタン(2回目)。点灯 350ms + モーダル遷移で 24小節頭にアドバイス
  add(t(beat(23, 3)), '決定(2回目)→ アドバイスへ', () => demoCall('combine.decide'));

  // 27小節: 手帳。アドバイス(モーダル)を1枚下ろし、その下でタブを切り替える。
  // 閉じ終わりが27小節頭に当たるよう、モーダルの下降ぶん手前で呼ぶ
  add(t(bar(27) - LEAD.adviceDismiss), 'アドバイスを閉じる → 手帳', () => {
    router.dismiss();
    router.navigate('/(tabs)/notebook');
  });
  add(t(bar(29)), '手帳をスクロール', () => demoCall('notebookScroll.by', 260, 900));

  // 31小節: encyclopedia(図鑑)
  add(t(bar(31)), 'encyclopedia(図鑑)', () => demoCall('notebook.segment', 'zukan'));
  add(t(bar(33)), '図鑑をスクロール', () => demoCall('notebookScroll.by', 420, 1200));
  add(t(bar(35)), '図鑑をスクロール', () => demoCall('notebookScroll.by', 420, 1200));

  // 37小節: Guide(解説)
  add(t(bar(37)), 'Guide(解説)', () => demoCall('notebook.segment', 'guide'));
  add(t(bar(39)), '解説をスクロール', () => demoCall('notebookScroll.by', 420, 1200));

  // 41小節: Home(フェードインは Canva 側)
  add(t(bar(41)), 'Home へ', () => router.navigate('/'));

  // 49小節: 起動画面をもう一度。文字が出そろった姿でカットまで留め置く
  add(t(bar(49)), '締めのスプラッシュ', () =>
    demoCall('root.showSplash', ENDING_SPLASH_TOTAL_MS),
  );

  return actions;
}
