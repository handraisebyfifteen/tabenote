/**
 * クローズドテスト配布ビルドの目印(config/closedTest)。
 *
 * ビルドの取り違え(本番トラックへの昇格)を目視で防ぐためのもので、全画面の
 * 最上部に常時出す。閉じる手段は付けない。背景はブランド外の赤(#B00020)にして、
 * 本番ビルドと一目で区別できるようにする。本番ビルドでこれが見えたら出荷しない。
 */
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IS_CLOSED_TEST } from '@/config/closedTest';

export default function ClosedTestBanner() {
  const insets = useSafeAreaInsets();
  if (!IS_CLOSED_TEST) return null;
  return (
    <View style={[styles.banner, { paddingTop: insets.top }]}>
      <Text style={styles.text}>CLOSED TEST BUILD — full access enabled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#B00020',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
  },
});
