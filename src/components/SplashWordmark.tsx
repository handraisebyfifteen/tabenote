/**
 * 起動時のワードマーク。地は単色ではなく、その日の二十四節気の空
 * (data/termScenes の sky)。ホームのヒーローと同じグラデーションなので、
 * 幕が右へ捌けたとき、下から同じ空が続けて現れる。
 *
 * ネイティブのスプラッシュ(app.json の朱地に、五味の花を生成り一色へ
 * 型染めで抜いたもの。アイコンの生成り地から色が切り替わるので、暖簾が
 * 一枚下りたように出る)が消えた直後にこれが出る。地の色が違うので
 * 入れ替わりは見え、iOS は fade で溶かして繋ぐ
 * (hooks/use-app-fonts.ts)。Android の fade は SDK 57 では効かない。
 *
 * 文字は Canva の「シフト / 文字ごと / 右向き」で現れる(従来のまま)。
 * 出そろって少し置いたら一文字ずつ右へ捌け、最後に幕ごと右へ引く。
 *
 *   0 ──────── 805 ────── 1065 ───── 1155 ────── 1515(ms)
 *   文字が出そろう  余韻      捌け始め    幕が動く     アプリへ
 *
 * 動きは Reanimated の CSS アニメーション(FoodTile・TermScene と同じ
 * 書き方)。文字ごとの遅延は animationDelay で付ける。
 */
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cubicBezier,
  useReducedMotion,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { UnscaledText } from '@/components/Type';
import { TERM_SCENES } from '@/data/termScenes';
import { getToday } from '@/logic/today';

const WORD = 'tabenote';

// 節気の判定は 72 回の二分探索で軽くない。hideAsync() と同じフレームに
// 乗せないよう、モジュールの読み込み時(ネイティブのスプラッシュが出て
// いる間)に済ませておく。getToday は暦日でキャッシュされるので、この
// 結果はホーム側とも共有される
const TERM_INDEX = getToday().termInfo.current.term.index;
const SCENE = TERM_SCENES[TERM_INDEX];

/**
 * 文字色は陰陽で使い分ける。冬至に一陽が生じ、夏至に一陰が生じる伝統の
 * 区分なので、境目は立春・立秋ではなく冬至・夏至。
 *   陽(冬至〜芒種): 白。淡い空の節気だけ、黒い暗幕を読める濃さまで敷く
 *   陰(夏至〜大雪): 濃紺。暗幕なしで全節気が 4.5:1 を超える
 */
const IS_YANG = TERM_INDEX >= 21 || TERM_INDEX <= 8;

/**
 * 陽の節気で、白が空の中間色(sky[1])に対して 3:1(大きな文字の AA)に
 * 届くまでの暗幕の濃さ。実測値。載っていない節気は暗幕なしで届く
 */
const YANG_SCRIM: { [termIndex: number]: number } = {
  0: 0.2, // 立春
  2: 0.26, // 啓蟄
  3: 0.31, // 春分
  4: 0.13, // 清明
  6: 0.16, // 立夏
  7: 0.17, // 小満
  8: 0.03, // 芒種
};

const INK = IS_YANG ? '#FFFFFF' : '#050A14';
const SCRIM = IS_YANG ? (YANG_SCRIM[TERM_INDEX] ?? 0) : 0;

/** 文字ごとの遅延(ms) */
const STAGGER = 55;
/** 1 文字が入ってくる時間(ms) */
const DURATION = 420;
/** 右から入ってくる距離(px) */
const SHIFT = 22;
/** 全部出そろうまで。55×7 + 420 = 805ms */
const RUN = STAGGER * (WORD.length - 1) + DURATION;
/** 出そろってから捌け始めるまでの余韻(ms) */
const HOLD = 260;
/** 文字が右へ抜け始める時刻 = 1065ms */
const OUT_START = RUN + HOLD;
/** 捌けの、文字ごとの遅延(ms)。入りより詰めて軽く逃がす */
const OUT_STAGGER = 30;
/** 1 文字が抜ける時間(ms) */
const OUT_DURATION = 240;
/** 捌け始めてから幕が動き出すまで(ms) */
const PANEL_DELAY = 90;
const PANEL_START = OUT_START + PANEL_DELAY;
/** 幕が右へ引き切る時間(ms) */
const PANEL_DURATION = 360;
/** アプリに渡す時刻 = 1515ms */
const TOTAL = PANEL_START + PANEL_DURATION;
/** 「視差効果を減らす」端末での表示時間(ms) */
const REDUCED_HOLD = 400;

const SHIFT_FRAMES: CSSAnimationKeyframes = {
  '0%': {
    opacity: 0,
    transform: [{ translateX: SHIFT }],
    // 入り際が速く、止まり際がゆるやかになる曲線。animationTimingFunction は
    // インラインの style だと定型の名前しか型が通らないので、ここに書く
    animationTimingFunction: cubicBezier(0.22, 1, 0.36, 1),
  },
  '100%': { opacity: 1, transform: [{ translateX: 0 }] },
};

