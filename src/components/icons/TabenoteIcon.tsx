import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { brighten } from '@/lib/color';
import { ICONS } from './icons';

/**
 * にじみ(グロー)の重ね方。
 * 線の太さを何倍にした絵を、どれくらいの濃さで下に敷くか。
 * 太く薄い層 → 細く濃い層 の順に重ね、その上に芯を描くとネオン管のように見える。
 * ぼかしは使っていない(react-native-svg のフィルタは環境差が出るため)。
 * 太さは SVG の単位(64 基準)で掛けるので、どのサイズでも見た目の比率は変わらない。
 */
const GLOW_LAYERS = [
  { strokeScale: 5, opacity: 0.13 },
  { strokeScale: 2.6, opacity: 0.22 },
];

/**
 * にじみ用の XML を作る。
 * ・stroke-width をまとめて倍にする(ルートの 2 も path 個別の 1.3 も対象)
 * ・太った線が絵の縁で切れないよう viewBox を上下左右に BLEED ぶん広げる
 *   (層は size * BLEED_RATIO で描いて中央に重ねるので、絵の縮尺は芯と同じ)
 */
const BLEED = 6;
const VIEW = 64;
export const BLEED_RATIO = (VIEW + BLEED * 2) / VIEW;

function glowXml(xml: string, scale: number): string {
  return xml
    .replace(
      /stroke-width="([\d.]+)"/g,
      (_, w: string) => `stroke-width="${(parseFloat(w) * scale).toFixed(2)}"`,
    )
    .replace(
      'viewBox="0 0 64 64"',
      `viewBox="${-BLEED} ${-BLEED} ${VIEW + BLEED * 2} ${VIEW + BLEED * 2}"`,
    );
}

/** 作った XML はアイコンごとに使い回す(グリッドは同じ絵が何枚も並ぶため) */
const glowCache = new Map<string, string>();

function cachedGlowXml(key: string, xml: string, scale: number): string {
  const id = `${key}@${scale}`;
  let made = glowCache.get(id);
  if (made === undefined) {
    made = glowXml(xml, scale);
    glowCache.set(id, made);
  }
  return made;
}

type Props = {
  name: string;          // 食材の icon 値
  size?: number;         // 既定 32
  color?: string;        // 性（寒熱）の色をここに渡す
  fallback?: string;     // 見つからない時に使うカテゴリアイコン
  /** 発光の強さ(0=なし〜1)。暗い配色でだけ効かせる想定 */
  glow?: number;
};

export function TabenoteIcon({
  name,
  size = 32,
  color = '#1a1a1a',
  fallback,
  glow = 0,
}: Props) {
  const key = ICONS[name] !== undefined ? name : (fallback ?? '');
  const xml = ICONS[key];
  const layers = useMemo(
    () =>
      xml === undefined || glow <= 0
        ? []
        : GLOW_LAYERS.map((l) => ({ ...l, xml: cachedGlowXml(key, xml, l.strokeScale) })),
    [key, xml, glow],
  );

  if (!xml) return null;
  if (glow <= 0) return <SvgXml xml={xml} width={size} height={size} color={color} />;

  // 芯は白に寄せる。管の中心が飛んで、外側に色のにじみが残る
  const core = brighten(color, 0.45 * glow);
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      {layers.map((l) => (
        <View
          key={l.strokeScale}
          style={[StyleSheet.absoluteFill, styles.layer, { opacity: l.opacity * glow }]}
          pointerEvents="none"
        >
          <SvgXml
            xml={l.xml}
            width={size * BLEED_RATIO}
            height={size * BLEED_RATIO}
            color={color}
          />
        </View>
      ))}
      <SvgXml xml={xml} width={size} height={size} color={core} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  layer: { alignItems: 'center', justifyContent: 'center' },
});

/** そのキーの絵があるか(無ければ呼び出し側が頭文字などで代替する) */
export function hasIcon(name?: string): boolean {
  return name !== undefined && ICONS[name] !== undefined;
}

export default TabenoteIcon;
