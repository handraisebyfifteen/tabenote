/**
 * 食材の小さな顔(図鑑の行・食材詳細用)。
 *
 * 選択タイル(FoodTile)と同じ色の文法の縮小版: 枠と地の色 = 性。
 * 絵は自前の線画アイコン(src/components/icons/icons.ts)で、
 * 食材ごとの icon → カテゴリの catIcon → 頭文字、の順に落とす。
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { TabenoteIcon, hasIcon } from '@/components/icons/TabenoteIcon';
// 寸法は size 由来なので文字サイズ設定は掛けない。書体だけ当てる
import { UnscaledText as Text } from '@/components/Type';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { brighten } from '@/lib/color';

interface Props {
  name: string;
  /** 食材のアイコンキー(Food.icon) */
  icon: string;
  /** カテゴリのアイコンキー(Food.catIcon)。icon が引けない時に使う */
  catIcon: string;
  /** natureColor(性の色)。参照のみ項目は中立色になる */
  color: string;
  size?: number;
}

export default function FoodThumb({ name, icon, catIcon, color, size = 36 }: Props) {
  // 線画は性の色。暗い配色では地に沈むので白に寄せる(FoodTile と同じ扱い)
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const drawColor = dark ? brighten(color, 0.4) : color;
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
      {hasIcon(icon) || hasIcon(catIcon) ? (
        <TabenoteIcon
          name={icon}
          fallback={catIcon}
          size={size * 0.72}
          color={drawColor}
          glow={dark ? 0.55 : 0}
        />
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
