# Google Play 提出手順(クローズドテスト → 本番)

2026-08-25 作成。iOS 側は [申請準備-入力素材.md](./申請準備-入力素材.md) と [release-checklist.md](./release-checklist.md) を参照。
ここは **Android 固有の作業だけ**を、Play Console の操作順に並べたもの。

## 前提と現状(2026-08-25)

- [x] Google Play デベロッパー登録 済み
- [x] `app.json` の Android 設定(`package: app.tabenote.main`、アイコン、ロケール)
- [x] EAS の Android キーストア(初回 preview ビルドで自動生成、EAS サーバー保管)
- [x] アプリ内の購読文言・管理URLをストア別に切り替え(`src/constants/site.ts` の `Store`)
- [x] `eas.json` に `submit.production.android`(internal トラック・draft)
- [ ] **RevenueCat に Android アプリを追加** → `EXPO_PUBLIC_RC_ANDROID_KEY` を EAS に登録(下の Step 2)
- [ ] Play Console でアプリ作成・定期購入商品・ストア掲載・テスト
- [ ] production プロファイルで AAB ビルド → アップロード

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

## Step 2. RevenueCat に Android を追加(ビルド前に必須)

1. Play Console →「収益化の設定」→ **ライセンスキー(Base64 RSA 公開鍵)** は不要(RevenueCat は使わない)
2. Google Cloud で**サービスアカウント**を作り、Play Console →「ユーザーと権限」で招待、
   権限は「財務データの表示」「注文管理」「アプリ情報の表示」。JSON キーをダウンロード
   (RevenueCat の手順: https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials)
3. RevenueCat →(既存の tabenote プロジェクト)→ **+ New app → Google Play**
   - Package: `app.tabenote.main`
   - Service Account credentials JSON をアップロード
4. Products → **+ New product** → Google Play 側で作った商品(Step 4)を紐付け:
   - Product ID: `tabenote.premium.monthly`、Base plan ID: `monthly`
   - Entitlement `pro` に attach
   - Offering `default` に月額パッケージとして追加(iOS と同じ Offering に Android 商品を足すだけ)
5. **Public API key(`goog_…`)** を控えて EAS に登録:

   ```sh
   npx eas env:create --environment production --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_xxx --visibility plaintext
   npx eas env:create --environment preview    --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_xxx --visibility plaintext
   npx eas env:list --environment production   # IOS_KEY と ANDROID_KEY の両方が出ること
   ```

6. サービスアカウントの JSON は、EAS submit にも同じものが使える。
   リポジトリ直下に `google-play-service-account.json` として置く(**.gitignore 済み**。コミットしない)。

## Step 3. ストアの掲載情報(Play 版 素材A)

Play Console →「ストアでの表示」→「メインのストアの掲載情報」。文字数上限が ASC と違う。

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
| アプリアイコン | 512×512 PNG(32bit、角丸なし) | `assets/images/icon.png` を書き出し |
| **フィーチャー グラフィック** | **1024×500 JPG/PNG(必須)** | 新規作成。OG画像(`public/og.png` 1200×630)をトリミング/再構成 |
| スマホのスクリーンショット | 2〜8枚、16:9〜9:16、最短辺 320px 以上、最長辺 3840px 以下 | iOS 用スクショ(6.9インチ 1320×2868)を**そのまま流用可**(比率 9:19.5 は許容範囲) |
| 7インチ / 10インチ タブレット | 任意(`supportsTablet: false` 相当の扱いだが Play は任意) | 省略 |

カテゴリ: **フード&ドリンク**。タグは任意。
連絡先: メール(必須)、ウェブサイト `https://tabenote.app`。

## Step 4. 定期購入商品

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

## Step 5. アプリのコンテンツ(ダッシュボードのタスク)

- **プライバシー ポリシー**: `https://tabenote.app/privacy`
- **アプリのアクセス**: 「すべての機能を制限なく利用できる」は**選ばない**。「一部またはすべての機能が制限されている」→ 手順を追加:
  「All features require an in-app subscription. Reviewers can purchase with a license-tester account (added under Setup → License testing) — test purchases are free. No login/account exists in the app.」
  そのために **Play Console →「設定」→「ライセンス テスト」に審査用の Gmail を追加**しておく
- **広告**: 含まない
- **コンテンツのレーティング**: IARC 質問票。暴力・性的・薬物・ギャンブル: なし。
  「健康・医療の助言」系は **なし**(効能を扱わない設計)。ユーザー間の交流: なし。→ 3+ / Everyone
- **ターゲット ユーザー**: 18歳以上(子ども向けではない。13〜17 を含めると追加要件が増える)
- **ニュース アプリ**: いいえ
- **データ セーフティ**:
  - データを収集・共有するか → **はい**
  - **購入履歴**: 収集する / 共有しない / 必須 / 用途: アプリの機能・分析 / 暗号化して送信: はい / 削除リクエスト: 不可(端末内のみ・アカウント無し)
  - **その他のユーザー作成コンテンツ**(AI提案で送る食材名・季節): 収集する / **第三者と共有する**(Anthropic API 経由)/ 任意 / 用途: アプリの機能 / 暗号化: はい
  - **デバイス ID / 位置 / 連絡先 / 個人情報**: 収集しない
  - 「セキュリティ対策: 転送中に暗号化」はい、「データ削除をリクエストできる」いいえ(該当データを保持しないため。理由欄に「no account; nothing retained server-side beyond subscription state」)
- **政府発行アプリ / 金融 / ヘルス**: すべて「いいえ」(ヘルスアプリの申告をすると医療系の審査に入る。効能を扱わないので該当しない)

## Step 6. 本番用ビルド(AAB)

Step 2 の環境変数が入った**あと**で:

```sh
npx eas build -p android --profile production --non-interactive
```

`production` プロファイルは Android では既定で **AAB** を出す(Play はAPKを受け付けない)。
`autoIncrement: true` で versionCode が上がる(`appVersionSource: remote`。今回の preview ビルドで 1 に初期化済み、次は 2)。

## Step 7. クローズドテストを開始(明日の作業)

1. Play Console →「テスト」→「クローズドテスト」→「Alpha」トラック(既定名)→「新しいリリースを作成」
2. **初回は AAB を手動アップロード**(EAS submit はアプリの初回作成を代行できない)。
   EAS のビルドページから `.aab` をダウンロード → ドラッグ&ドロップ
3. リリース名は自動(`1 (1.0.0)`)、リリースノートは英語で1行(「Initial closed test.」)
4. 「テスター」タブ →「メーリング リストを作成」→ Gmail アドレスを **12人以上** 登録
   (家族・友人・Shipaton 仲間など。テスター本人が招待リンクを開いて「参加」し、Play からインストールする必要がある)
5. 「リリースをレビュー」→「クローズドテストとして公開を開始」
6. 招待リンク(`https://play.google.com/apps/testing/app.tabenote.main`)をテスターに配る
7. **開始日をメモする**: `_____ 年 __ 月 __ 日` → 14日後に「本番へのアクセスを申請」が押せるようになる

テスト中の購入は、Step 5 の「ライセンス テスト」に入れたアカウントなら無料(テスト用カードが出る)。
それ以外のテスターは実際に課金される(本番の定期購入がそのまま動く)ので、テスターにも
ライセンステスターとして登録しておくのが無難。

2回目以降のアップロードは EAS から:

```sh
npx eas submit -p android --latest      # eas.json の submit.production.android(internal・draft)
```

`track` を `alpha` に変えればクローズドテストへ直接上げられる。`releaseStatus: draft` なので
Play Console で「公開」を押すまで配布されない。

## Step 8. 本番公開(14日後)

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
