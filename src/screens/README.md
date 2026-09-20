# src/screens

画面の実体。`src/app` のルートファイルはここを re-export するだけ。

分けている理由: Web(tabenote.app)ではアプリ本体を提供しない。ところが Expo Router は
`src/app` 配下を `require.context` で丸ごとバンドルに入れ、`about.web.tsx` のような
プラットフォーム別ルートも「両方入れて実行時に選ぶ」だけなので、`src/app` の中では
コードを Web のJSから外せない。実行時の `Platform.OS` 分岐も同じ。
結果として、画面に出ないまま図鑑の全件が誰でも落とせるJSに入っていた。

ふつうの import なら Metro がビルド時に `.web.tsx` を選ぶ。だから実体をここに置き、
各画面に空の `.web.tsx` を添えて import の鎖を断っている。

- 画面を足すとき: `Foo.tsx` と空の `Foo.web.tsx` をここに、re-export を `src/app` に置く
- `RootLayout.web.tsx` と `DownloadScreen` から `src/data` に届く import をしない
- 守れているかは `scripts/postbuild-web.js` が `build:web` のたびに検査する
