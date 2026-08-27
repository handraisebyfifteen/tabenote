import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import ClosedTestBanner from '@/components/ClosedTestBanner';
import Onboarding from '@/components/Onboarding';
import SplashWordmark from '@/components/SplashWordmark';
import { Colors } from '@/constants/theme';
import { DEMO_MODE } from '@/demo/config';
import DemoOverlay from '@/demo/DemoOverlay';
import { registerDemoScreen, type DemoHandlers } from '@/demo/registry';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider, useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { AnalyticsProvider } from '@/lib/analytics';
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
      {/* 同梱している書体の OFL 表示。設定から常に開けること */}
      <Stack.Screen name="licenses" options={{ title: t.licenses.screenTitle }} />
      {/* タイトルは画面側が食材名を設定する */}
      <Stack.Screen name="food/[id]" options={{ title: '' }} />
    </Stack>
  );
}

/** 配色は設定画面の指定を含むので、DisplayProvider の内側で読む */
function ThemedRoot() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';

  // 起動のワードマークはネイティブだけ。web は公開サイトのランディングを
  // 兼ねていて、1.2 秒待たせる意味がないので最初から済んだ扱いにする
  const [introDone, setIntroDone] = useState(Platform.OS === 'web');
  const finishIntro = useCallback(() => setIntroDone(true), []);

  // デモモード: ワードマークの再表示(合計表示時間つき)を台本から呼べるようにする
  const [demoSplashMs, setDemoSplashMs] = useState<number | null>(null);
  const demoHandlers = useRef<DemoHandlers>({});
  useEffect(() => {
    if (!DEMO_MODE) return;
    demoHandlers.current = {
      showSplash: (totalMs: number) => {
        setDemoSplashMs(totalMs);
        setIntroDone(false);
      },
      hideSplash: () => {
        setDemoSplashMs(null);
        setIntroDone(true);
      },
    };
  });
  useEffect(() => {
    if (!DEMO_MODE) return;
    return registerDemoScreen('root', demoHandlers);
  }, []);

  return (
    <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
      {/* 端末の設定と食い違う配色を選べるので、ステータスバーは auto ではなく明示する */}
      <StatusBar style={dark ? 'light' : 'dark'} />
      {/* クローズドテスト配布ビルドの目印。スプラッシュにも覆わせない。通常ビルドでは何も描かない */}
      <ClosedTestBanner />
      <View style={{ flex: 1 }}>
        {/* 裏で購読確認と保存データの読み出しを進めながら、上にワードマークを被せる */}
        <RootStack />
        {!introDone && (
          <SplashWordmark
            onDone={finishIntro}
            minTotalMs={demoSplashMs ?? undefined}
          />
        )}
        {DEMO_MODE && <DemoOverlay />}
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // 読み込みが終わるまで何も描かない。先に描くと一瞬システムフォントで出てから
  // Lexend に差し替わる。この間はネイティブのスプラッシュが出たままになる
  const fontsReady = useAppFonts();
  if (!fontsReady) return null;

  return (
    <AnalyticsProvider>
      <DisplayProvider>
        <SoundProvider>
          <LanguageProvider>
            <BillingProvider>
              <ThemedRoot />
            </BillingProvider>
          </LanguageProvider>
        </SoundProvider>
      </DisplayProvider>
    </AnalyticsProvider>
  );
}
