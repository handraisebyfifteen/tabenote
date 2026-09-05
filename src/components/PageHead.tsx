/**
 * ページ単位の <head>(公開サイト用)。web の静的書き出しでだけ <head> に反映される。
 *
 * ネイティブでは描画しない。iOS の expo-router/head は Handoff(NSUserActivity)を
 * 有効化する機能で、ビルドに handoff origin が無いと全画面で警告アラートを出す
 * (審査却下 2.1(a) の原因・2026-09-05)。本アプリに Handoff は不要なので、
 * origin 設定の有無に依存させず web 以外では何も返さない。
 */
import Head from 'expo-router/head';
import React from 'react';
import { Platform } from 'react-native';

import { SITE_URL } from '@/constants/site';

interface Props {
  title: string;
  description: string;
  /** サイトルートからのパス('/', '/combine', '/food/tomato' など) */
  path: string;
}

export default function PageHead({ title, description, path }: Props) {
  const url = `${SITE_URL}${path}`;
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
