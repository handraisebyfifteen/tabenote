/**
 * 保存データの書き出し(ネイティブ)。中身の組み立ては lib/exportPayload。
 *
 * JSON をキャッシュ領域に一時ファイルとして書き、共有シートに渡す
 * (テキスト共有だと「ファイルに保存」が出ず、メモが多い人で破綻するため)。
 * 共有シートが使えない環境ではテキスト共有に落とす。
 * Web には export.web.ts(ダウンロード)が使われる。
 */
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { getStrings } from '@/i18n/strings';
import type { Lang } from '@/i18n/terms';
import { buildExportPayload, exportFileName } from '@/lib/exportPayload';
import { loadUserData } from '@/lib/storage';

/** 保存データを書き出す。失敗時は例外(呼び出し側が Alert を出す) */
export async function exportUserData(lang: Lang): Promise<void> {
  const t = getStrings(lang);
  const data = await loadUserData();
  const now = new Date();
  const payload = buildExportPayload(data, lang, now.toISOString());
  const json = JSON.stringify(payload, null, 2);

  if (await Sharing.isAvailableAsync()) {
    const file = new File(Paths.cache, exportFileName(now));
    file.create({ overwrite: true });
    file.write(json);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: t.settings.exportShareTitle,
    });
    return;
  }
  await Share.share({ title: t.settings.exportShareTitle, message: json });
}
