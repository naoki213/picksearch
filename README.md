# picksearch

Amazonアソシエイト向けの静的サイト。[Eleventy](https://www.11ty.dev/)でMarkdown記事をビルドし、GitHub Pagesにデプロイする。

設計方針の詳細は [docs/site-architecture-proposal.md](docs/site-architecture-proposal.md) を参照。

## セットアップ

```bash
npm install
npm run serve   # http://localhost:8080 でプレビュー
npm run build   # _site/ に静的ファイルを出力
```

## 記事の追加

1. `src/articles/reviews/`（レビュー）、`src/articles/comparisons/`（比較）、`src/articles/rankings/`（ランキング）のいずれかに Markdown ファイルを作成する。
2. front matter に `title` / `description` / `category` / `tags` / 商品情報（`product` または `items`）を記述する。既存記事（`*-sample.md`）を雛形としてコピーすると早い。
3. `category` は `src/_data/categories.json` に定義済みの slug を使う。新規カテゴリを追加する場合はここに1件足すだけでよい。
4. カテゴリ一覧・タグ一覧・関連記事・`sitemap.xml`・検索インデックスはビルド時に自動生成される。手動更新は不要。

## 公開前に変更が必要な設定値

- `src/_data/site.json`: `baseUrl`（独自ドメイン）、`amazonAssociateTag`（Amazonアソシエイトタグ）、`defaultOgImage` などをプレースホルダーから実際の値に置き換える。
- 独自ドメインを使う場合は `src/CNAME` にドメイン名のみを記載したファイルを追加する（`.eleventy.js`が自動でpassthroughコピーする）。

## デプロイ

`.github/workflows/deploy.yml` が `main` ブランチへのpushをトリガーにビルドし、GitHub Pagesへデプロイする。リポジトリの Settings > Pages で "GitHub Actions" をソースに設定しておくこと。
