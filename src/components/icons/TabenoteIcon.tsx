import React from 'react';
import { SvgXml } from 'react-native-svg';
import { ICONS } from './icons';

type Props = {
  name: string;          // 食材の icon 値
  size?: number;         // 既定 32
  color?: string;        // 性（寒熱）の色をここに渡す
  fallback?: string;     // 見つからない時に使うカテゴリアイコン
};

export function TabenoteIcon({ name, size = 32, color = '#1a1a1a', fallback }: Props) {
  const xml = ICONS[name] ?? (fallback ? ICONS[fallback] : undefined);
  if (!xml) return null;
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
}

export default TabenoteIcon;
