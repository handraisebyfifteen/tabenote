/**
 * 五行相生・相克図(？解説モーダル用)。
 *
 * 外周の赤い矢印 = 相生(木→火→土→金→水→木 と、となりを生み育てるめぐり)。
 * 内側の星形の青い矢印 = 相克(ひとつ飛びの相手のいきすぎをおさえる関係)。
 * 各節は五行の円(木火土金水)+ 対応する臓腑・季節・味。事実の対応のみで効能は書かない。
 *
 * 配置は FlavorPentagon と同じ「木(酸)が真上、時計回り」。
 * 五角形チャートの軸と向きが一致するので、見比べたときに迷わない。
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import { FIVE_FLAVORS } from '../logic/flavors';
import type { FiveSeason } from '../logic/season';
import { fiveFlavorLabel, fiveSeasonChipLabel, type Lang } from '../i18n/terms';

/** 五行(五味の並び順に対応: 酸=木、苦=火、甘=土、辛=金、鹹=水)。円の色は五色の伝統配色に寄せる */
const ELEMENTS: {
  ja: string;
  en: string;
  color: string;
  season: FiveSeason;
  organsJa: string;
  organsEn: string;
}[] = [
  { ja: '木', en: 'Wood', color: '#5E9E63', season: 'spring', organsJa: '肝・胆', organsEn: 'Liver · Gallbladder' },
  { ja: '火', en: 'Fire', color: '#C9563D', season: 'summer', organsJa: '心・小腸', organsEn: 'Heart · Small intestine' },
  { ja: '土', en: 'Earth', color: '#C9A24B', season: 'doyo', organsJa: '脾・胃', organsEn: 'Spleen · Stomach' },
  { ja: '金', en: 'Metal', color: '#9AA0A6', season: 'autumn', organsJa: '肺・大腸', organsEn: 'Lung · Large intestine' },
  { ja: '水', en: 'Water', color: '#4A7FBF', season: 'winter', organsJa: '腎・膀胱', organsEn: 'Kidney · Bladder' },
];

/** 相生の説明(辺 i→i+1 の外側に置く)。矢印の向きが主語を示すので短く */
const SHENG_JA: string[][] = [
  ['木は燃えて', '火を生む'],
  ['火は灰となり', '土を生む'],
  ['土の中から', '金属が出る'],
  ['金属の表面に', '水がつく'],
  ['水は', '木を育てる'],
];
const SHENG_EN: string[][] = [
  ['burns to', 'make fire'],
  ['leaves ash,', 'making earth'],
  ['bears', 'metal'],
  ['condenses', 'water'],
  ['feeds', 'wood'],
];

/** 相克の説明(弦 i→i+2。節 i+1 の内側のすきまに置く) */
const KE_JA: string[][] = [
  ['木は土の', '養分を吸う'],
  ['火は金属を', '溶かす'],
  ['土は水を', 'せきとめる'],
  ['金物は', '木を切る'],
  ['水は火を', '消す'],
];
const KE_EN: string[][] = [['depletes'], ['melts'], ['dams'], ['cuts'], ['quenches']];

const SHENG_COLOR = '#CC6B5A';
const KE_COLOR = '#7FA8CF';

const W = 300;
const H = 320;
const CX = 150;
const CY = 152;
const R = 95;
const NODE_R = 26;

