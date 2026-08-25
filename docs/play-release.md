# Google Play 提出手順(クローズドテスト → 本番)

2026-08-25 作成。iOS 側は [申請準備-入力素材.md](./申請準備-入力素材.md) と [release-checklist.md](./release-checklist.md) を参照。
ここは **Android 固有の作業だけ**を、Play Console の操作順に並べたもの。

## 前提と現状(2026-08-25)

- [x] Google Play デベロッパー登録 済み
- [x] `app.json` の Android 設定(`package: app.tabenote.main`、アイコン、ロケール)
- [x] EAS の Android キーストア(初回 preview ビルドで自動生成、EAS サーバー保管)
- [x] **課金ライブラリの組み込み**(`react-native-purchases` 10.7.1 / `src/lib/billing.ts`。iOS と共通で、
      Android 用に足すコードは無い。必要なのは `EXPO_PUBLIC_RC_ANDROID_KEY` だけ)
- [x] アプリ内の購読文言・管理URLをストア別に切り替え(`src/constants/site.ts` の `Store`)
- [x] `eas.json` に `submit.production.android`(internal トラック・draft)
- [x] **RevenueCat に Android アプリを追加** → `EXPO_PUBLIC_RC_ANDROID_KEY` を EAS に登録(production / preview 両方。2026-08-25 完了)
- [ ] Play Console でアプリ作成・ストア掲載・AAB アップロード
- [ ] 定期購入商品の作成(**AAB を上げるまで作れない**。下の Step 7)
- [ ] ライセンステスターで課金テスト → クローズドテスト14日 → 本番申請

## 作業順(ここを間違えると手戻りする)

Google Play は **課金ライブラリ入りのビルドを1本アップロードするまで「定期購入」を作らせない**。
一方 RevenueCat の Android APIキーは**商品が無くても発行される**(アプリを登録した時点でもらえる)。
なので順序はこうなる:

```
課金ライブラリ(済) → RC に Android アプリ登録 → goog_ キーを EAS へ
  → AAB ビルド → クローズドテストにアップロード(公開はまだ押さない)
  → 定期購入を作成 → RC に商品を紐付け → ライセンステスターで購入テスト
  → クローズドテスト公開(14日) → 本番申請
```

**キーは Step 2 でビルド前に入れておくこと。** 商品の紐付け(Step 8)はビルド後で構わないので、
この順序なら**再ビルドは要らない**。

**⚠️ 個人アカウントの場合**、本番公開の前に **クローズドテスト(テスター12人以上・14日間連続)** が必須。
テストを始めた日から最短2週間後に「本番アクセスの申請」ができる。テスターは Gmail アドレスで招待し、
本人がテストに参加(オプトイン)して**アプリをインストールした状態を14日維持**する必要がある。

**⚠️ `EXPO_PUBLIC_RC_ANDROID_KEY` 未設定のまま本番ビルドすると**、`billingEnabled()` が false になり
**課金ゲートが消えて全機能が無料で使える + AI提案は中継サーバーに弾かれる**バイナリになる。
クローズドテストに配るビルドでも、必ず Step 2 を先に済ませる。

## Step 1. Play Console でアプリを作成

Play Console →「アプリを作成」:

| 欄 | 入力値 |
|---|---|
| アプリ名 | `tabenote — Ingredient Notes` |
| デフォルトの言語 | 英語(米国) — en-US |
| アプリ / ゲーム | アプリ |
| 無料 / 有料 | **無料**(課金はアプリ内定期購入。「有料」にすると後で無料に戻せない) |

作成後、左メニューの「ダッシュボード」に出るタスクを上から潰す。

## Step 2. RevenueCat に Android アプリを追加 → APIキーを EAS へ(ビルド前に必須)

**商品(定期購入)はまだ作れないが、それとは無関係にキーは取れる。** ここで取ってビルドに焼き込む。

