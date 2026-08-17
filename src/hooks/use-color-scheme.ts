/**
 * 画面が参照する配色。端末の設定ではなく、設定画面の指定を解決した結果を返す。
 * 端末の生の値は @/hooks/use-system-color-scheme。
 */
import { useDisplay } from '@/lib/DisplayContext';

export function useColorScheme(): 'light' | 'dark' {
  return useDisplay().scheme;
}
