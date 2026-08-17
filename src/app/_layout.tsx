import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { LanguageProvider, useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';

function RootStack() {
  const { lang } = useLang();
  const t = getStrings(lang);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="advice"
        options={{ presentation: 'modal', title: t.advice.screenTitle }}
      />
      {/* タイトルは画面側が食材名を設定する */}
      <Stack.Screen name="food/[id]" options={{ title: '' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <RootStack />
      </LanguageProvider>
    </ThemeProvider>
  );
}
