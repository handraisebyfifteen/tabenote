/**
 * Web用のルートレイアウト。Webではアプリ本体を提供せず、入手案内だけを出す(README.md)。
 *
 * ここから src/data・src/logic・課金・デモに届く import をしないこと。
 * scripts/postbuild-web.js が公開JSを検査していて、図鑑データが混ざるとビルドが落ちる。
 */
import DownloadScreen from '@/components/DownloadScreen';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { DisplayProvider } from '@/lib/DisplayContext';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return null;

  return (
    <DisplayProvider>
      <LanguageProvider>
        <DownloadScreen />
      </LanguageProvider>
    </DisplayProvider>
  );
}
