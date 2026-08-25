/**
 * 保存データの書き出し(Web)。中身の組み立ては lib/exportPayload。
 *
 * expo-sharing は Web では使えないため、Blob のダウンロードで渡す
 * (react-native-web の Share は navigator.share 頼みで、デスクトップでは大抵使えない)。
 * 静的書き出し時(Node.js)には呼ばれない(クリック時にのみ動く)。
 */
import type { Lang } from '@/i18n/terms';
import { buildExportPayload, exportFileName } from '@/lib/exportPayload';
import { loadUserData } from '@/lib/storage';

/** 保存データを書き出す。失敗時は例外(呼び出し側が Alert を出す) */
export async function exportUserData(lang: Lang): Promise<void> {
  const data = await loadUserData();
  const now = new Date();
  const payload = buildExportPayload(data, lang, now.toISOString());
  const json = JSON.stringify(payload, null, 2);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = exportFileName(now);
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
