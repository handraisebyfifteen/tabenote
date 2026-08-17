/**
 * 表示の設定(設定画面「表示」)。配色と文字サイズを持つ。
 *
 *   配色: 'system'(端末に合わせる・既定) / 'light' / 'dark'
 *   表示: 'standard'(既定) / 'large'
 *
 * どちらも AsyncStorage に永続化する。実際の配色の参照は
 * useColorScheme(@/hooks/use-color-scheme)、倍率は useTextScale を使う。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useSystemColorScheme } from '@/hooks/use-system-color-scheme';

export type ThemePref = 'system' | 'light' | 'dark';
export type TextSize = 'standard' | 'large';

const THEME_KEY = 'tabenote/theme/v1';
const TEXT_SIZE_KEY = 'tabenote/textSize/v1';

/**
 * 「大きく」を選んだときの倍率。行間も同じ率で伸びる。
 * iOS のダイナミックタイプで拡大側の上限に当たる 1.3 に合わせている。
 */
const LARGE_TEXT_SCALE = 1.3;

/**
 * 組み合わせタブのマスの列数。
 *
 * 文字だけ大きくして 3 列のままにすると、名前が枠に詰まって前より見にくくなる。
 * 一度に見える数を減らして 1 マスを大きくするところまでが「大きく表示」。
 */
const GRID_COLUMNS = { standard: 3, large: 2 } as const;

type DisplayValue = {
  /** 端末に合わせるか、明示的に固定しているか */
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;
  /** themePref を解決した実際の配色 */
  scheme: 'light' | 'dark';
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  textScale: number;
  /** 組み合わせタブのマスの列数(表示の大きさに連動する) */
  gridColumns: number;
};

const DisplayContext = createContext<DisplayValue>({
  themePref: 'system',
  setThemePref: () => {},
  scheme: 'light',
  textSize: 'standard',
  setTextSize: () => {},
  textScale: 1,
  gridColumns: GRID_COLUMNS.standard,
});

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme();
  const [themePref, setThemePrefState] = useState<ThemePref>('system');
  const [textSize, setTextSizeState] = useState<TextSize>('standard');

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, TEXT_SIZE_KEY]).then((entries) => {
      for (const [key, value] of entries) {
        if (key === THEME_KEY && (value === 'system' || value === 'light' || value === 'dark')) {
          setThemePrefState(value);
        }
        if (key === TEXT_SIZE_KEY && (value === 'standard' || value === 'large')) {
          setTextSizeState(value);
        }
      }
    });
  }, []);

  const setThemePref = (next: ThemePref) => {
    setThemePrefState(next);
    AsyncStorage.setItem(THEME_KEY, next);
  };

  const setTextSize = (next: TextSize) => {
    setTextSizeState(next);
    AsyncStorage.setItem(TEXT_SIZE_KEY, next);
  };

  return (
    <DisplayContext.Provider
      value={{
        themePref,
        setThemePref,
        scheme: themePref === 'system' ? system : themePref,
        textSize,
        setTextSize,
        textScale: textSize === 'large' ? LARGE_TEXT_SCALE : 1,
        gridColumns: GRID_COLUMNS[textSize],
      }}
    >
      {children}
    </DisplayContext.Provider>
  );
}

export function useDisplay() {
  return useContext(DisplayContext);
}

/** 文字サイズの倍率だけが要るとき(@/components/Type 用) */
export function useTextScale() {
  return useContext(DisplayContext).textScale;
}
