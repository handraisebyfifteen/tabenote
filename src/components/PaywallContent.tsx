/**
 * 購読案内の中身(申請準備指示書 2章・4-3)。
 * 初回起動のゲート(components/Onboarding)と、設定から開くモーダル(app/paywall)で共用する。
 *
 * Apple の要件(Schedule 2 §3.8(b) ほか):
 *   プラン名・期間・価格(ストアのローカライズ済み文字列。画面で最も目立つ)・提供内容・
 *   購入を復元・利用規約・プライバシーポリシー・自動更新と解約方法の説明。
 * プランは月額1本のみなので、選択UIは置かない(指示書 4-3)。
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { PRIVACY_URL, TERMS_URL } from '@/constants/site';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { useBilling } from '@/lib/BillingContext';

const ACCENT = '#8FAF8B';

export default function PaywallContent() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const { active, plans, plansLoading, loadPlans, purchase, restore } = useBilling();
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // プランは月額1本。Offering の先頭を使う
  const plan = plans[0] ?? null;

  const onSubscribe = async () => {
    if (plan === null || busy) return;
    setBusy(true);
    const outcome = await purchase(plan.id);
    setBusy(false);
    if (outcome === 'failed') {
      Alert.alert(t.paywall.failTitle, t.paywall.failBody);
    }
    // purchased は購読状態の変化で画面側が切り替わる。cancelled はユーザーの意思なので何も出さない
  };

  const onRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const restored = await restore();
      Alert.alert(
        t.paywall.restoreDoneTitle,
        restored ? t.paywall.restoreDoneBody : t.paywall.restoreNoneBody,
      );
    } catch {
      Alert.alert(t.paywall.restoreDoneTitle, t.paywall.restoreFailBody);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.content}>
        <Text style={[styles.planName, { color: c.text }]}>{t.paywall.planName}</Text>
        <Text style={[styles.lead, { color: c.textSecondary }]}>{t.paywall.lead}</Text>

        <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
          <Text style={[styles.cardTitle, { color: ACCENT }]}>
            {t.paywall.includedTitle}
          </Text>
          {t.paywall.includedBody.split('\n').map((line) => (
            <View key={line} style={styles.itemRow}>
              <Text style={[styles.itemBullet, { color: ACCENT }]}>・</Text>
              <Text style={[styles.item, { color: c.text }]}>{line}</Text>
            </View>
          ))}
        </View>

        {active ? (
          <Text style={[styles.state, { color: c.text }]}>
            {t.paywall.alreadySubscribed}
          </Text>
        ) : plansLoading ? (
          <View style={styles.stateArea}>
            <ActivityIndicator color={c.textSecondary} />
            <Text style={[styles.stateNote, { color: c.textSecondary }]}>
              {t.paywall.loading}
            </Text>
          </View>
        ) : plan === null ? (
          <View style={styles.stateArea}>
            <Text style={[styles.stateNote, { color: c.textSecondary }]}>
              {t.paywall.unavailable}
            </Text>
            <Pressable
              onPress={loadPlans}
              style={[styles.retry, { backgroundColor: c.backgroundSelected }]}
            >
              <Text style={{ color: c.text, fontSize: 13 }}>{t.paywall.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 請求される総額が画面で最も目立つこと(Apple の要件) */}
            <View style={styles.priceArea}>
              <Text style={[styles.price, { color: c.text }]}>{plan.priceString}</Text>
              <Text style={[styles.periodNote, { color: c.textSecondary }]}>
                {t.paywall.periodNote}
              </Text>
            </View>

            <Pressable
              onPress={onSubscribe}
              disabled={busy}
              accessibilityRole="button"
              style={[styles.cta, { backgroundColor: ACCENT, opacity: busy ? 0.6 : 1 }]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaLabel}>{t.paywall.subscribe}</Text>
              )}
            </Pressable>
          </>
        )}

        <Text style={[styles.renewalNote, { color: c.textSecondary }]}>
          {t.paywall.renewalNote}
        </Text>

        <View style={styles.links}>
          <Pressable onPress={onRestore} disabled={restoring}>
            <Text
              style={[styles.link, { color: c.textSecondary, opacity: restoring ? 0.5 : 1 }]}
            >
              {t.paywall.restore}
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={[styles.link, { color: c.textSecondary }]}>{t.paywall.terms}</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={[styles.link, { color: c.textSecondary }]}>
              {t.paywall.privacy}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: 8 },
  planName: { fontSize: 22, fontWeight: '600', marginTop: 8 },
  lead: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  card: { borderRadius: 12, padding: 16, gap: 6 },
  cardTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start' },
  itemBullet: { fontSize: 14, lineHeight: 21 },
  item: { flex: 1, fontSize: 14, lineHeight: 21 },
  priceArea: { alignItems: 'center', gap: 2, marginTop: 12 },
  price: { fontSize: 34, fontWeight: '700' },
  periodNote: { fontSize: 13 },
  stateArea: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  state: { fontSize: 15, lineHeight: 22, textAlign: 'center', paddingVertical: 16 },
  stateNote: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  retry: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 },
  cta: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  ctaLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  renewalNote: { fontSize: 11, lineHeight: 18, marginTop: 12 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, marginTop: 4 },
  link: { fontSize: 12, textDecorationLine: 'underline' },
});
