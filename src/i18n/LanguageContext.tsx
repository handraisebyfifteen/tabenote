/**
 * 表示言語の状態(指示書 6-4「言語」/ 6-6)。
 * 既定は日本語。選択は AsyncStorage に永続化する。
 *
 * 注: 参照データの食材名は日本語のみ(英語名のデータ整備は別途)。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import type { Lang } from './terms';

const LANG_KEY = 'tabenote/lang/v1';

const LanguageContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: 'ja',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ja');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((v) => {
      if (v === 'ja' || v === 'en') setLangState(v);
    });
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
