# camegone 自己紹介サイト（Hugo + Cloudflare Pages）

## ファイル構成

```
content/ja/_index.md   ← 日本語ページの中身（ここを編集する）
content/en/_index.md   ← 英語ページの中身（ここを編集する）
content/eo/_index.md   ← エスペラント語ページの中身（ここを編集する）
layouts/                普段は触らなくてOK（デザインの構造）
static/css/style.css    色・フォントなど見た目を変えたい時はここ
functions/_middleware.js  "/" にアクセスされた時、ブラウザの言語設定を見て
                          /ja/ /en/ /eo/ のどれかに自動リダイレクトする処理
hugo.toml               サイト全体の設定（言語一覧・サイトURLなど）
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

## デプロイ方法（Cloudflare Pages）

1. このフォルダの中身をGitHubリポジトリにpushする
2. Cloudflare Pagesダッシュボードで「Create a project」→ そのリポジトリを選択
3. ビルド設定
   - Framework preset: `Hugo`
   - Build command: `hugo --gc --minify`
   - Build output directory: `public`
4. 環境変数に `HUGO_VERSION` を設定しておくと、Cloudflare側で使われるHugoの
   バージョンを固定できます（例: `0.135.0`。お使いのバージョンに合わせてください）
5. デプロイ後、「Custom domains」から独自ドメインを設定する
6. `hugo.toml` の1行目 `baseURL` を実際のドメインに書き換えて、再度push
   （baseURLが正しくないと、構造化データやhreflangタグの絶対URLがズレます）

`functions/_middleware.js` はリポジトリの一番上の階層（`hugo.toml` と同じ場所）
に置いてあれば、Cloudflare Pagesが自動的に認識してビルドに組み込みます。特別な
設定は不要です。

## 確認ポイント

- 実際のドメインに繋いだら、ブラウザの言語設定を日本語／英語／その他に変えて
  トップページ（`/`）にアクセスし、意図した言語にリダイレクトされるか確認する
- `/ja/` `/en/` `/eo/` にはそれぞれ直接アクセスもできます（リダイレクトを経由
  しないので、検索エンジンやAIのクローラーもどの言語のページにも直接たどり着けます）
- **エスペラント訳は下書きです。** 文法・語彙ともに、公開前に一度ネイティブ／
  上級者にチェックしてもらうことをおすすめします
- Cloudflareの「AI Crawl Control」設定画面で、Searchカテゴリのクローラーが
  ブロックされていないか一度確認しておくと安心です
