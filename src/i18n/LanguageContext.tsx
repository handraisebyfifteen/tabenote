/**
 * 表示言語の状態(指示書 6-4「言語」/ 6-6)。
 *
 * 既定は英語。端末の言語が日本語のときだけ日本語で開く(deviceLang.ts)。
 * 設定で選んだ言語は AsyncStorage に永続化し、端末の言語より優先する。
 *
 * iOS が端末の言語を返すのは、app.json の expo-localization に
 * supportedLocales(= CFBundleLocalizations)で en / ja を宣言しているから。
 * 宣言がないと Locale.preferredLanguages が開発地域(en)しか返さず、
 * 日本語端末でも英語で開いてしまう。ネイティブの再ビルドが要る設定。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { pickLang } from './deviceLang';
import type { Lang } from './terms';

const LANG_KEY = 'tabenote/lang/v1';

/** 端末の言語から既定値を決める。日本語端末だけ ja、それ以外はすべて en */
export function deviceDefaultLang(): Lang {
  try {
    return pickLang(getLocales());
  } catch {
    // 端末が存在しない環境(web の静的書き出しなど)。既定の英語に倒す
    return 'en';
  }
}

// Provider の外で読まれたときの値。国外向けのアプリなので英語に倒す
const LanguageContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // web は静的書き出しの HTML が英語で固定(書き出し機のロケールで公開サイトが
  // 変わっては困る)なので、初期値も英語に揃える。端末の言語を見るのは水和のあと。
  // ネイティブは書き出しがないので最初から端末に合わせてよい
  const [lang, setLangState] = useState<Lang>(() =>
    Platform.OS === 'web' ? 'en' : deviceDefaultLang(),
  );

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(LANG_KEY)
      .catch(() => null)
      .then((v) => {
        if (!alive) return;
        if (v === 'ja' || v === 'en') setLangState(v);
        else if (Platform.OS === 'web') setLangState(deviceDefaultLang());
      });
    return () => {
      alive = false;
    };
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
