/**
 * 設定(指示書 6-4/申請準備指示書 Phase 5)。
 * 月額プラン/復元/購読管理・表示(配色と文字サイズ)・言語・参考文献・免責・
 * 規約とポリシー・お問い合わせ・データのエクスポート・バージョン。
 * 課金の導線は、APIキー未設定のときとWebでは出さない(食材名の英語データは未整備。言語欄に注記)。
 * 規約・ポリシーへの導線はアプリ内から常に必要(Schedule 2 §3.8(b))なので課金の有効無効に関わらず出す。
 */
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import PageHead from '@/components/PageHead';
import { Text } from '@/components/Type';
import {
  MANAGE_SUBSCRIPTION_URL,
  PRIVACY_URL,
  SUPPORT_URL,
  TERMS_URL,
} from '@/constants/site';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import type { Lang } from '@/i18n/terms';
import { useBilling } from '@/lib/BillingContext';
import { useDisplay } from '@/lib/DisplayContext';
import { loadUserData } from '@/lib/storage';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

/** 選択中を示す緑(言語チップ・スイッチ共通) */
const ACCENT = '#8FAF8B';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang, setLang } = useLang();
  const t = getStrings(lang);

  const { enabled: billingOn, active, restore } = useBilling();
  const { themePref, setThemePref, textSize, setTextSize } = useDisplay();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSection((current) => (current === key ? null : key));
  };

  const restorePurchase = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const restored = await restore();
      Alert.alert(
        t.settings.restoreDoneTitle,
        restored ? t.settings.restoreDoneBody : t.settings.restoreNoneBody,
      );
    } catch {
      Alert.alert(t.settings.restoreDoneTitle, t.settings.restoreFailBody);
    } finally {
      setRestoring(false);
    }
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

  const switchTrack = { true: ACCENT, false: c.backgroundSelected };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <PageHead {...t.meta.settings} path="/settings" />

      {billingOn && (
        <>
          <Pressable
            style={[styles.row, { backgroundColor: c.backgroundElement }]}
            onPress={() => router.push('/paywall')}
          >
            <Text style={[styles.title, { color: c.text }]}>{t.settings.billing}</Text>
            <Text style={[styles.note, { color: c.textSecondary }]}>
              {active ? t.settings.billingActiveNote : t.settings.billingNote}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.row,
              { backgroundColor: c.backgroundElement, opacity: restoring ? 0.6 : 1 },
            ]}
            onPress={restorePurchase}
            disabled={restoring}
          >
            <Text style={[styles.title, { color: c.text }]}>{t.settings.restore}</Text>
            <Text style={[styles.note, { color: c.textSecondary }]}>
              {t.settings.restoreNote}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.row, { backgroundColor: c.backgroundElement }]}
            onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)}
          >
            <Text style={[styles.title, { color: c.text }]}>
              {t.settings.manageSubscription}
            </Text>
            <Text style={[styles.note, { color: c.textSecondary }]}>
              {t.settings.manageSubscriptionNote}
            </Text>
          </Pressable>
        </>
      )}

      {/* 配色。既定は端末に合わせる。切り替えるとこの端末で固定になる */}
      <View style={[styles.row, { backgroundColor: c.backgroundElement }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.title, styles.switchLabel, { color: c.text }]}>
            {t.settings.darkMode}
          </Text>
          <Switch
            value={scheme === 'dark'}
            onValueChange={(on) => setThemePref(on ? 'dark' : 'light')}
            trackColor={switchTrack}
          />
        </View>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {themePref === 'system'
            ? t.settings.darkModeSystemNote
            : t.settings.darkModeFixedNote}
        </Text>
        {themePref !== 'system' && (
          <Pressable onPress={() => setThemePref('system')} hitSlop={8}>
            <Text style={[styles.link, { color: ACCENT }]}>{t.settings.followSystem}</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.row, { backgroundColor: c.backgroundElement }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.title, styles.switchLabel, { color: c.text }]}>
            {t.settings.largeText}
          </Text>
          <Switch
            value={textSize === 'large'}
            onValueChange={(on) => setTextSize(on ? 'large' : 'standard')}
            trackColor={switchTrack}
          />
        </View>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t.settings.largeTextNote}
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
                    lang === option.value ? ACCENT : c.backgroundSelected,
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

      {/* 規約・ポリシーはアプリ内から常に開けること(Schedule 2 §3.8(b)) */}
      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={() => Linking.openURL(TERMS_URL)}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.terms}</Text>
      </Pressable>

      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={() => Linking.openURL(PRIVACY_URL)}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.privacy}</Text>
      </Pressable>

      <Pressable
        style={[styles.row, { backgroundColor: c.backgroundElement }]}
        onPress={() => Linking.openURL(SUPPORT_URL)}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settings.contact}</Text>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {t.settings.contactNote}
        </Text>
      </Pressable>

      <View style={[styles.row, { backgroundColor: c.backgroundElement }]}>
        <Text style={[styles.title, { color: c.text }]}>{t.settings.version}</Text>
        <Text style={[styles.note, { color: c.textSecondary }]}>
          {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  row: { borderRadius: 12, padding: 16, gap: 2 },
  title: { fontSize: 15, fontWeight: '500' },
  note: { fontSize: 12 },
  body: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  link: { fontSize: 12, marginTop: 6 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // スイッチを右端に置いたまま、長いラベル(英語)を折り返させる
  switchLabel: { flex: 1 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 4 },
  langChip: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});
