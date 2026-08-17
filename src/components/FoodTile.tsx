/**
 * 食材タイル — キャラ選択グリッドの1マス(指示書 6-2 の視覚化)。
 *
 * 参考はレースゲーム/格闘ゲームのキャラ選択画面:
 *   枠と地の色 = 性(寒熱)。術語は出さず色だけで伝える。
 *   1タップ = カーソル(プレビュー)、2タップ目 = 決定、長押し = ★よく使う。
 *   名前はタイル右下に小さく。
 *
 * ビジュアルは差し替え可能なスロット:
 * いまは絵文字/頭文字の仮置きで、権利がクリーンなイラストが
 * 用意でき次第そこだけ画像に置き換える(指示書 8-5)。
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/** 性の色(#RRGGBB)を白に寄せて明るくする。カーソル/選択の枠を「光った」見た目にするため */
function brighten(hex: string, ratio: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * ratio);
  const r = mix((n >> 16) & 0xff);
  const g = mix((n >> 8) & 0xff);
  const b = mix(n & 0xff);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface Props {
  /** 表示名(言語解決済み) */
  name: string;
  /** 仮ビジュアル。null なら頭文字のモノグラム */
  emoji: string | null;
  /** 性の色(FlavorPentagon.natureColor) */
  color: string;
  selected: boolean;
  /** カーソルが乗っている(1タップ目)状態 */
  focused: boolean;
  starred: boolean;
  nameColor: string;
  onPress: () => void;
  onLongPress: () => void;
}

export default function FoodTile({
  name,
  emoji,
  color,
  selected,
  focused,
  starred,
  nameColor,
  onPress,
  onLongPress,
}: Props) {
  return (
    <View style={styles.cell}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.tile,
          {
            // カーソル/選択中は枠を白寄りに明るくして「点灯」を分からせる
            borderColor: focused || selected ? brighten(color, 0.45) : color,
            backgroundColor: color + (selected ? '38' : focused ? '2A' : '16'),
            // 普通(1.25)だと性の色が判別しづらいため、ボールド(3)手前の 2 を既定にする
            borderWidth: selected ? 3.5 : focused ? 3 : 2,
          },
          // 発光。boxShadow は New Architecture 前提(Expo 57 の既定)
          (focused || selected) && { boxShadow: `0 0 12px 2px ${color}` },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        {starred && <Text style={styles.star}>★</Text>}
        {selected && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
        )}
        <View style={styles.visual}>
          {emoji !== null ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Text style={[styles.monogram, { color }]}>{name.slice(0, 1)}</Text>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.name, { color: nameColor }]}>
          {name}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { width: '25%', padding: 4 },
  tile: {
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  visual: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // userSelect: Webのダブルタップで文字が範囲選択されるのを防ぐ(ネイティブでは無視される)
  emoji: { fontSize: 30, userSelect: 'none' },
  monogram: { fontSize: 26, fontWeight: '700', userSelect: 'none' },
  name: {
    fontSize: 10,
    textAlign: 'right',
    paddingHorizontal: 6,
    paddingBottom: 4,
    userSelect: 'none',
  },
  star: {
    position: 'absolute',
    top: 3,
    left: 6,
    fontSize: 11,
    color: '#D9A441',
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
