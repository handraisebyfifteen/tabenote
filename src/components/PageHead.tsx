/**
 * ページ単位の <head>(公開サイト用)。
 *
 * ネイティブでは expo-router/head が react-helmet をフォーカス連動で動かすだけなので、
 * 画面の見た目には影響しない。web の静的書き出しでだけ <head> に反映される。
 */
import Head from 'expo-router/head';
import React from 'react';

import { SITE_URL } from '@/constants/site';

interface Props {
  title: string;
  description: string;
  /** サイトルートからのパス('/', '/combine', '/food/tomato' など) */
  path: string;
}

export default function PageHead({ title, description, path }: Props) {
  const url = `${SITE_URL}${path}`;
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
