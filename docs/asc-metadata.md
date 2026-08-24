# App Store Connect 入力用メタデータ(旧ドラフト)

> **【2026-08-24】このファイルは旧ドラフト。提出には使わない。**
> 実際に入力する文面は [申請準備-入力素材.md](./申請準備-入力素材.md) の**素材A**(名前・説明文がこのファイルとは別物。混ぜないこと)。
> 同日、**プライマリ言語は英語(en-US)に決定**した(Shipaton 提出アプリのため)。以下の「日本語を主言語」という前提は古く、日本語は追加ローカライズになる。
> URL・審査メモ・サブスク表示名も 申請準備-入力素材.md(Step 1・6・8 / 素材B・C)に引き継ぎ済み。

そのままコピーして使える文面、として書かれていた元の想定: 日本語(ja)を主言語、英語(en-US)を追加ローカライズ。

カッコ内は実際の文字数(`node -e "console.log([...'…'].length)"` で数えたもの)。
上限は Apple の仕様 — 名前30 / サブタイトル30 / キーワード100 / プロモーションテキスト170 / 説明4000。

## 入力するURL(App Store Connect の「App情報」)

法務ページは自社ドメイン `tabenote.app` で配信する。実体は `public/` の静的HTMLで、
`npm run build:web` で `dist` に出て公開サイトの一部になる(定義元は `src/constants/site.ts`)。

| 入力欄 | URL |
|---|---|
| サポートURL | `https://tabenote.app/support` |
| マーケティングURL(任意) | `https://tabenote.app` |
| プライバシーポリシーURL | `https://tabenote.app/privacy` |
| 利用規約(EULA)※説明文に記載 | `https://tabenote.app/terms` |

**入力前に4つとも実際に開けることを確認する。** 404 のまま入力すると審査に落ちる。
特定商取引法に基づく表記(`https://tabenote.app/tokusho`)は ASC の入力欄には不要
(理由は `public/tokusho.html` および `docs/release-checklist.md` を参照)。

---

## 日本語(ja)

### 名前 (7)

```
tabenote
```

### サブタイトル (14)

```
薬膳の手帳。書くのは、あなた
```

### プロモーションテキスト (80)

いつでも差し替え可能(審査不要)。季節の話題を入れ替える使い方ができる。

```
食材を選ぶと、五味と性がひとつの五角形になる。二十四節気と五季から、いまの季節にすすめられる味も分かる。効能を書くのは、アプリではなく、持ち主であるあなたです。
```

### キーワード (72)

カンマ区切り、スペースなし。「tabenote」「薬膳」は名前・説明文から自動で拾われるため入れない。

```
中医学,五味,五行,帰経,寒熱,節気,二十四節気,食材,献立,季節,食事記録,和漢,漢方,体質,レシピ,食養生,薬食同源,セルフケア,手帳,料理
```

### 説明 (845)

```
tabenote(タベノート)は、中医学で伝統的に用いられてきた食材の分類を、図と言葉で確かめるための手帳です。

■ 選んだ食材が、ひとつの図形になる

食材を選ぶと、その組み合わせの五味(酸・苦・甘・辛・鹹)の構成と、性(寒熱)の傾向が、ひとつの五角形として表示されます。何が多くて何が足りないのか、形で分かります。

■ 435品目の図鑑

収録した食材それぞれについて、五味・性・帰経・分類を掲載。★を付けたり、自分の言葉でメモを残したりできます。

■ 二十四節気と、五季

いまがどの節気にあたるか、五季(春・夏・長夏・秋・冬)のどこにいるかを表示し、その季節にすすめられる味をお知らせします。

■ AIによる献立のアイデア

選んだ食材といまの季節から、料理の方向性までのアイデアを提案します。

■ 効能は、アプリが書きません

tabenote が表示するのは、五味・性・帰経・分類という事実データまでです。「効く」「治る」といった効能や、症状・病名は扱いません。点数も付けません。解釈と記録は、持ち主であるあなたが自分の言葉で書きます。本アプリは医師の診断・治療の代わりにはなりません。

── ご利用について ──

本アプリのご利用には「tabenote 月額プラン」(自動更新サブスクリプション)のご登録が必要です。

・期間: 1か月ごとの自動更新
・価格: App Store 上に表示される価格
・自動更新: 現在の期間が終了する24時間以上前に解約しない限り、自動的に更新されます
・請求: 購入の確定時に Apple アカウントに課金されます
・解約: iPhoneの「設定」→ Apple アカウント →「サブスクリプション」からいつでも解約できます。アプリを削除しても解約にはなりません

利用規約(EULA): https://tabenote.app/terms
プライバシーポリシー: https://tabenote.app/privacy
```

