/**
 * 現在の配色の色。設定画面の指定(端末に合わせる/ライト/ダーク)が反映される。
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  return Colors[useColorScheme()];
}
