/**
 * Webではタブを提供しない(README.md)。RootLayout.web.tsx がナビゲータを描かないので、ここは呼ばれない。
 * 空にしてあるのは、文言(i18n/strings → terms)経由で図鑑データが公開サイトのJSに入るのを断つため
 */
export default function WebUnavailable() {
  return null;
}
