/**
 * 節気の「動く風景」(指示書 6-1 のホーム上部)。
 *
 * 24節気それぞれに約10秒でひと回りするループを当て、開くたびに
 * 今日の節気の景色が動いて出る。絵は termScenes.ts の定義から
 * その場で描く(空 = SVGのグラデーション、稜線 = 正弦波、粒子 = View)。
 *
 * 動きは Reanimated 4 の CSS アニメーションで宣言する。粒ひとつに
 * hook を持たせず、キーフレームと負の遅延だけで散らすので、
 * 粒が増えても JS 側の負荷は増えない(すべて UI スレッドで回る)。
 *
 * 「視差効果を減らす」設定のときは静止画として描く。
 */
import { useFocusEffect } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useReducedMotion,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { getTermScene, type ParticleLayer, type Ridge } from '@/data/termScenes';

/**
 * 種から 0〜1 の値を作る(粒ごとの位置・大きさ・速さのばらつき用)。
 * Math.random だと再描画のたびに景色が変わってしまうので使わない。
 */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** 正弦波の稜線。下端まで塗りつぶす */
function ridgePath(w: number, h: number, ridge: Ridge): string {
  const baseY = h * ridge.y;
  const steps = 32;
  let d = `M0 ${(baseY - Math.sin(ridge.phase) * ridge.amp).toFixed(1)}`;
  for (let i = 1; i <= steps; i++) {
    const x = (w * i) / steps;
    const y = baseY - Math.sin((i / steps) * Math.PI * ridge.freq + ridge.phase) * ridge.amp;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L${w.toFixed(1)} ${h.toFixed(1)} L0 ${h.toFixed(1)} Z`;
}

/** 上から下へ。左右に揺れながら、必要なら回る */
function fallFrames(travel: number, sway: number, spin: number): CSSAnimationKeyframes {
  return {
    '0%': { opacity: 0, transform: [{ translateY: 0 }, { translateX: 0 }, { rotate: '0deg' }] },
    '10%': { opacity: 1 },
    '25%': {
      transform: [
        { translateY: travel * 0.25 },
        { translateX: sway },
        { rotate: `${spin * 0.25}deg` },
      ],
    },
    '50%': {
      transform: [
        { translateY: travel * 0.5 },
        { translateX: 0 },
        { rotate: `${spin * 0.5}deg` },
      ],
    },
    '75%': {
      transform: [
        { translateY: travel * 0.75 },
        { translateX: -sway },
        { rotate: `${spin * 0.75}deg` },
      ],
    },
    '90%': { opacity: 1 },
    '100%': {
      opacity: 0,
      transform: [{ translateY: travel }, { translateX: 0 }, { rotate: `${spin}deg` }],
    },
  };
}

/** 上から下へ速く、少し斜めに(粒じたいも進む向きへ傾ける) */
function rainFrames(travel: number, slant: number): CSSAnimationKeyframes {
  return {
    '0%': {
      opacity: 0,
      transform: [{ translateY: 0 }, { translateX: 0 }, { rotate: '-12deg' }],
    },
    '15%': { opacity: 1 },
    '80%': { opacity: 1 },
    '100%': {
      opacity: 0,
      transform: [
        { translateY: travel },
        { translateX: slant },
        { rotate: '-12deg' },
      ],
    },
  };
}

/** 下から上へ。ゆらぎながら消える */
function riseFrames(travel: number, sway: number): CSSAnimationKeyframes {
  return {
    '0%': {
      opacity: 0,
      transform: [{ translateY: 0 }, { translateX: 0 }, { scale: 0.5 }],
    },
    '20%': { opacity: 1 },
    '35%': { transform: [{ translateY: -travel * 0.35 }, { translateX: sway }, { scale: 1 }] },
    '70%': {
      transform: [{ translateY: -travel * 0.7 }, { translateX: -sway }, { scale: 1 }],
    },
    '85%': { opacity: 1 },
    '100%': {
      opacity: 0,
      transform: [{ translateY: -travel }, { translateX: 0 }, { scale: 0.6 }],
    },
  };
}

/** その場で明滅する */
const TWINKLE_FRAMES: CSSAnimationKeyframes = {
  '0%': { opacity: 0.08, transform: [{ scale: 0.5 }] },
  '50%': { opacity: 1, transform: [{ scale: 1 }] },
  '100%': { opacity: 0.08, transform: [{ scale: 0.5 }] },
};

/** 横に流れる帯 */
function driftFrames(travel: number): CSSAnimationKeyframes {
  return {
    '0%': { opacity: 0, transform: [{ translateX: 0 }] },
    '20%': { opacity: 1 },
    '80%': { opacity: 1 },
    '100%': { opacity: 0, transform: [{ translateX: travel }] },
  };
}

/** 形ごとの寸法と角の丸み(小さく描くので、丸みだけで花びら・葉に見せる) */
function shapeStyle(layer: ParticleLayer, size: number) {
  switch (layer.shape) {
    case 'petal':
      return {
        width: size,
        height: size * 0.68,
        borderTopLeftRadius: size,
        borderBottomRightRadius: size,
        borderTopRightRadius: size * 0.3,
        borderBottomLeftRadius: size * 0.3,
      };
    case 'leaf':
      return {
        width: size * 1.15,
        height: size * 0.5,
        borderTopLeftRadius: size,
        borderBottomRightRadius: size,
      };
    case 'line':
      return { width: 1.2, height: size, borderRadius: 1 };
    case 'band':
      return { height: size, borderRadius: size / 2 };
    default:
      return { width: size, height: size, borderRadius: size };
  }
}

interface ParticleProps {
  layer: ParticleLayer;
  seed: number;
  w: number;
  h: number;
  still: boolean;
  /** 別のタブを見ている間は止める */
  paused: boolean;
}

function Particle({ layer, seed, w, h, still, paused }: ParticleProps) {
  const r1 = rand(seed);
  const r2 = rand(seed + 17.3);
  const r3 = rand(seed + 41.9);
  const r4 = rand(seed + 73.1);

  const size = layer.size * (0.6 + r1 * 0.8);
  const duration = layer.duration * (0.75 + r2 * 0.5);
  // 負の遅延で、初回から粒がループの途中の位置に散らばる
  const delay = -duration * r3;

  const base: Record<string, unknown> = {
    position: 'absolute',
    backgroundColor: layer.color,
    opacity: layer.opacity,
    ...shapeStyle(layer, size),
  };

  let frames: CSSAnimationKeyframes;

  switch (layer.kind) {
    case 'fall': {
      base.left = r4 * w;
      base.top = -size * 2;
      frames = fallFrames(h + size * 4, 10 + r1 * 26, layer.spin ?? 0);
      break;
    }
    case 'rain': {
      base.left = r4 * w;
      base.top = -size;
      frames = rainFrames(h + size * 2, -h * 0.2);
      break;
    }
    case 'rise': {
      base.left = r4 * w;
      base.top = h * (0.72 + r2 * 0.2);
      frames = riseFrames(h * (0.45 + r1 * 0.35), 8 + r1 * 18);
      break;
    }
    case 'twinkle': {
      base.left = r4 * w;
      base.top = h * (0.06 + r2 * 0.62);
      frames = TWINKLE_FRAMES;
      break;
    }
    default: {
      // drift: 靄・雲・陽炎。画面幅より広い帯にして、層として見せる
      base.backgroundColor = undefined;
      base.width = w * (0.95 + r1 * 0.6);
      base.left = -w * 0.8;
      base.top = h * (0.1 + r2 * 0.62);
      frames = driftFrames(w * 1.9);
      break;
    }
  }

  // 帯は単色の矩形だと硬い線に見えるので、四方に溶ける楕円のぼかしで描く
  const band =
    layer.kind === 'drift' ? (
      <Svg width={base.width as number} height={size}>
        <Defs>
          <RadialGradient id={`band${seed}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={layer.color} stopOpacity="1" />
            <Stop offset="0.55" stopColor={layer.color} stopOpacity="0.5" />
            <Stop offset="1" stopColor={layer.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect
          width={base.width as number}
          height={size}
          fill={`url(#band${seed})`}
        />
      </Svg>
    ) : null;

  if (still) {
    // 動きを止めるときは、ループの途中で固まった一枚として見せる
    const frozen = { ...base };
    if (layer.kind === 'fall' || layer.kind === 'rain') {
      frozen.top = (frozen.top as number) + h * r3;
    } else if (layer.kind === 'rise') {
      frozen.top = (frozen.top as number) - h * 0.4 * r3;
    } else if (layer.kind === 'drift') {
      frozen.left = (frozen.left as number) + w * 1.2 * r3;
    }
    return <View style={frozen}>{band}</View>;
  }

  return (
    <Animated.View
      style={{
        ...base,
        animationName: frames,
        animationDuration: `${duration.toFixed(2)}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: layer.kind === 'twinkle' ? 'ease-in-out' : 'linear',
        animationDelay: `${delay.toFixed(2)}s`,
        animationPlayState: paused ? 'paused' : 'running',
      }}
    >
      {band}
    </Animated.View>
  );
}

/** 太陽・月のにじみ。ゆっくり息をするように明滅する */
const ORB_FRAMES: CSSAnimationKeyframes = {
  '0%': { opacity: 0.75, transform: [{ scale: 0.94 }] },
  '50%': { opacity: 1, transform: [{ scale: 1.06 }] },
  '100%': { opacity: 0.75, transform: [{ scale: 0.94 }] },
};

interface Props {
  /** 節気の通し番号(0 = 立春 … 23 = 大寒) */
  termIndex: number;
  height: number;
  /** 風景の上に重ねる中身(日付・節気名など) */
  children?: React.ReactNode;
}

export default function TermScene({ termIndex, height, children }: Props) {
  const scene = getTermScene(termIndex);
  const reduced = useReducedMotion();
  const [width, setWidth] = React.useState(0);

  // 別のタブを見ている間まで回し続けない
  const [focused, setFocused] = React.useState(true);
  useFocusEffect(
    React.useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
  };

  const particles = useMemo(() => {
    if (width === 0) return [];
    return scene.layers.flatMap((layer, li) =>
      Array.from({ length: layer.count }, (_, i) => (
        <Particle
          key={`${li}-${i}`}
          layer={layer}
          seed={termIndex * 1000 + li * 100 + i * 7 + 1}
          w={width}
          h={height}
          still={reduced}
          paused={!focused}
        />
      )),
    );
  }, [scene, termIndex, width, height, reduced, focused]);

  const orb = scene.orb;
  const orbR = orb ? orb.r * height : 0;
  // web では SVG の id が文書全体で共有されるので、節気ごとに別名にする
  const skyId = `termSky${termIndex}`;
  const glowId = `termGlow${termIndex}`;
  const scrimId = `termScrim${termIndex}`;

  return (
    <View style={[styles.root, { height }]} onLayout={onLayout}>
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={scene.sky[0]} />
                <Stop offset="0.55" stopColor={scene.sky[1]} />
                <Stop offset="1" stopColor={scene.sky[2]} />
              </LinearGradient>
            </Defs>
            <Rect width={width} height={height} fill={`url(#${skyId})`} />
          </Svg>

          {orb !== null && (
            <>
              <Animated.View
                style={{
                  position: 'absolute',
                  left: orb.x * width - orbR * 3,
                  top: orb.y * height - orbR * 3,
                  width: orbR * 6,
                  height: orbR * 6,
                  ...(reduced
                    ? null
                    : {
                        animationName: ORB_FRAMES,
                        animationDuration: '10s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                        animationPlayState: focused ? 'running' : 'paused',
                      }),
                }}
              >
                <Svg width={orbR * 6} height={orbR * 6}>
                  <Defs>
                    <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
                      <Stop offset="0" stopColor={orb.glow} stopOpacity="0.85" />
                      <Stop offset="0.45" stopColor={orb.glow} stopOpacity="0.28" />
                      <Stop offset="1" stopColor={orb.glow} stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={orbR * 3} cy={orbR * 3} r={orbR * 3} fill={`url(#${glowId})`} />
                  <Circle cx={orbR * 3} cy={orbR * 3} r={orbR} fill={orb.color} />
                </Svg>
              </Animated.View>
            </>
          )}

          {particles}

          <Svg
            width={width}
            height={height}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Defs>
              {/* 文字を読ませるための下側の陰。稜線を潰さない程度に留める */}
              <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#000000" stopOpacity="0.08" />
                <Stop offset="0.75" stopColor="#000000" stopOpacity="0.26" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.58" />
              </LinearGradient>
            </Defs>
            {scene.ridges.map((ridge, i) => (
              <Path key={i} d={ridgePath(width, height, ridge)} fill={ridge.color} />
            ))}
            <Rect width={width} height={height} fill={`url(#${scrimId})`} />
          </Svg>
        </>
      )}

      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
});