function point(radius: number, angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

/** i番目の節の角度(木を真上に、時計回り) */
function nodeAngle(i: number): number {
  return -90 + i * 72;
}

/** 節の縁から縁へ、矢じり付きの直線矢印 */
function ArrowLine({
  from,
  to,
  color,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const gap = NODE_R + 5;
  const sx = from[0] + ux * gap;
  const sy = from[1] + uy * gap;
  const tx = to[0] - ux * gap;
  const ty = to[1] - uy * gap;
  const bx = tx - ux * 7;
  const by = ty - uy * 7;
  const px = -uy;
  const py = ux;
  return (
    <>
      <Line x1={sx} y1={sy} x2={bx} y2={by} stroke={color} strokeWidth={1.6} />
      <Polygon
        points={`${tx},${ty} ${bx + px * 4.5},${by + py * 4.5} ${bx - px * 4.5},${by - py * 4.5}`}
        fill={color}
      />
    </>
  );
}

/** 全角文字を1、半角を0.55と数えた行の見た目の幅(px換算前) */
function visualLength(line: string): number {
  let n = 0;
  for (const ch of line) n += ch.charCodeAt(0) > 0xff ? 1 : 0.55;
  return n;
}

/** 中央ぞろえの小さな複数行テキスト。bg を渡すと矢印の線の上でも読めるよう背景板を敷く */
function CaptionLines({
  x,
  y,
  lines,
  fontSize,
  fill,
  bg,
}: {
  x: number;
  y: number;
  lines: string[];
  fontSize: number;
  fill: string;
  bg?: string;
}) {
  const lineH = fontSize + 2.5;
  const firstY = y - ((lines.length - 1) * lineH) / 2;
  const width = Math.max(...lines.map(visualLength)) * fontSize + 6;
  return (
    <>
      {bg !== undefined && (
        <Rect
          x={x - width / 2}
          y={firstY - fontSize - 1.5}
          width={width}
          height={lines.length * lineH + 3}
          rx={3}
          fill={bg}
        />
      )}
      {lines.map((line, li) => (
        <SvgText
          key={line}
          x={x}
          y={firstY + li * lineH}
          fontSize={fontSize}
          fill={fill}
          textAnchor="middle"
        >
          {line}
        </SvgText>
      ))}
    </>
  );
}

interface Props {
  lang: Lang;
  labelColor?: string;
  /** 説明文の背景板の色。モーダルの地の色を渡す */
  bgColor?: string;
}

export default function FiveElementsChart({
  lang,
  labelColor = '#8A8F98',
  bgColor = '#FFFFFF',
}: Props) {
  const nodes = ELEMENTS.map((e, i) => ({
    ...e,
    flavor: FIVE_FLAVORS[i],
    pos: point(R, nodeAngle(i)),
  }));
  const sheng = lang === 'ja' ? SHENG_JA : SHENG_EN;
  const ke = lang === 'ja' ? KE_JA : KE_EN;

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H}>
        {/* 相克: ひとつ飛びの節へ(内側の星形) */}
        {nodes.map((n, i) => (
          <ArrowLine
            key={`ke-${n.ja}`}
            from={n.pos}
            to={nodes[(i + 2) % 5].pos}
            color={KE_COLOR}
          />
        ))}
        {ke.map((lines, i) => {
          // 弦 i→i+2 の説明は、節 i+1 の内側の星形のすきまに置く
          const [x, y] = point(50, nodeAngle((i + 1) % 5));
          return (
            <CaptionLines
              key={`kec-${i}`}
              x={x}
              y={y}
              lines={lines}
              fontSize={6.5}
              fill="#5F8FB4"
              bg={bgColor}
            />
          );
        })}
        {/* 相生: となりの節へ(外周) */}
        {nodes.map((n, i) => (
          <ArrowLine
            key={`sheng-${n.ja}`}
            from={n.pos}
            to={nodes[(i + 1) % 5].pos}
            color={SHENG_COLOR}
          />
        ))}
        {sheng.map((lines, i) => {
          // 下辺(土→金)だけ、節のラベルと重ならないようさらに外へ
          const [x, y] = point(i === 2 ? 140 : 130, nodeAngle(i) + 36);
          return (
            <CaptionLines
              key={`shc-${i}`}
              x={x}
              y={y}
              lines={lines}
              fontSize={lang === 'ja' ? 7.5 : 7}
              fill={SHENG_COLOR}
            />
          );
        })}
        {/* 節: 五行の円 + 臓腑 + 季節・味 */}
        {nodes.map((n, i) => {
          const [x, y] = n.pos;
          const seasonLabel = fiveSeasonChipLabel(n.season, lang);
          const flavorLabel = fiveFlavorLabel(n.flavor, lang);
          // ja: 臓腑は円の中、季節・味を外に。en: 円は元素名まで、臓腑は長いので外の行に
          const outLines =
            lang === 'ja'
              ? [`${seasonLabel}・${flavorLabel}`]
              : [`${seasonLabel} · ${flavorLabel}`, n.organsEn];
          const above = i === 0;
          const fs = lang === 'ja' ? 10 : 7.5;
          const half = ((outLines.length - 1) * (fs + 2.5)) / 2;
          const labelY = above ? y - NODE_R - 12 - half : y + NODE_R + 14 + half;
          return (
            <React.Fragment key={n.ja}>
              <Circle cx={x} cy={y} r={NODE_R} fill={n.color} />
              <SvgText
                x={x}
                y={y - 2}
                fontSize={14}
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
              >
                {n.ja}
              </SvgText>
              <SvgText
                x={x}
                y={y + 12}
                fontSize={lang === 'ja' ? 7.5 : 7}
                fill="#fff"
                textAnchor="middle"
              >
                {lang === 'ja' ? n.organsJa : n.en}
              </SvgText>
              <CaptionLines
                x={x}
                y={labelY}
                lines={outLines}
                fontSize={fs}
                fill={labelColor}
                bg={bgColor}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
