/**
 * 手帳 — ライブラリー(指示書 6-3)。落ち着いたトーン。記録と閲覧。
 *
 *   組み合わせ: 保存した組み合わせ + そのメモ(編集・呼び出し・削除)
 *   図鑑: 全品目の一覧(参照のみ項目を含む)と食材詳細への入口
 *   解説: 五行の体系・五味のはたらき・必須の注記・参考文献
 */
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';

import { natureColor } from '@/components/FlavorPentagon';
import { Colors } from '@/constants/theme';
import { FOODS, getFood, isReferenceOnly, searchFoods } from '@/data/foods';
import { useLang } from '@/i18n/LanguageContext';
import { getStrings } from '@/i18n/strings';
import { cat15Label, foodName, natureLabel } from '@/i18n/terms';
import { natureValue } from '@/logic/nature';
import {
  deleteSavedCombo,
  loadUserData,
  updateSavedCombo,
  type SavedCombo,
} from '@/lib/storage';

type Segment = 'combos' | 'zukan' | 'guide';

export default function NotebookScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [segment, setSegment] = useState<Segment>('combos');
  const [combos, setCombos] = useState<SavedCombo[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadUserData().then((d) => {
        if (active) setCombos(d.savedCombos);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const segments: { key: Segment; label: string }[] = [
    { key: 'combos', label: t.notebook.segCombos },
    { key: 'zukan', label: t.notebook.segZukan },
    { key: 'guide', label: t.notebook.segGuide },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <View style={styles.segmentRow}>
        {segments.map((s) => (
          <Pressable
            key={s.key}
            style={[
              styles.segment,
              {
                backgroundColor:
                  segment === s.key ? c.backgroundSelected : c.backgroundElement,
              },
            ]}
            onPress={() => setSegment(s.key)}
          >
            <Text
              style={{
                color: segment === s.key ? c.text : c.textSecondary,
                fontSize: 13,
                fontWeight: segment === s.key ? '600' : '400',
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {segment === 'combos' && <CombosSection combos={combos} onChange={setCombos} />}
      {segment === 'zukan' && <ZukanSection />}
      {segment === 'guide' && <GuideSection />}
    </View>
  );
}

/* ---------------- 組み合わせ ---------------- */

function CombosSection({
  combos,
  onChange,
}: {
  combos: SavedCombo[];
  onChange: (combos: SavedCombo[]) => void;
}) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memoDraft, setMemoDraftUi] = useState('');
  const [nameDraft, setNameDraftUi] = useState('');
  // blur を経ずに閉じても編集が消えないよう、最新値と保存済み値を ref に持つ
  const emptyDraft = {
    comboId: null as string | null,
    name: '',
    memo: '',
    persistedName: '',
    persistedMemo: '',
  };
  const draftState = useRef({ ...emptyDraft });

  const setMemoDraft = (text: string) => {
    draftState.current.memo = text;
    setMemoDraftUi(text);
  };

  const setNameDraft = (text: string) => {
    draftState.current.name = text;
    setNameDraftUi(text);
  };

  /** 未保存の編集を書き込む。updateUi=false はアンマウント時用(親の再描画をしない) */
  const persistDraft = useCallback(
    (updateUi: boolean) => {
      const s = draftState.current;
      if (s.comboId === null) return;
      // 空の名前では保存しない(元の名前に戻す)
      const name = s.name.trim() === '' ? s.persistedName : s.name;
      if (name === s.persistedName && s.memo === s.persistedMemo) return;
      s.persistedName = name;
      s.persistedMemo = s.memo;
      const write = updateSavedCombo(s.comboId, { name, memo: s.memo });
      if (updateUi) write.then((d) => onChange(d.savedCombos));
    },
    [onChange],
  );

  // タブ切り替え等でセクションごと消えるときも書き込む
  useEffect(() => () => persistDraft(false), [persistDraft]);

  const toggleExpand = (combo: SavedCombo) => {
    persistDraft(true);
    if (expandedId === combo.id) {
      setExpandedId(null);
      draftState.current = { ...emptyDraft };
    } else {
      setExpandedId(combo.id);
      draftState.current = {
        comboId: combo.id,
        name: combo.name,
        memo: combo.memo,
        persistedName: combo.name,
        persistedMemo: combo.memo,
      };
      setNameDraftUi(combo.name);
      setMemoDraftUi(combo.memo);
    }
  };

  const remove = (combo: SavedCombo) => {
    Alert.alert(t.notebook.deleteTitle, t.notebook.deleteMessage(combo.name), [
      { text: t.notebook.deleteCancel, style: 'cancel' },
      {
        text: t.notebook.deleteConfirm,
        style: 'destructive',
        onPress: async () => {
          if (expandedId === combo.id) {
            setExpandedId(null);
            draftState.current = { ...emptyDraft };
          }
          const d = await deleteSavedCombo(combo.id);
          onChange(d.savedCombos);
        },
      },
    ]);
  };

  if (combos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          {t.notebook.empty}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={combos}
      keyExtractor={(combo) => combo.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const expanded = expandedId === item.id;
        return (
          <Pressable
            style={[styles.card, { backgroundColor: c.backgroundElement }]}
            onPress={() => toggleExpand(item)}
          >
            {expanded ? (
              <TextInput
                style={[styles.comboNameInput, { color: c.text, borderColor: c.backgroundSelected }]}
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={() => persistDraft(true)}
                placeholder={t.notebook.namePlaceholder}
                placeholderTextColor={c.textSecondary}
              />
            ) : (
              <Text style={[styles.comboName, { color: c.text }]}>{item.name}</Text>
            )}
            <Text style={[styles.comboDate, { color: c.textSecondary }]}>{item.date}</Text>
            <Text style={[styles.comboFoods, { color: c.text }]}>
              {item.foodIds
                .map((id) => {
                  const food = getFood(id);
                  return food ? foodName(food, lang) : undefined;
                })
                .filter(Boolean)
                .join(lang === 'ja' ? '・' : ', ')}
            </Text>
            {!expanded && item.memo !== '' && (
              <Text style={[styles.comboMemoPreview, { color: c.textSecondary }]} numberOfLines={2}>
                {item.memo}
              </Text>
            )}
            {expanded && (
              <View style={styles.comboDetail}>
                <TextInput
                  style={[styles.comboMemoInput, { color: c.text, borderColor: c.backgroundSelected }]}
                  multiline
                  value={memoDraft}
                  onChangeText={setMemoDraft}
                  onBlur={() => persistDraft(true)}
                  placeholder={t.notebook.memoPlaceholder}
                  placeholderTextColor={c.textSecondary}
                />
                <View style={styles.comboActions}>
                  <Pressable
                    style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                    onPress={() => {
                      persistDraft(true);
                      router.push({
                        pathname: '/(tabs)/combine',
                        params: { ids: item.foodIds.join(',') },
                      });
                    }}
                  >
                    <Text style={{ color: c.text, fontSize: 13 }}>
                      {t.notebook.openInCombine}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                    onPress={() =>
                      router.push({
                        pathname: '/advice',
                        params: { ids: item.foodIds.join(',') },
                      })
                    }
                  >
                    <Text style={{ color: c.text, fontSize: 13 }}>
                      {t.notebook.viewComposition}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.comboAction, { backgroundColor: c.backgroundSelected }]}
                    onPress={() => remove(item)}
                  >
                    <Text style={{ color: '#C9563D', fontSize: 13 }}>
                      {t.notebook.deleteAction}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}

/* ---------------- 図鑑 ---------------- */

function ZukanSection() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const t = getStrings(lang);

  const [query, setQuery] = useState('');

  const foods = useMemo(
    () => (query.trim() === '' ? FOODS : searchFoods(query)),
    [query],
  );

  return (
    <View style={styles.zukan}>
      <TextInput
        style={[styles.search, { backgroundColor: c.backgroundElement, color: c.text }]}
        placeholder={t.notebook.zukanPlaceholder(FOODS.length)}
        placeholderTextColor={c.textSecondary}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={foods}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => {
          const refOnly = isReferenceOnly(item);
          return (
            <Pressable
              style={styles.zukanRow}
              onPress={() => router.push(`/food/${item.id}`)}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: refOnly
                      ? c.backgroundSelected
                      : natureColor(natureValue(item)),
                  },
                ]}
              />
              <Text
                style={[styles.zukanName, { color: refOnly ? c.textSecondary : c.text }]}
              >
                {foodName(item, lang)}
              </Text>
              {item.nature !== '' && (
                <Text style={[styles.zukanNature, { color: c.textSecondary }]}>
                  {natureLabel(item.nature, lang)}
                </Text>
              )}
              <Text style={[styles.zukanCat, { color: c.textSecondary }]}>
                {cat15Label(item.cat15, lang)}
              </Text>
              <Text style={{ color: c.textSecondary }}>›</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

/* ---------------- 解説 ---------------- */

function GuideSection() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { lang } = useLang();
  const g = getStrings(lang).guide;

  return (
    <ScrollView contentContainerStyle={styles.guide}>
      <GuideCard title={g.fivePhasesTitle} color={c}>
        <View style={styles.table}>
          {g.fivePhasesTable.map((row, ri) => (
            <View key={ri} style={styles.tableRow}>
              {row.map((cell, ci) => (
                <Text
                  key={ci}
                  style={[
                    styles.tableCell,
                    { color: ri === 0 ? c.textSecondary : c.text },
                    ri === 0 && styles.tableHeader,
                  ]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={[styles.guideText, { color: c.textSecondary }]}>
          {g.meridianNote}
        </Text>
      </GuideCard>

      <GuideCard title={g.flavorWorksTitle} color={c}>
        {g.flavorNotes.map(([flavor, note]) => (
          <View key={flavor} style={styles.flavorRow}>
            <Text
              style={[
                styles.flavorLabel,
                { color: c.text, width: lang === 'ja' ? 20 : 64 },
              ]}
            >
              {flavor}
            </Text>
            <Text style={[styles.flavorNote, { color: c.text }]}>{note}</Text>
          </View>
        ))}
        <Text style={[styles.guideText, { color: c.textSecondary }]}>
          {g.flavorCaveat}
        </Text>
      </GuideCard>

      <GuideCard title={g.organsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.organsBody}</Text>
      </GuideCard>

      <GuideCard title={g.seasonsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.seasonsBody1}</Text>
        <Text style={[styles.guideText, { color: c.textSecondary }]}>{g.seasonsBody2}</Text>
      </GuideCard>

      <GuideCard title={g.conventionsTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.conventionsBody}</Text>
      </GuideCard>

      <GuideCard title={g.positionTitle} color={c}>
        <Text style={[styles.guideText, { color: c.text }]}>{g.positionBody}</Text>
        <Text style={[styles.guideText, { color: c.textSecondary }]}>
          {g.referencesLine}
        </Text>
      </GuideCard>
    </ScrollView>
  );
}

function GuideCard({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: { text: string; textSecondary: string; backgroundElement: string };
}) {
  return (
    <View style={[styles.card, { backgroundColor: color.backgroundElement }]}>
      <Text style={[styles.guideTitle, { color: color.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segment: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  empty: { flex: 1, justifyContent: 'center', padding: 32 },
  emptyText: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 4 },
  comboName: { fontSize: 16, fontWeight: '600' },
  comboNameInput: {
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  comboDate: { fontSize: 12 },
  comboActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  comboFoods: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  comboMemoPreview: { fontSize: 13, marginTop: 6, lineHeight: 19 },
  comboDetail: { marginTop: 10, gap: 10 },
  comboMemoInput: {
    fontSize: 14,
    lineHeight: 21,
    minHeight: 72,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  comboAction: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  zukan: { flex: 1 },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  zukanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  zukanName: { fontSize: 15, flex: 1 },
  zukanNature: { fontSize: 12 },
  zukanCat: { fontSize: 11 },
  guide: { padding: 16, gap: 12 },
  guideTitle: { fontSize: 12, marginBottom: 4 },
  guideText: { fontSize: 14, lineHeight: 22 },
  table: { gap: 2, marginBottom: 8 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, textAlign: 'center', fontSize: 14, lineHeight: 24 },
  tableHeader: { fontSize: 11 },
  flavorRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  flavorLabel: { fontSize: 14, lineHeight: 21, fontWeight: '600' },
  flavorNote: { fontSize: 14, flex: 1, lineHeight: 21 },
});
