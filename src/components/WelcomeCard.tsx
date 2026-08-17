/**
 * Web 初回訪問の歓迎カード(指示書外・公開サイト用)。
 *
 * tabenote.app はアプリそのものが公開サイトなので、初めての訪問者は説明なしで
 * ホームに落ちる。その最初の一回だけ、ホームの先頭で名乗って紹介ページ(/about)へ
 * 案内する。ネイティブの初回は Onboarding(ハードペイウォール)が受け持つため web 限定。
 *
 * 静的書き出しでは描画されない(初期状態が非表示で、AsyncStorage を読めた後に
 * だけ出る)ので、検索エンジンが見る本文には混ざらない。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Type';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';

const ACCENT = '#8FAF8B';

/** 一度閉じたら二度と出さない(値は使わず、キーの有無だけ見る) */
const SEEN_KEY = 'tabenote/welcome-seen/v1';

export default function WelcomeCard() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let alive = true;
    AsyncStorage.getItem(SEEN_KEY)
      .then((seen) => {
        if (alive && seen == null) setVisible(true);
      })
      .catch(() => {
        // 読めない環境(プライベートブラウズ等)では出さないだけでよい
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    AsyncStorage.setItem(SEEN_KEY, '1').catch(() => {});
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.backgroundElement, borderColor: ACCENT },
      ]}
    >
      <Text style={[styles.title, { color: c.text }]}>{t.welcome.title}</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {t.welcome.body}
      </Text>
      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, { backgroundColor: ACCENT }]}
          accessibilityRole="button"
          onPress={() => {
            dismiss();
            router.push('/about');
          }}
        >
          <Text style={styles.buttonLabel}>{t.welcome.about}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: c.backgroundSelected }]}
          accessibilityRole="button"
          onPress={dismiss}
        >
          <Text style={[styles.buttonLabel, { color: c.text }]}>
            {t.welcome.start}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 6 },
  title: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 20 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
