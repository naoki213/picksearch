# 雑録ノート

暮らし・旅行・グルメ・テクノロジー・健康・エンタメなど、ジャンルを問わず記事を量産できる、
自作の静的HTMLブログジェネレーターです。フレームワークに頼らず、Node.js の素朴なスクリプトで
Markdown記事をHTMLへ変換します。アフィリエイトリンクは含まない、純粋なブログ形式です。

## セットアップ

```bash
npm install
npm run build   # content/ 以下を dist/ にビルド
npm run serve   # dist/ を http://localhost:8080 でプレビュー
```

## ディレクトリ構成

```
content/
  site.json       # サイト全体の設定（タイトル、説明文、本番URLなど）
  genres.json     # ジャンル一覧（オールジャンル対応。ここに追加すればジャンルが増やせる）
  posts/*.md      # 記事本体（Markdown + フロントマター）
templates/        # HTMLテンプレート（layout / home / post / genre / 404 / 部品）
public/           # そのまま出力にコピーされる静的ファイル（CSS・JS・画像）
scripts/
  build.js        # content/ を読み込み dist/ にHTMLを生成するビルドスクリプト
  serve.js        # dist/ をプレビューするだけの軽量サーバー
  new-post.js     # 記事の下書きファイルを量産するためのCLI
dist/             # ビルド成果物（gitignore対象。npm run build で生成）
```

## 記事を量産する

新しい記事の下書きを作るには以下を実行します。

```bash
npm run new-post -- "記事タイトル" ジャンルID
```

`content/posts/` にフロントマター付きのMarkdownファイルが生成されるので、本文を書いて
`npm run build` を実行すれば自動的にHTML化されます。同じ手順を繰り返すだけで、
ジャンルを問わず記事を大量に追加していけます。

### フロントマターの項目

```yaml
---
title: "記事タイトル"
slug: "url-slug"
description: "検索結果やSNSシェア時に表示される要約文（120文字程度）"
genre: "life"        # content/genres.json に定義したジャンルID
tags: ["タグ1", "タグ2"]
date: "2026-07-01"
---
```

### ジャンルを追加する

`content/genres.json` に `{ "id": "...", "name": "...", "description": "..." }` を追記するだけで、
新しいジャンルの一覧ページ（`/genre/<id>/`）が自動生成されます。

## SEO / モバイル対応

- 記事・トップ・ジャンルページごとに `title` / `description` / OGP / Twitterカード / canonical を自動生成
- 記事ページには `BlogPosting` の構造化データ（JSON-LD）、トップページには `WebSite` の構造化データを出力
- `sitemap.xml` / `robots.txt` / `feed.xml`（RSS）を自動生成
- モバイルファーストのレスポンシブCSS（1カラム→2カラム→3カラム）、ハンバーガーメニュー対応
- 外部フォント・重いJSライブラリなし。CSSとJSは最小限で高速表示を重視

## 本番公開前に変更が必要な項目

`content/site.json` の `baseUrl` はプレースホルダー（`https://example.com`）です。
実際に公開するドメインが決まったら、この値を書き換えてから `npm run build` してください
（canonical URL・OGP・sitemap.xml・feed.xmlに反映されます）。
