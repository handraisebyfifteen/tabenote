/**
 * 書体(Lexend)と文字サイズ設定(設定画面「表示」)を反映する Text / TextInput。
 *
 * react-native から直接 import する代わりにこちらを使うと、
 *   ・style の fontWeight に対応する Lexend のファミリが入る
 *   ・style の fontSize / lineHeight に表示倍率が掛かる
 * の両方が効く。fontSize を書いていない Text も既定の 14 を基準に拡大する。
 *
 * 倍率を掛けたくない場所(マス目由来の寸法など)は UnscaledText を使う。
 * 書体だけ当たり、文字サイズ設定は素通りする。
 *
 * 五角形・五行図のラベルは react-native-svg の Text で、座標と噛み合っているため
 * ここでは扱わない(倍率を掛けると図がずれる)。書体だけは、英語表示のときに
 * 欧文が混ざるので各図で fontFamily={lexendFamily(...)} を直接指定している。
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

import { lexendFamily } from '@/constants/typography';
import { useTextScale } from '@/lib/DisplayContext';

/** react-native の既定文字サイズ */
const BASE_FONT_SIZE = 14;

/**
 * 書体と表示倍率を style に流し込む。
 *
 * fontWeight は fontFamily に畳んでから落とす。ウェイトごとに別ファミリを
 * 読み込んでいるので、fontWeight を残すと Android が合成ボールドを重ねて
 * 太くなりすぎる。fontFamily を自分で指定している style(等幅など)は
 * 意図があるとみなして触らない。
 */
export function resolveTextStyle(
  style: StyleProp<TextStyle>,
  scale: number,
): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style) ?? {};
  const { fontWeight, ...rest } = flat;
  const out: TextStyle = rest.fontFamily
    ? { ...rest, fontWeight }
    : { ...rest, fontFamily: lexendFamily(fontWeight) };

  if (scale !== 1) {
    const base = typeof out.fontSize === 'number' ? out.fontSize : BASE_FONT_SIZE;
    out.fontSize = Math.round(base * scale);
    if (typeof out.lineHeight === 'number') {
      out.lineHeight = Math.round(out.lineHeight * scale);
    }
  }
  return out;
}

export function Text({ style, ...rest }: TextProps) {
  const scale = useTextScale();
  return <RNText style={resolveTextStyle(style, scale)} {...rest} />;
}

export function TextInput({ style, ...rest }: TextInputProps) {
  const scale = useTextScale();
  return <RNTextInput style={resolveTextStyle(style, scale)} {...rest} />;
}

/** 書体だけ当てる Text。寸法を別のところ(マスの大きさ等)から決めている場所用 */
export function UnscaledText({ style, ...rest }: TextProps) {
  return <RNText style={resolveTextStyle(style, 1)} {...rest} />;
}
