/**
 * 設定(指示書 6-4)。
 * 言語(日本語/English)・参考文献・免責・データのエクスポートを実装済み。
 * 課金/復元はフェーズ8(RevenueCat)。食材名の英語データは未整備(言語欄に注記)。
 */
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import type { Lang } from '@/i18n/terms';
import { loadUserData } from '@/lib/storage';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang, setLang } = useLang();
  const t = getStrings(lang);

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection((current) => (current === key ? null : key));
  };

  const exportData = async () => {
    try {
      const data = await loadUserData();
      const payload = {
        app: 'tabenote',
        format: 1,
        exportedAt: new Date().toISOString(),
        data,
      };
      await Share.share({
        title: t.settings.exportShareTitle,
        message: JSON.stringify(payload, null, 2),
      });
    } catch {
      Alert.alert(t.settings.exportFailTitle, t.settings.exportFailBody);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <View style={[styles.row, { backgroundColor: c.backgroundElement }]}>
        <Text style={[styles.title, { color: c.text }]}>{t.settings.billing}</Text>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t.settings.billingNote}
        </Text>
      </View>

      <View style={[styles.row, { backgroundColor: c.backgroundElement }]}>
        <Text style={[styles.title, { color: c.text }]}>{t.settings.language}</Text>
        <View style={styles.langRow}>
          {LANG_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.langChip,
                {
                  backgroundColor:
                    lang === option.value ? '#8FAF8B' : c.backgroundSelected,
                },
              ]}
              onPress={() => setLang(option.value)}
            >
              <Text
                style={{
                  color: lang === option.value ? '#fff' : c.text,
                  fontSize: 13,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t.settings.languageNote}
        </Text>
      </View>

      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={() => toggleSection('references')}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.references}</Text>
        {openSection === 'references' && (
          <Text style={[styles.body, { color: c.text }]}>
            {t.settings.referencesBody}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={() => toggleSection('disclaimer')}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.disclaimer}</Text>
        {openSection === 'disclaimer' && (
          <Text style={[styles.body, { color: c.text }]}>
            {t.settings.disclaimerBody}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={exportData}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.exportTitle}</Text>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t.settings.exportNote}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  row: { borderRadius: 12, padding: 16, gap: 2 },
  title: { fontSize: 15, fontWeight: '500' },
  note: { fontSize: 12 },
  body: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 4 },
  langChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});
