/**
 * 文字サイズ設定(設定画面「表示」)を反映する Text / TextInput。
 *
 * react-native から直接 import する代わりにこちらを使うと、style の
 * fontSize / lineHeight に表示倍率が掛かる。fontSize を書いていない Text も
 * 既定の 14 を基準に拡大する。
 *
 * 五角形・五行図のラベルは react-native-svg の Text で、座標と噛み合っているため
 * ここでは扱わない(倍率を掛けると図がずれる)。
 */
import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useTextScale } from '@/lib/DisplayContext';

/** react-native の既定文字サイズ */
const BASE_FONT_SIZE = 14;

export function scaleTextStyle(
  style: StyleProp<TextStyle>,
  scale: number,
): StyleProp<TextStyle> {
  if (scale === 1) return style;
  const flat = StyleSheet.flatten(style) ?? {};
  const base = typeof flat.fontSize === 'number' ? flat.fontSize : BASE_FONT_SIZE;
  const scaled: TextStyle = { ...flat, fontSize: Math.round(base * scale) };
  if (typeof flat.lineHeight === 'number') {
    scaled.lineHeight = Math.round(flat.lineHeight * scale);
  }
  return scaled;
}

export function Text({ style, ...rest }: TextProps) {
  const scale = useTextScale();
  return <RNText style={scaleTextStyle(style, scale)} {...rest} />;
}

export function TextInput({ style, ...rest }: TextInputProps) {
  const scale = useTextScale();
  return <RNTextInput style={scaleTextStyle(style, scale)} {...rest} />;
}
