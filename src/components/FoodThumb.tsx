/**
 * 食材の小さな顔(図鑑の行・食材詳細用)。
 *
 * 選択タイル(FoodTile)と同じ色の文法の縮小版: 枠と地の色 = 性。
 * 絵は絵文字/頭文字の仮置きで、権利がクリーンなイラストが
 * 用意でき次第ここを差し替える(指示書 8-5)。
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  name: string;
  /** getFoodEmoji の結果。null なら頭文字を出す */
  emoji: string | null;
  /** natureColor(性の色)。参照のみ項目は中立色になる */
  color: string;
  size?: number;
}

export default function FoodThumb({ name, emoji, color, size = 36 }: Props) {
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          borderColor: color,
          backgroundColor: `${color}16`,
        },
      ]}
    >
      {emoji !== null ? (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      ) : (
        <Text style={{ fontSize: size * 0.42, color, fontWeight: '600' }}>
          {[...name][0] ?? ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
