/**
 * 購読画面(モーダル)。設定の「月額プラン」から開く。
 * 中身は components/PaywallContent(初回起動のゲートと共用)。
 */
import React from 'react';

import PaywallContent from '@/components/PaywallContent';

export default function PaywallScreen() {
  return <PaywallContent source="settings" />;
}
