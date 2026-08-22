/**
 * オープンソースライセンス。設定画面から開く。
 *
 * 書体(Lexend)をアプリに同梱している。OFL 1.1 は再配布の条件として
 * 著作権表示とライセンス全文を一緒に配ることを求めるので(§2)、この画面が
 * その義務を満たす。設定から常に開ける導線を消さないこと。
 *
 * 並べるものと全文は constants/licenses.ts。全文は畳んでおく — 開いた時点で
 * 初めて描くので、増えても最初の表示は重くならない。
 */
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import PageHead from '@/components/PageHead';
import { Text } from '@/components/Type';
import { LICENSES, type LicenseEntry } from '@/constants/licenses';
import { Colors, Fonts, MaxContentWidth } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings, type Strings } from '@/i18n/strings';

export default function LicensesScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  // 開けるのは 1 件ずつ。全文が長いので、並べて開けても読みづらいだけ
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <PageHead {...t.meta.licenses} path="/licenses" />

      <View style={styles.body}>
        <Text style={[styles.lede, { color: c.textSecondary }]}>{t.licenses.lede}</Text>

        {LICENSES.map((item) => (
          <LicenseRow
            key={item.id}
            item={item}
            t={t}
            expanded={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function LicenseRow({
  item,
  t,
  expanded,
  onToggle,
}: {
  item: LicenseEntry;
  t: Strings;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const toggleLabel = expanded ? t.licenses.hideFullText : t.licenses.showFullText;

  return (
    <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${item.name} ${toggleLabel}`}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <View style={styles.headText}>
          <Text style={[styles.name, { color: c.text }]}>{item.name}</Text>
          <Text style={[styles.meta, { color: c.textSecondary }]}>{item.license}</Text>
        </View>
        <Text style={[styles.toggle, { color: ACCENT }]}>{toggleLabel}</Text>
      </Pressable>

      {/* 著作権表示は畳まない。OFL が求めているのはこの行 */}
      <Text style={[styles.copyright, { color: c.text }]}>{item.copyright}</Text>

      <Pressable
        onPress={() => Linking.openURL(item.url)}
        accessibilityRole="link"
        accessibilityLabel={`${item.name} ${t.licenses.openSource}`}
      >
        <Text style={[styles.link, { color: ACCENT }]}>{item.url}</Text>
      </Pressable>

      {expanded && (
        <View style={[styles.fullText, { borderTopColor: c.backgroundSelected }]}>
          {/* 全文は原文のまま等幅で出す。文字サイズ設定は掛かる(Text 経由) */}
          <Text style={[styles.mono, { color: c.text }]}>{item.text}</Text>
        </View>
      )}
    </View>
  );
}

/** 設定・紹介ページと同じ緑 */
const ACCENT = '#8FAF8B';

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 12,
  },

  lede: { fontSize: 13, lineHeight: 20 },

  card: { borderRadius: 12, padding: 16, gap: 4 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: { opacity: 0.6 },
  headText: { flex: 1, gap: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12 },
  toggle: { fontSize: 13, fontWeight: '600' },

  copyright: { fontSize: 12, lineHeight: 19, marginTop: 8 },
  link: { fontSize: 12, marginTop: 2 },

  fullText: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  mono: {
    // 原文は 78 桁で折り返す前提の整形がしてあるので、崩さないよう等幅で出す
    fontFamily: Fonts?.mono,
    fontSize: 11,
    lineHeight: 17,
  },
});
