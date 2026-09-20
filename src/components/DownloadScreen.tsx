import React from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_STORE_URL, ANDROID_STORE_URL, PRIVACY_URL, SUPPORT_URL, TERMS_URL } from '@/constants/site';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import PageHead from './PageHead';
import { Text } from './Type';

export default function DownloadScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const japanese = lang === 'ja';

  const labels = japanese
    ? {
        title: 'tabenoteをアプリで使う',
        body: 'tabenoteは、食材選びと季節の記録を楽しむためのモバイルアプリです。',
        note: 'Web版は提供していません。お使いの端末に合わせてアプリを入手してください。',
        ios: 'App Storeから入手',
        android: 'Google Playから入手',
        iosSoon: 'iOS版はApp Storeで準備中です',
        support: 'サポート',
        terms: '利用規約',
        privacy: 'プライバシー',
      }
    : {
        title: 'Use tabenote in the app',
        body: 'tabenote is a mobile app for choosing ingredients and keeping seasonal notes.',
        note: 'There is no web version. Get the app for your device below.',
        ios: 'Get it on the App Store',
        android: 'Get it on Google Play',
        iosSoon: 'The iOS app is coming to the App Store',
        support: 'Support',
        terms: 'Terms',
        privacy: 'Privacy',
      };

  const open = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <PageHead
        title={japanese ? 'tabenote — モバイルアプリ' : 'tabenote — mobile app'}
        description={
          japanese
            ? 'tabenoteはiOS・Android向けの食材選びの手帳です。'
            : 'tabenote is an ingredient notebook for iOS and Android.'
        }
        path="/"
      />
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.icon}
          accessibilityLabel="tabenote"
        />
        <Text style={[styles.title, { color: c.text }]}>{labels.title}</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{labels.body}</Text>
        <Text style={[styles.note, { color: c.textSecondary }]}>{labels.note}</Text>

        <View style={styles.links}>
          {APP_STORE_URL ? (
            <Pressable
              accessibilityRole="link"
              style={[styles.button, { backgroundColor: '#111111' }]}
              onPress={() => open(APP_STORE_URL)}
            >
              <Text style={styles.buttonText}>{labels.ios}</Text>
            </Pressable>
          ) : (
            <View style={[styles.button, styles.disabled, { backgroundColor: c.backgroundElement }]}>
              <Text style={[styles.buttonText, { color: c.textSecondary }]}>{labels.iosSoon}</Text>
            </View>
          )}
          <Pressable
            accessibilityRole="link"
            style={[styles.button, { backgroundColor: '#6B8F71' }]}
            onPress={() => open(ANDROID_STORE_URL)}
          >
            <Text style={styles.buttonText}>{labels.android}</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          {[
            [labels.support, SUPPORT_URL],
            [labels.terms, TERMS_URL],
            [labels.privacy, PRIVACY_URL],
          ].map(([label, url]) => (
            <Pressable key={url} onPress={() => open(url)} hitSlop={8}>
              <Text style={[styles.footerLink, { color: c.textSecondary }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  icon: { width: 128, height: 128, borderRadius: 28, marginTop: 24 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  note: { fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 520 },
  links: { width: '100%', maxWidth: 420, gap: 10, marginTop: 12 },
  button: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  disabled: { borderWidth: 1, borderColor: '#D5D9DE' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 20 },
  footerLink: { fontSize: 13, textDecorationLine: 'underline' },
});