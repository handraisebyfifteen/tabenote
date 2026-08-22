/**
 * 五角形チャート(指示書 6-5)。
 *
 *   軸 = 五味(酸・苦・甘・辛・鹹)
 *   形 = 五味の分布
 *   色 = 性(寒熱)の傾向(温=暖色、寒=寒色)
 *   季節の推奨形を点線で背景に重ねる
 *   数値は表示しない(内部計算のみ)
 *
 * 食材単体でも表示できる(図鑑用途)。
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';

import { lexendFamily } from '@/constants/typography';

import { FIVE_FLAVORS, type FiveFlavor, type FlavorTotals } from '../logic/flavors';

/** 性レベル(-2〜+2)→ 色。寒色〜暖色のグラデーション */
export const NATURE_COLORS: Record<number, string> = {
  [-2]: '#4A7FBF', // 寒
  [-1]: '#7FA8CF', // 涼
  [0]: '#8FAF8B', // 平
  [1]: '#DE9A5A', // 温
  [2]: '#C9563D', // 熱
};

const NEUTRAL_COLOR = '#9AA0A6';

export function natureColor(level: number | null): string {
  if (level === null) return NEUTRAL_COLOR;
  return NATURE_COLORS[level] ?? NEUTRAL_COLOR;
}

interface Props {
  totals: FlavorTotals;
  /** averageNatureLevel の結果(-2〜+2)。null なら中立色 */
  natureLevel: number | null;
  /** 季節の推奨味。渡すと点線の推奨形を背景に重ねる */
  seasonFlavors?: FiveFlavor[];
  /** 軸ラベル(酸〜鹹の順)。省略時は漢字。英語など長いラベルは自動で縮小する */
  axisLabels?: [string, string, string, string, string];
  size?: number;
  labelColor?: string;
  gridColor?: string;
}

/** i番目の軸の座標(酸を真上に、時計回りに 苦・甘・辛・鹹) */
function axisPoint(center: number, radius: number, i: number): [number, number] {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return [center + radius * Math.cos(angle), center + radius * Math.sin(angle)];
}

function polygonPoints(center: number, radii: number[]): string {
  return radii
    .map((r, i) => axisPoint(center, r, i))
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
}

export default function FlavorPentagon({
  totals,
  natureLevel,
  seasonFlavors,
  axisLabels,
  size = 240,
  labelColor = '#8A8F98',
  gridColor = '#D5D9DE',
}: Props) {
  const center = size / 2;
  const labelMargin = 22;
  const R = center - labelMargin;

  const values = FIVE_FLAVORS.map((f) => totals[f]);
  const maxValue = Math.max(...values);
  const hasShape = maxValue > 0;

  const color = natureColor(natureLevel);

  // データの形: 最大の軸を 90% として相対的に描く(数値は見せないため相対で十分)
  const dataRadii = values.map((v) => (hasShape ? (v / maxValue) * R * 0.9 : 0));

  // 季節の推奨形: 推奨味を 80%、それ以外を 25% に置いた定型の形
  const seasonRadii = seasonFlavors
    ? FIVE_FLAVORS.map((f) => (seasonFlavors.includes(f) ? R * 0.8 : R * 0.25))
    : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* 目盛り(数値なしの網) */}
        {[1 / 3, 2 / 3, 1].map((frac) => (
          <Polygon
            key={frac}
            points={polygonPoints(center, FIVE_FLAVORS.map(() => R * frac))}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        ))}
        {/* 軸線 */}
        {FIVE_FLAVORS.map((f, i) => {
          const [x, y] = axisPoint(center, R, i);
          return (
            <Line
              key={f}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
            />
          );
        })}
        {/* 季節の推奨形(点線) */}
        {seasonRadii && (
          <Polygon
            points={polygonPoints(center, seasonRadii)}
            fill="none"
            stroke={labelColor}
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}
        {/* 選択中の構成の形 */}
        {hasShape && (
          <Polygon
            points={polygonPoints(center, dataRadii)}
            fill={color}
            fillOpacity={0.4}
            stroke={color}
            strokeWidth={2}
          />
        )}
        {/* 軸ラベル */}
        {FIVE_FLAVORS.map((f, i) => {
          const [x, y] = axisPoint(center, R + 13, i);
          const label = axisLabels ? axisLabels[i] : f;
          return (
            <SvgText
              key={f}
              x={x}
              y={y + 4}
              fontSize={label.length > 2 ? 9 : 13}
              fontFamily={lexendFamily('400')}
              fill={labelColor}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
