/**
 * 性(寒熱)のスケールバー — 組み合わせ画面の凡例。
 *
 * タイルや五角形の色が何を意味するかを、温度計のような
 * 縦のグラデーションで示す(上=熱・暖色 → 下=寒・寒色)。
 * natureLevel を渡すと、いまの組み合わせの位置に ▶ マーカーが出る。
 * 数値は出さない(指示書 5-2: 性は色のグラデーションで表現する)。
 */
import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
  Line,
  Text as SvgText,
} from 'react-native-svg';

import { NATURE_COLORS } from './FlavorPentagon';

/** 上から下へ(熱 → 寒)の順 */
const LEVELS = [2, 1, 0, -1, -2] as const;

interface Props {
  /** averageNatureLevel の結果(-2〜+2)。null ならマーカーなし */
  natureLevel: number | null;
  /** 上(熱)から下(寒)の順のラベル5つ */
  labels: [string, string, string, string, string];
  height?: number;
  /** マーカーの色(本文の文字色を想定) */
  markerColor: string;
  labelColor: string;
}

export default function NatureScale({
  natureLevel,
  labels,
  height = 140,
  markerColor,
  labelColor,
}: Props) {
  const markerW = 9;
  const barW = 12;
  const gap = 5;
  // 英語ラベル(Warming 等)は長いので幅を広げる
  const isWide = labels.some((l) => l.length > 2);
  const labelW = isWide ? 40 : 14;
  const width = markerW + barW + gap + labelW;
  // 上下に余白を取り、各レベルの中心をバー内に収める
  const inset = 8;
  const levelY = (level: number): number =>
    inset + ((2 - level) / 4) * (height - inset * 2);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient
            id="natureScale"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={inset}
            x2={0}
            y2={height - inset}
          >
            {LEVELS.map((level, i) => (
              <Stop
                key={level}
                offset={i / (LEVELS.length - 1)}
                stopColor={NATURE_COLORS[level]}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={markerW}
          y={0}
          width={barW}
          height={height}
          rx={barW / 2}
          fill="url(#natureScale)"
        />
        {LEVELS.map((level, i) => {
          const y = levelY(level);
          return (
            <React.Fragment key={level}>
              <Line
                x1={markerW + barW}
                y1={y}
                x2={markerW + barW + 3}
                y2={y}
                stroke={labelColor}
                strokeWidth={1}
              />
              <SvgText
                x={markerW + barW + gap}
                y={y + 3.5}
                fontSize={isWide ? 8 : 10}
                fill={labelColor}
                textAnchor="start"
              >
                {labels[i]}
              </SvgText>
            </React.Fragment>
          );
        })}
        {natureLevel !== null && (
          <Polygon
            points={`0,${levelY(natureLevel) - 5} ${markerW - 1},${levelY(natureLevel)} 0,${levelY(natureLevel) + 5}`}
            fill={markerColor}
          />
        )}
      </Svg>
    </View>
  );
}