type Props = {
  /** 幕が引き切ったら呼ばれる */
  onDone: () => void;
  /**
   * 合計表示時間の下限(ms)。TOTAL より長いぶんは「出そろった姿」の余韻に
   * 足される(捌けと幕引きが後ろへずれる)。デモモードの再表示専用で、
   * 通常起動では渡さない(渡さなければ従来どおり)。
   */
  minTotalMs?: number;
};

export default function SplashWordmark({ onDone, minTotalMs }: Props) {
  // 「視差効果を減らす」を入れている端末では動かさず、最初から出して
  // 短く引き上げる。前庭障害があると、横に滑る動きで実際に気分が悪く
  // なることがある
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();

  // デモモードで指定された長さまで、余韻(HOLD)を引き延ばす
  const extraHold = Math.max(0, (minTotalMs ?? 0) - TOTAL);

  React.useEffect(() => {
    const t = setTimeout(onDone, (reduced ? REDUCED_HOLD : TOTAL) + extraHold);
    return () => clearTimeout(t);
  }, [onDone, reduced, extraHold]);

  // 捌けの距離は画面幅から取る。文字は幅の 3 割、幕は幅ごと右へ
  const outFrames = React.useMemo<CSSAnimationKeyframes>(
    () => ({
      '0%': {
        opacity: 1,
        transform: [{ translateX: 0 }],
        // 入りと逆で、出だしがゆるく抜け際が速い曲線
        animationTimingFunction: cubicBezier(0.5, 0, 0.85, 0.4),
      },
      '100%': { opacity: 0, transform: [{ translateX: width * 0.3 }] },
    }),
    [width],
  );
  const panelFrames = React.useMemo<CSSAnimationKeyframes>(
    () => ({
      '0%': {
        transform: [{ translateX: 0 }],
        animationTimingFunction: cubicBezier(0.4, 0, 0.2, 1),
      },
      '100%': { transform: [{ translateX: width * 1.05 }] },
    }),
    [width],
  );

  return (
    // かぶせている間、読み上げが裏のタブへ抜けないようにする(iOS)
    <Animated.View
      style={[
        styles.screen,
        !reduced && {
          animationName: panelFrames,
          animationDuration: `${PANEL_DURATION}ms`,
          animationDelay: `${PANEL_START + extraHold}ms`,
          // 動き出すまでは素の位置。引き切った姿のまま onDone を待つ
          animationFillMode: 'forwards',
        },
      ]}
      accessibilityViewIsModal
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="splashSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SCENE.sky[0]} />
            <Stop offset="0.55" stopColor={SCENE.sky[1]} />
            <Stop offset="1" stopColor={SCENE.sky[2]} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#splashSky)" />
      </Svg>
      {SCRIM > 0 && (
        // 淡い空の陽の節気だけ、白が読めるまで薄く暗くする
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', opacity: SCRIM }]} />
      )}
      {/* 文字と同じ理屈で、陽は明色・陰は暗色のアイコンにする(外れたら元に戻る) */}
      <StatusBar style={IS_YANG ? 'light' : 'dark'} />
      {/* 読み上げには 1 語として渡す。1 文字ずつ読まれると意味が壊れる */}
      <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={WORD}>
        {Array.from(WORD).map((ch, i) => (
          // 外の View が捌け、中の View が入りを受け持つ(移動量は足し合わさる)。
          // 1 つの View に 2 本のアニメーションを重ねると、fillMode の効き方
          // しだいで入りの姿を捌けの 0% が上書きしてしまうので分けている
          <Animated.View
            key={`${ch}-${i}`}
            style={[
              !reduced && {
                animationName: outFrames,
                animationDuration: `${OUT_DURATION}ms`,
                animationDelay: `${OUT_START + extraHold + i * OUT_STAGGER}ms`,
                // 始まるまでは素の姿(=入りの終わりと同じ)で待つ
                animationFillMode: 'forwards',
              },
            ]}
          >
            <Animated.View
              style={[
                !reduced && {
                  animationName: SHIFT_FRAMES,
                  animationDuration: `${DURATION}ms`,
                  animationDelay: `${i * STAGGER}ms`,
                  // 遅延の間は 0%(透明・右にずれた姿)で待たせる
                  animationFillMode: 'both',
                },
              ]}
            >
              <UnscaledText style={[styles.letter, { color: INK }]}>{ch}</UnscaledText>
            </Animated.View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // 空は Svg が描く。Svg が乗る前の一瞬に裏が透けないよう、中間色を敷く
    backgroundColor: SCENE.sky[1],
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row' },
  letter: {
    fontSize: 40,
    fontWeight: '500',
    // 1 文字ずつ別の View に分けると字間が開いて見えるので、ここで詰め直す
    letterSpacing: -0.7,
  },
});