1. Play Console →「収益化の設定」→ **ライセンスキー(Base64 RSA 公開鍵)** は不要(RevenueCat は使わない)
2. Google Cloud で**サービスアカウント**を作り、Play Console →「ユーザーと権限」で招待、
   権限は「財務データの表示」「注文管理」「アプリ情報の表示」。JSON キーをダウンロード
   (RevenueCat の手順: https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)
   **権限が RevenueCat から使えるようになるまで最大36時間かかる**ので、ここは早めに済ませておく
3. RevenueCat →(既存の tabenote プロジェクト)→ **+ New app → Google Play**
   - Package: `app.tabenote.main`
   - Service Account credentials JSON をアップロード
4. **Public API key(`goog_…`)** を控えて EAS に登録:

   ```sh
   npx eas env:create --environment production --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_xxx --visibility plaintext
   npx eas env:create --environment preview    --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_xxx --visibility plaintext
   npx eas env:list --environment production   # IOS_KEY と ANDROID_KEY の両方が出ること
   ```

5. サービスアカウントの JSON は、EAS submit にも同じものが使える。
   リポジトリ直下に `google-play-service-account.json` として置く(**.gitignore 済み**。コミットしない)。

商品の紐付け(Products → + New product)は、Play 側に商品が存在しないと出来ない。**Step 8 で行う**。

## Step 3. ストアの掲載情報(Play 版 素材A)

Play Console →「ストアでの表示」→「メインのストアの掲載情報」。文字数上限が ASC と違う。

**✅ en-US の確定テキストとグラフィックは [play-listing-en.md](./play-listing-en.md) にまとめた**（そのまま貼れる形・字数カウント済み）。以下は概要と日本語ローカライズ。

### English(en-US)— デフォルト

**App name**(27/30): `tabenote — Ingredient Notes`

**Short description**(≤80):

```
Pair ingredients by flavor and season, the way a seasoned chef does.
```

**Full description**(≤4000): 素材A の英語説明文をそのまま使い、**SUBSCRIPTION 以下を次に差し替える**
(Apple / EULA の記述は Play では不適切):

```
SUBSCRIPTION
All features require the "tabenote Monthly Plan", an auto-renewable monthly subscription.
- Price: $9.99/month (the price in your local currency is shown on the purchase screen)
- Payment is charged to your Google Play account. The subscription renews automatically unless cancelled at least 24 hours before the end of the current period
- You can manage or cancel anytime in Google Play → Payments & subscriptions → Subscriptions

Terms of Use: https://tabenote.app/terms
Privacy Policy: https://tabenote.app/privacy

This app does not promise medical or health benefits. If you have health concerns, please consult a medical professional.
```

### 日本語(ja-JP)— 追加の翻訳

**アプリ名**(19/30): `tabenote — 料理人の食材手帳`

**簡単な説明**(≤80):

```
五味と季節で食材を組み合わせる、料理人の目で選ぶための手帳。効能は書きません。
```

**詳しい説明**: 素材A の日本語説明文をそのまま使い、**「●ご利用には購読が必要です」以下を差し替える**:

```
●ご利用には購読が必要です
すべての機能のご利用には、月額サブスクリプション「tabenote 月額プラン」(自動更新)への登録が必要です。
・価格: 月額1,000円(日本の Google Play の場合。その他の地域の価格は購入画面に表示されます)
・購読は Google Play アカウントに請求され、期間終了の24時間前までに解約しない限り自動更新されます
・解約・管理は、購入後いつでも Google Play の「お支払いと定期購入」→「定期購入」から行えます

利用規約: https://tabenote.app/terms
プライバシーポリシー: https://tabenote.app/privacy

※本アプリは医療・健康効果を保証するものではありません。体調に不安があるときは医療の専門家にご相談ください。
```

### 画像(Play は必須項目が多い)

