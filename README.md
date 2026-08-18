# camegone 自己紹介サイト（Hugo + Cloudflare Workers）

## ファイル構成

```
content/ja/_index.md   ← 日本語ページの中身（ここを編集する）
content/en/_index.md   ← 英語ページの中身（ここを編集する）
content/eo/_index.md   ← エスペラント語ページの中身（ここを編集する）
layouts/                普段は触らなくてOK（デザインの構造）
static/css/style.css    色・フォントなど見た目を変えたい時はここ
src/index.js             "/" にアクセスされた時、ブラウザの言語設定を見て
                          /ja/ /en/ /eo/ のどれかに自動リダイレクトするWorker
wrangler.jsonc           Cloudflareへのデプロイ設定
build.sh                 Cloudflare上でHugoをインストールしてビルドするスクリプト
hugo.toml                サイト全体の設定（言語一覧・サイトURLなど）
```

## 内容を更新する

`content/<言語>/_index.md` を開くと、上部に `---` で囲まれた設定（role, description,
links）、下に自己紹介文（Markdown）があります。

- 自己紹介文はふつうのMarkdownとして書けます（**太字**、[リンク](https://example.com) など）
- リンクを増やしたい時は `links:` の下に同じ形式で1行足すだけです

```yaml
links:
  - name: "mastodon"
    url: "https://example.social/@camegone"
```

3つの言語ファイルは独立しているので、内容がずれても壊れません（更新を忘れても
古い方の言語がそのまま表示されるだけです）。

## デプロイ方法（Cloudflare）

Cloudflareは2025〜2026年にかけて、GitHub連携によるサイトのデプロイ方法を
「Pages」から「Workers（静的アセット付き）」という仕組みに統合しました。
このプロジェクトはその現行の仕組みに合わせてあります（Hugo公式サイトの
Cloudflareホスティング手順 https://gohugo.io/host-and-deploy/host-on-cloudflare/
に準拠）。

1. このフォルダの中身をGitHubリポジトリにpushする（`git init` → `git add .` →
   `git commit` → `git push`。空のリポジトリのまま放置しないよう注意）
2. Cloudflareダッシュボード右上の「Add」→「Workers」を選択
3. 「Connect GitHub」から、対象のGitHubリポジトリを選ぶ
   - 選択肢に出てこない場合、GitHub側でCloudflare Workers and Pagesアプリに
     このリポジトリへのアクセス権限が渡っていない可能性があります
     （GitHubの Settings → Applications → Installed GitHub Apps →
     Cloudflare Workers and Pages → Configure から、リポジトリを追加できます）
4. 「Set up your application」画面で
   - Project name: 好きな名前（`wrangler.jsonc` の `name` と合わせるのが安全です。
     違う名前にする場合は `wrangler.jsonc` の `name` も書き換えてください）
   - **Build command は空欄のまま**にする（`wrangler.jsonc` 側の `build.command`
     が `build.sh` を実行してHugoのビルドまで行います）
   - Deploy command は `npx wrangler deploy` のまま
   - 「Advanced settings」を開き、環境変数 `SKIP_DEPENDENCY_INSTALL` に `true`
     を設定する（Cloudflare側の自動依存インストールをスキップし、`build.sh`
     に任せるため）
5. Deployを押してビルドを待つ
6. デプロイ後、プロジェクトの Settings → Domains から独自ドメインを設定する
7. `hugo.toml` の1行目 `baseURL` を実際のドメインに書き換えて、再度push
   （baseURLが正しくないと、構造化データやhreflangタグの絶対URLがズレます）

### ビルドキャッシュを有効にする（任意・推奨）

`package.json` と `package-lock.json` は同梱済みなので、あとはダッシュボードで
有効化するだけです。Workers & Pages → 対象プロジェクト → Settings → Build →
Build cache → Enable。

## 「Failed: error occurred while fetching repository」というビルドエラーが出たら

これはHugoやこのプロジェクトの中身の問題ではなく、Cloudflareが指定のGitHub
リポジトリを取得（clone）できていないという、もっと手前の段階のエラーです。
主な原因は次のいずれかです。

1. **リポジトリにまだ何もpushされていない**
   GitHub上でリポジトリを作っただけで、このフォルダの中身をpushし忘れている
   ケースが一番多いです。GitHubのリポジトリページを開いて、ファイル一覧が
   実際に表示されるか確認してください。
2. **ブランチ名が食い違っている**
   Cloudflare側は `main` ブランチを取得しようとしますが、リポジトリの
   デフォルトブランチが `master` など別名になっていないか確認してください
   （GitHubのリポジトリ画面で、ブランチ切り替えの表示を見れば分かります）。
3. **CloudflareのGitHub Appにこのリポジトリへのアクセス権が渡っていない**
   github.com/settings/installations を開き、「Cloudflare Workers and Pages」
   を探して「Configure」を押す → 「Repository access」で対象のリポジトリが
   含まれているか（もしくは「All repositories」になっているか）を確認してください。
   後から作ったリポジトリは、ここに手動で追加しないとCloudflareから見えません。

上記を確認・修正したら、ビルド画面の「Retry build」でもう一度試せます。

## 確認ポイント

- 実際のドメインに繋いだら、ブラウザの言語設定を日本語／英語／その他に変えて
  トップページ（`/`）にアクセスし、意図した言語にリダイレクトされるか確認する
- `/ja/` `/en/` `/eo/` にはそれぞれ直接アクセスもできます（リダイレクトを経由
  しないので、検索エンジンやAIのクローラーもどの言語のページにも直接たどり着けます）
- **エスペラント訳は下書きです。** 文法・語彙ともに、公開前に一度ネイティブ／
  上級者にチェックしてもらうことをおすすめします
- Cloudflareの「AI Crawl Control」設定画面で、Searchカテゴリのクローラーが
  ブロックされていないか一度確認しておくと安心です