---

## 英語(en-US)

### Subtitle (27)

```
A notebook for what you eat
```

### Promotional Text (160)

```
Pick a few ingredients and watch the five flavors and thermal nature settle into a single pentagon. tabenote shows the facts — what they mean is yours to write.
```

### Keywords (98)

```
chinese medicine,five flavors,solar terms,seasonal,ingredients,meal,food diary,herbal,tcm,wellness
```

### Description (1,847)

```
tabenote is a notebook for looking at food through the classifications long used in Chinese dietary theory — shown as a shape, and as plain facts.

■ Your ingredients become one shape

Pick a few ingredients and their combined five flavors (sour, bitter, sweet, pungent, salty) and thermal nature appear as a single pentagon. What you have plenty of, and what is missing, is visible at a glance.

■ An encyclopedia of 435 ingredients

Each entry carries its flavor, nature, meridian affinity, and category. Star the ones you like, and write your own notes.

■ The 24 solar terms and the five seasons

See which solar term the year is in now, where that falls among the five seasons (spring, summer, late summer, autumn, winter), and which flavors are traditionally favored at this time.

■ AI menu ideas

From the ingredients you picked and the current season, tabenote suggests dish ideas and directions to cook in.

■ The app does not write effects

tabenote shows factual classifications — flavor, nature, meridian, category — and stops there. It makes no claims about curing, treating, or improving anything, names no symptoms or conditions, and gives no scores. The interpretation is yours to write. This app is not a substitute for diagnosis or treatment by a physician.

── Subscription ──

Using tabenote requires the tabenote Monthly Plan, an auto-renewing subscription.

• Length: renews automatically every month
• Price: as shown on the App Store
• Auto-renewal: renews unless cancelled at least 24 hours before the end of the current period
• Billing: charged to your Apple Account at confirmation of purchase
• Cancelling: Settings → Apple Account → Subscriptions on your iPhone, any time. Deleting the app does not cancel the subscription

Terms of Use (EULA): https://tabenote.app/terms
Privacy Policy: https://tabenote.app/privacy
```

---

## 審査メモ(App Review Information → Notes)

購読しないと中身が見えないアプリなので、これを書かないと審査側が何も操作できず落ちる。

```
本アプリは全機能が「tabenote 月額プラン」(自動更新サブスクリプション)の対象です。
起動直後に購読案内が表示され、未購読の状態では各タブの内容をご覧いただけません。

サンドボックス環境で「登録する」をタップして購入を完了させると、
すべての機能をご確認いただけます。購入後にご確認いただきたい箇所:

1. ホーム: 現在の二十四節気・五季と、その季節にすすめられる味の表示
2. 組み合わせ: 食材を複数選ぶと、五味と性の五角形が変化します
3. アドバイス: 選んだ食材から、AIが献立のアイデアを提案します(通信が必要です)
4. 手帳: 食材への★とメモ、保存した組み合わせ

本アプリは、中医学で伝統的に用いられてきた食材の分類(五味・性・帰経)を
情報として表示するものです。効能・症状・病名は扱わず、
医療行為や医学的助言を目的としたものではありません。
```

## 「サブスクリプションの表示名」(App Store Connect の商品側)

アプリ内のペイウォール(`src/i18n/strings.ts` の `paywall.planName`)と揃える。

```
ja: tabenote 月額プラン
en: tabenote Monthly Plan
```

---

## メモ

- 説明文の1行目(改行までの部分)が検索結果とプレビューに出るので、そこだけで意味が通るようにしてある
- 効能表現(効く・治る・改善)を入れないのは設計書 2章・9章の制約であり、
  医療系の審査(App Review Guideline 1.4.1)を避ける目的も兼ねている
- キーワードに「漢方」「体質」を含めているが、薬機法上の広告表現に踏み込まない範囲に留めている。
  審査で指摘された場合はここから削るのが早い
- 日本語キーワードは72文字で、上限100までまだ余地がある。
  リリース後、実際の検索流入を見ながら埋めていくとよい
