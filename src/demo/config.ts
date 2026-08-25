/**
 * デモモード(Devpost 提出用デモ動画の自動操作)の設定。
 *
 * 本番ビルドでは EXPO_PUBLIC_DEMO を設定しないので DEMO_MODE は常に false。
 * デモ関連のコードはバンドルには含まれるが、実行経路には一切入らない。
 *
 * 起動:  EXPO_PUBLIC_DEMO=1 npx expo start
 */
import type { FiveSeason } from '@/logic/season';

export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === '1';

/** 検索欄への入力方法。per-char で描画が詰まる端末では instant に切り替える */
export const DEMO_TYPE_MODE: 'per-char' | 'instant' = 'per-char';

/** per-char 入力の1文字あたりの間隔(ms)。拍とは無関係に一定 */
export const TYPE_INTERVAL_MS = 120;

/* ---- 台本で使う食材(id は tabenote_foods.json の実際の値) ---- */

/** ★の初期値: あじ(温 / 甘・鹹) */
export const FOOD_AJI = 'f15820a';
/** 差し替え先: ぶり(温 / 甘・酸)。鹹→酸で五角形が動く */
export const FOOD_BURI = 'f404349';
/** 2パターン目で追加: にがうり(寒 / 苦) */
export const FOOD_NIGAURI = 'f9fd7db';

/** 検索語(にがうりの英語名 "Bitter melon")。3文字 "bit" で2件、4文字 "bitt" で一意 */
export const DEMO_QUERY = 'bitter';

/** 季節モーダルで選ぶ季節。撮影時の「今日の季節」と別のものにする(ボタンが緑になる) */
export const DEMO_SEASON: FiveSeason = 'winter';

/**
 * 画面遷移の見込み時間(ms)。「拍の頭で遷移が終わっている」状態を作るため、
 * このぶん手前でタップ相当の呼び出しをする。実機で計測したら、ここを調整する。
 */
export const LEAD = {
  /** 季節モーダルの fade(RN Modal animationType="fade") */
  modalOpen: 300,
  modalClose: 300,
  /** アドバイス(モーダル画面)を閉じて手帳が全面に出るまで */
  adviceDismiss: 500,
} as const;

/** カテゴリーチップ1個ぶんの横スクロール量の目安(px)。撮影時に調整する */
export const DEMO_CHIP_STEP_PX = 66;

/** 手帳・図鑑・解説のスクロール1段階(オーバーレイの⇣ボタン用) */
export const SCROLL_STEP_PX = 320;
export const SCROLL_STEP_MS = 700;

/**
 * 49小節の締めのスプラッシュの合計表示時間(ms)。
 * 十分大きくして、カット(51小節)まで文字が出そろった姿のまま留め置く。
 * 停止ボタンで畳むまで出続ける。
 */
export const ENDING_SPLASH_TOTAL_MS = 10 * 60_000;
