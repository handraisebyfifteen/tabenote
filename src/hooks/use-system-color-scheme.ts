/** 端末の配色設定。アプリ内の設定を被せる前の生の値(@/lib/DisplayContext 用) */
import { useColorScheme } from 'react-native';

export function useSystemColorScheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
