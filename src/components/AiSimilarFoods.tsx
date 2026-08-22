/**
 * 検索が1件も当たらなかったときのAIの案内(組み合わせ画面・図鑑で共通)。
 *
 * 図鑑は出典書籍の438品目で閉じているので、載っていない食材(ズッキーニ・
 * パクチーなど)を探すと行き止まりになる。そこで「無いものは無い」と伝えた上で、
 * 図鑑の中で近いとされる食材を、近い理由つきでAIに挙げてもらう。
 *
 * 出すのは図鑑にある食材のIDだけ(サーバー側で実在を検証済み)。
 * 検索された食材そのものの性・味は推定しない ── 出典に無いものを図に混ぜない。
 *
 * 行の見た目は画面ごとに違うので renderItem に任せ、ここは
 * ボタン・状態(読み込み・失敗・購読)・注記だけを持つ。
 */
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Type';
import { Colors } from '@/constants/theme';
import { getFood, type Food } from '@/data/foods';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCombineFeedback } from '@/hooks/use-combine-feedback';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { aiEnabled, suggestSimilarFoods } from '@/lib/ai';
import { useTrack } from '@/lib/analytics';
import { useBilling } from '@/lib/BillingContext';

/** 画面側で描く1行分 */
export interface SimilarFoodRow {
  food: Food;
  reason: string;
}

interface Props {
  /** 検索窓の中身。変わったら結果を捨てて、押し直しから始める */
  query: string;
  renderItem: (row: SimilarFoodRow) => React.ReactNode;
}

type Status = 'idle' | 'loading' | 'done' | 'error' | 'limited' | 'subscription';

export default function AiSimilarFoods({ query, renderItem }: Props) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);
  const feedback = useCombineFeedback();
  const track = useTrack();
  const { appUserId, enabled: billingEnabled } = useBilling();

  /**
   * 答えは「どの検索語に対するものか」まで込みで持つ。
   * 打ち直したら別物として扱われ、押し直しの状態に戻る
   * (答えを待っている間に打ち直したときも、遅れて届いた答えは無視される)
   */
  const [answer, setAnswer] = useState<{
    query: string;
    status: Status;
    rows: SimilarFoodRow[];
    note: string;
  }>({ query: '', status: 'idle', rows: [], note: '' });

  const trimmed = query.trim();
  const { status, rows, note } =
    answer.query === trimmed
      ? answer
      : { status: 'idle' as Status, rows: [], note: '' };

  const ask = useCallback(async () => {
    setAnswer({ query: trimmed, status: 'loading', rows: [], note: '' });
    // 送るのは行動の有無だけ(検索語は送らない)
    track('ai_similar_requested');
    try {
      const result = await suggestSimilarFoods({
        query: trimmed,
        lang,
        appUserId: appUserId ?? undefined,
      });
      // 参照のみ項目(性が空)はこの案内から外す。選べず、図にも入らないため
      const found = result.items
        .map(({ id, reason }) => ({ food: getFood(id), reason }))
        .filter(
          (row): row is SimilarFoodRow =>
            row.food !== undefined && row.food.nature !== '',
        );
      setAnswer({ query: trimmed, status: 'done', rows: found, note: result.note });
    } catch (e) {
      setAnswer({
        query: trimmed,
        status:
          e instanceof Error && e.message === 'subscription_required'
            ? 'subscription'
            : e instanceof Error && e.message === 'rate_limited'
              ? 'limited'
              : 'error',
        rows: [],
        note: '',
      });
    }
  }, [track, trimmed, lang, appUserId]);

  if (!aiEnabled() || trimmed === '') return null;

  return (
    <View style={[styles.card, { backgroundColor: c.backgroundElement }]}>
      <Text style={[styles.headline, { color: c.text }]}>
        {t.aiSimilar.notFound(trimmed)}
      </Text>

      {status === 'loading' && (
        <View style={styles.loading}>
          <ActivityIndicator color={c.textSecondary} />
          <Text style={{ color: c.textSecondary, fontSize: 13 }}>
            {t.aiSimilar.loading}
          </Text>
        </View>
      )}

      {status === 'error' && (
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {t.aiSimilar.error}
        </Text>
      )}

      {status === 'limited' && (
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {t.aiSimilar.rateLimited}
        </Text>
      )}

      {status === 'subscription' && (
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {t.aiSimilar.subscriptionRequired}
        </Text>
      )}

      {status === 'done' && (
        <>
          {note !== '' && (
            <Text style={[styles.body, { color: c.text }]}>{note}</Text>
          )}
          {rows.length === 0 ? (
            <Text style={[styles.body, { color: c.textSecondary }]}>
              {t.aiSimilar.emptyResult}
            </Text>
          ) : (
            <View style={styles.rows}>
              {rows.map((row) => (
                <View key={row.food.id}>{renderItem(row)}</View>
              ))}
            </View>
          )}
          <Text style={[styles.note, { color: c.textSecondary }]}>
            {t.aiSimilar.note}
          </Text>
        </>
      )}

      {/* ボタンは常に最後。読んだ流れのまま、聞き直す・購読を見る、へ続ける */}
      {status === 'subscription' ? (
        billingEnabled && (
          <Pressable
            style={[styles.button, { backgroundColor: c.backgroundSelected }]}
            onPress={() => {
              feedback.po();
              router.push('/paywall');
            }}
          >
            <Text style={{ color: c.text, fontSize: 13 }}>
              {t.aiSimilar.subscribeButton}
            </Text>
          </Pressable>
        )
      ) : status === 'loading' ? null : (
        <Pressable
          style={[styles.button, { backgroundColor: c.backgroundSelected }]}
          onPress={() => {
            // 探しに行く合図。組み合わせ画面の検索窓と同じ「カチッ」
            feedback.search();
            void ask();
          }}
        >
          <Text style={{ color: c.text, fontSize: 13 }}>
            {status === 'idle' ? t.aiSimilar.askButton : t.aiSimilar.retryButton}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, margin: 12, gap: 10 },
  headline: { fontSize: 14, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 20 },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  rows: { gap: 4 },
  note: { fontSize: 11, lineHeight: 17 },
});