| 素材 | 仕様 | 元ネタ |
|---|---|---|
| アプリアイコン | 512×512 PNG(32bit、角丸なし) | ✅ `docs/play-assets/icon-512.png` |
| **フィーチャー グラフィック** | **1024×500 JPG/PNG(必須)** | ✅ `docs/play-assets/feature-graphic-light-1024x500.png`(ダーク版も同梱)。og.png は「薬膳手帳」表記なので流用しない |
| スマホのスクリーンショット | 2〜8枚、16:9〜9:16、最短辺 320px 以上、最長辺 3840px 以下 | iOS 用スクショ(6.9インチ 1320×2868)を**そのまま流用可**(比率 9:19.5 は許容範囲) |
| 7インチ / 10インチ タブレット | 任意(`supportsTablet: false` 相当の扱いだが Play は任意) | 省略 |

カテゴリ: **フード&ドリンク**。タグは任意。
連絡先: メール(必須)、ウェブサイト `https://tabenote.app`。

## Step 4. アプリのコンテンツ(ダッシュボードのタスク)

- **プライバシー ポリシー**: `https://tabenote.app/privacy`
- **アプリのアクセス**: 「すべての機能を制限なく利用できる」は**選ばない**。「一部またはすべての機能が制限されている」→ 手順を追加:
  「All features require an in-app subscription. Reviewers can purchase with a license-tester account (added under Setup → License testing) — test purchases are free. No login/account exists in the app.」
  そのために **Play Console →「設定」→「ライセンス テスト」に審査用の Gmail を追加**しておく(Step 9)
- **広告**: 含まない
- **広告 ID(申告)**: **「いいえ」**。ただし `@layers/react-native` が `play-services-ads-identifier` を依存に持ち、
  その AAR から `com.google.android.gms.permission.AD_ID` が推移的にマージされるため、
  **素のビルドで「いいえ」を選ぶと Play が公開をブロックする**(「はい を選ぶか、マニフェストから権限を削除してください」と出る)。
  アプリは `setConsent({ advertising: false })`(`src/lib/analytics.tsx`)で広告IDを使わない方針なので、
  「はい」にせず**権限側を消して申告と実態を合わせる**。`app.json` に追加済み(2026-08-25):

  ```json
  "android": { "blockedPermissions": ["com.google.android.gms.permission.AD_ID"] }
  ```

  マージ後のマニフェストが `<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"/>`
  になることを `npx expo prebuild -p android` で確認済み(確認後は生成された `android/` を消し、prebuild が書き換える
  `package.json` の scripts を `git checkout` で戻すこと)。iOS の ATT キー削除(`plugins/strip-att-key.js`)と同じ趣旨。
  **⚠️ 権限はバイナリに焼き込まれるので、既にアップロード済みの AAB には効かない。Step 5 で再ビルドすること。**
  副作用: Layers の GAID 取得が常に null になる(インストールリファラは影響なし)。広告出稿を始めるときはこの設定を外し、
  データセーフティに「広告ID」を申告し直すこと。
- **コンテンツのレーティング**: IARC 質問票。暴力・性的・薬物・ギャンブル: なし。
  「健康・医療の助言」系は **なし**(効能を扱わない設計)。ユーザー間の交流: なし。→ 3+ / Everyone
- **ターゲット ユーザー**: 18歳以上(子ども向けではない。13〜17 を含めると追加要件が増える)
- **ニュース アプリ**: いいえ
- **データ セーフティ**:
  - データを収集・共有するか → **はい**
  - **購入履歴**: 収集する / 共有しない / 必須 / 用途: アプリの機能・分析 / 暗号化して送信: はい / 削除リクエスト: 不可(端末内のみ・アカウント無し)
  - **その他のユーザー作成コンテンツ**(AI提案で送る食材名・季節): 収集する / **第三者と共有する**(Anthropic API 経由)/ 任意 / 用途: アプリの機能 / 暗号化: はい
  - **デバイスまたはその他の ID**（RevenueCat の匿名 app user ID。`src/lib/billing.ts` の `P.configure({ apiKey })` が生成し、AI中継のレート制限キーにも使う）: 収集する / 共有しない / 必須 / 用途: アプリの機能・不正行為防止/セキュリティ / 暗号化: はい
  - **位置 / 連絡先 / 個人情報**: 収集しない
  - 「セキュリティ対策: 転送中に暗号化」はい、「データ削除をリクエストできる」いいえ(該当データを保持しないため。理由欄に「no account; nothing retained server-side beyond subscription state」)
