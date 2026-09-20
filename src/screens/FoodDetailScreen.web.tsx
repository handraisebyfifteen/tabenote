/** Webではこの画面を提供しない(README.md)。図鑑データを公開サイトのJSに入れないための空の差し替え */
export default function WebUnavailable() {
  return null;
}

/** 食材ページは書き出さない */
export async function generateStaticParams(): Promise<Record<string, string>[]> {
  return [];
}
