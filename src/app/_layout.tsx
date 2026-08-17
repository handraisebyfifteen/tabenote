import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import Onboarding from '@/components/Onboarding';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider, useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { BillingProvider, useBilling } from '@/lib/BillingContext';
import { DisplayProvider } from '@/lib/DisplayContext';
import { SoundProvider } from '@/lib/SoundContext';

function RootStack() {
  const { lang } = useLang();
  const t = getStrings(lang);
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // 全機能有料(申請準備指示書・2026-08-17 決定)。未購読の間はタブを出さず、
  // オンボーディング→購読案内で覆う。課金が無効な環境(Web・キー未設定)では掛からない。
  const { enabled, ready, active } = useBilling();
  if (enabled && !ready) {
    // 起動直後の購読確認中。購読者にゲートを一瞬見せないための間
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator color={c.textSecondary} />
      </View>
    );
  }
  if (enabled && !active) {
    return <Onboarding />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="advice"
        options={{ presentation: 'modal', title: t.advice.screenTitle }}
      />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'modal', title: t.paywall.screenTitle }}
      />
      {/* 公開サイトのランディングを兼ねる紹介ページ */}
      <Stack.Screen name="about" options={{ title: t.about.screenTitle }} />
      {/* タイトルは画面側が食材名を設定する */}
      <Stack.Screen name="food/[id]" options={{ title: '' }} />
    </Stack>
  );
}

/** 配色は設定画面の指定を含むので、DisplayProvider の内側で読む */
function ThemedRoot() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      {/* 端末の設定と食い違う配色を選べるので、ステータスバーは auto ではなく明示する */}
      <StatusBar style={dark ? 'light' : 'dark'} />
      <RootStack />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <DisplayProvider>
      <SoundProvider>
        <LanguageProvider>
          <BillingProvider>
            <ThemedRoot />
          </BillingProvider>
        </LanguageProvider>
      </SoundProvider>
    </DisplayProvider>
  );
}