- **政府発行アプリ / 金融 / ヘルス**: すべて「いいえ」(ヘルスアプリの申告をすると医療系の審査に入る。効能を扱わないので該当しない)

## Step 5. 本番用ビルド(AAB)

Step 2 の環境変数が入った**あと**で:

```sh
npx eas build -p android --profile production --non-interactive
```

`production` プロファイルは Android では既定で **AAB** を出す(Play はAPKを受け付けない)。
`autoIncrement: true` で versionCode が上がる(`appVersionSource: remote`。今回の preview ビルドで 1 に初期化済み、次は 2)。

## Step 6. クローズドテストに AAB をアップロード(公開はまだ押さない)

**この1本を上げて初めて「定期購入」が作れるようになる。** テスターを集めるのは商品と課金テストが
済んでからで良いので、ここでは「リリースを作成して下書きのまま保存」までにしておく。

1. Play Console →「テスト」→「クローズドテスト」→「Alpha」トラック(既定名)→「新しいリリースを作成」
2. **初回は AAB を手動アップロード**(EAS submit はアプリの初回作成を代行できない)。
   EAS のビルドページから `.aab` をダウンロード → ドラッグ&ドロップ
3. リリース名は自動(`1 (1.0.0)`)、リリースノートは英語で1行(「Initial closed test.」)
4. **「下書きとして保存」**(「公開を開始」はまだ押さない。押しても審査が入るだけで害は無いが、
   テスターが揃っていない状態で14日カウントを始めても意味が無い)

2回目以降のアップロードは EAS から:

```sh
npx eas submit -p android --latest      # eas.json の submit.production.android(internal・draft)
```

`track` を `alpha` に変えればクローズドテストへ直接上げられる。`releaseStatus: draft` なので
Play Console で「公開」を押すまで配布されない。

## Step 7. 定期購入商品(← AAB を上げて初めて作れる)

Play Console →「収益化」→「商品」→「定期購入」→「定期購入を作成」:

| 欄 | 入力値 |
|---|---|
| 商品ID | `tabenote.premium.monthly`(**コード側 `src/lib/billing.ts` と一致。作成後変更不可**) |
| 名前 | `tabenote Monthly Plan`(en)/ `tabenote 月額プラン`(ja) |
| 説明 | 素材B と同じ |
| 特典 | 「All features: pairing, journal, AI ideas」 |

基本プラン(base plan)を追加:

| 欄 | 入力値 |
|---|---|
| 基本プランID | `monthly` |
| 種類 | 自動更新 |
| 請求期間 | 1か月 |
| 猶予期間 | 3日(既定) |
| 価格 | **USD 9.99 ベース → 日本のみ 1,000円 に手動設定**(iOS と同じ方針) |

保存 → 基本プランを「有効化」する。有効化しないと購入画面にプランが出ない(RevenueCat が `Offerings` を返さない)。

## Step 8. RevenueCat に商品を紐付け

Step 7 で商品を作り、**基本プランを有効化した後**に行う(有効化前だと RevenueCat 側で商品が見つからない)。

1. RevenueCat →(Step 2 で作った Google Play アプリ)→ Products → **+ New product**
   - Product ID: `tabenote.premium.monthly`、Base plan ID: `monthly`
2. Entitlement `pro` に attach(コード側 `src/lib/billing.ts` の `ENTITLEMENT_ID`)
3. Offering `default` に月額パッケージとして追加(iOS と同じ Offering に Android 商品を足すだけ)

