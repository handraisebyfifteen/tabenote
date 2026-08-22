/**
 * 起動時のワードマーク。Canva の「シフト / 文字ごと / 右向き」を再現したもので、
 * 文字が 1 つずつ右からずれ込みながら現れる。全体で約 1.2 秒。
 *
 * ネイティブのスプラッシュ(app.json)が消えた直後にこれが出る。地の色は
 * どちらも SplashBackground なので、入れ替わりは見えない。
 *
 * 動きは Reanimated の CSS アニメーション(FoodTile・TermScene と同じ書き方)。
 * 文字ごとの遅延は animationDelay で付ける。
 */
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cubicBezier,
  useReducedMotion,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';

import { UnscaledText } from '@/components/Type';
import { SplashBackground, SplashForeground } from '@/constants/theme';

const WORD = 'tabenote';

/** 文字ごとの遅延(ms) */
const STAGGER = 55;
/** 1 文字が動く時間(ms) */
const DURATION = 420;
/** 右から入ってくる距離(px) */
const SHIFT = 22;
/** 出そろってからアプリに渡すまでの余韻(ms) */
const HOLD = 400;

/** 全部出そろうまで。55×7 + 420 = 805ms、余韻を足して約 1.2 秒 */
const RUN = STAGGER * (WORD.length - 1) + DURATION;

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
  /** 出そろって余韻が終わったら呼ばれる */
  onDone: () => void;
};

export default function SplashWordmark({ onDone }: Props) {
  // 「視差効果を減らす」を入れている端末では動かさず、最初から出す。
  // 前庭障害があると、横に滑る動きで実際に気分が悪くなることがある。
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const t = setTimeout(onDone, reduced ? HOLD : RUN + HOLD);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  return (
    // かぶせている間、読み上げが裏のタブへ抜けないようにする(iOS)
    <View style={styles.screen} accessibilityViewIsModal>
      {/* 地が濃い青なので、この間だけ明色に上書きする(外れたら元に戻る) */}
      <StatusBar style="light" />
      {/* 読み上げには 1 語として渡す。1 文字ずつ読まれると意味が壊れる */}
      <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={WORD}>
        {Array.from(WORD).map((ch, i) => (
          <Animated.View
            key={`${ch}-${i}`}
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
            <UnscaledText style={styles.letter}>{ch}</UnscaledText>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SplashBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row' },
  letter: {
    fontSize: 40,
    fontWeight: '500',
    color: SplashForeground,
    // 1 文字ずつ別の View に分けると字間が開いて見えるので、ここで詰め直す
    letterSpacing: -0.7,
  },
});