ここまでで `getPlans()` が Android でもプランを返すようになる。返らない場合の原因はほぼこの3つ:
基本プランが未有効、サービスアカウント権限の反映待ち(最大36時間)、Offering に足し忘れ。

## Step 9. ライセンステスターを登録 → 課金テスト

1. Play Console →「設定」→**「ライセンス テスト」**に、テストする Gmail アドレスを追加
   (自分・審査担当・クローズドテスターの全員を入れておく。ここに無いアカウントは**実際に課金される**)
2. そのアカウントを Alpha トラックのテスターに入れ、招待リンクからインストール
   (ライセンステスターであっても、**トラックのテスターに入っていないとインストールできない**)
3. アプリで通しの確認:
   - [ ] ペイウォールに `¥1,000 / 月`(= Play のローカライズ価格)が出る
   - [ ] 購入 → テスト用の支払い方法が出る → 購入完了でゲートを抜ける
   - [ ] AI提案が通る(中継サーバーが RevenueCat の app_user_id を検証している)
   - [ ] アプリを消して入れ直し →「購入を復元」で購読が戻る
   - [ ] 設定 →「サブスクリプションの管理」が Google Play の管理画面を開く
   - [ ] RevenueCat ダッシュボードの Customer History に購入が出る(**Sandbox** 表示になる)

テスト購読は更新間隔が短縮される(月額 → 5分)。解約・失効の挙動もここで見ておくと早い。

## Step 10. クローズドテストを公開してテスターを集める(14日カウント開始)

1. 「テスト」→「クローズドテスト」→ Alpha →「テスター」タブ →「メーリング リストを作成」→
   Gmail アドレスを **12人以上** 登録
   (家族・友人・Shipaton 仲間など。テスター本人が招待リンクを開いて「参加」し、Play からインストールする必要がある)
2. Step 6 で下書きにしたリリースを「リリースをレビュー」→「クローズドテストとして公開を開始」
3. 招待リンク(`https://play.google.com/apps/testing/app.tabenote.main`)をテスターに配る
4. **開始日をメモする**: `_____ 年 __ 月 __ 日` → 14日後に「本番へのアクセスを申請」が押せるようになる

テスターは Step 9 でライセンステスターに入れておくこと。入れ忘れたテスターは**実際に課金される**。

## Step 11. 本番公開(14日後)

1. 「テスト」→「クローズドテスト」→ 14日経過後に「本番へのアクセスを申請」→ 質問票に答える
   (テストで何を確認したか、フィードバックをどう反映したか、を英語で数行)
2. 承認されたら「本番」→「新しいリリースを作成」→ 同じ AAB(またはその時点の最新)
3. 配信国: **iOS と同じく EU/EEA を外す**(Play の DSA トレーダー要件も回避できる)
4. 審査は通常 1〜7 日

## Android 実機での確認項目(preview APK)

`preview` プロファイルは `distribution: internal` = **APK**。EAS のビルドページの URL を Android で開いてインストール
(「提供元不明のアプリ」の許可が要る)。`EXPO_PUBLIC_RC_ANDROID_KEY` が preview に無い間は課金ゲートが出ない。

- [ ] 起動・スプラッシュ・アイコン(adaptive icon の見切れ)
- [ ] 4タブすべて、ダークモード、日本語/英語切替
- [ ] 戻るジェスチャー(`predictiveBackGestureEnabled: false`)でモーダルが閉じる
- [ ] 設定 → 「サブスクリプションの管理」が **Google Play** の管理画面を開く(文言も Google Play になっている)
- [ ] ペイウォールの更新・解約説明が Google Play 版になっている
- [ ] 利用規約・プライバシー・お問い合わせのリンクがブラウザで開く
- [ ] `tabenote://open` のディープリンク(`@layers/expo` の intentFilter)
- [ ] Step 2 完了後: preview を再ビルドし、ライセンステスターで **購入 → AI提案 → 復元** を通しで確認
