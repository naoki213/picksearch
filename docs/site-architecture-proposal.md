# picksearch サイトアーキテクチャ設計書（提案）

ステータス: **提案（未実装）** — 承認後に scaffold 実装フェーズへ進む。

## 0. 前提とゴール

- Amazonアソシエイトで収益化する静的サイト
- Claude Codeで今後 **数百〜数千記事** を追加しやすい構成
- GitHub Pages + 独自ドメインで公開、レンタルサーバー/WordPress不使用
- HTML/CSS/JSのみで配信（ビルド時のツールにNode.jsを使うのは可）

## 1. 技術方針

記事数が数百〜数千規模になることと、「カテゴリ自動生成」「タグ管理」「関連記事」「ページネーション」「サイトマップ自動生成」を安定して要件どおり実現するには、**手書きHTMLの使い回し**より**静的サイトジェネレータ(SSG)によるビルド**が適している。

### 採用: Eleventy (11ty) + Nunjucks + markdown-it

理由:
- Node.js製で依存が軽量、出力は純粋な静的HTML/CSS/JS（クライアント側にフレームワーク不要）
- Markdownの記事をfront matter付きで扱うのが標準機能
- `collections` APIでカテゴリ別/タグ別/種別（レビュー・比較・ランキング）の自動集約が可能
- `pagination` 機能で一覧ページの自動ページ分割ができる
- レイアウト継承・パーシャルインクルードが標準装備（ヘッダー/フッター/ナビの使い回し）
- data cascade（`_data`配下のJSON）でサイト全体設定・カテゴリ一覧・ナビ構成を一元管理できる
- ビルド時間が短く、数千ページ規模でも実用的な速度
- GitHub Actionsとの相性が良く、GitHub Pagesへのデプロイ実績が豊富

「HTML/CSS/JSのみ」という要件は**配信物（サイト本体）**に対する制約と解釈し、ビルド工程（記事追加の効率化のためのテンプレートエンジン）にNode.jsを使う。WordPressのような常時稼働のサーバーサイドCMSは使わず、ビルドはGitHub Actions上で完結しGitHub Pagesには静的ファイルのみをデプロイする。

代替案として「Node.js一切なしの完全手書きテンプレート＋簡易生成スクリプト」も可能だが、関連記事・タグ・ページネーションの自動化コストが増えるため非推奨。

## 2. ディレクトリ構成 / ファイル構成

```
picksearch/
├── .github/
│   └── workflows/
│       └── deploy.yml            # ビルド & GitHub Pagesデプロイ
├── src/                           # Eleventy 入力ソース
│   ├── _data/
│   │   ├── site.json              # サイト名, baseUrl, デフォルトOGP画像, Amazonアソシエイトタグ等
│   │   ├── categories.json        # カテゴリ定義 (slug, name, description, icon)
│   │   └── nav.json               # ヘッダーナビ構成
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk           # 全ページ共通の<html>骨格（head / OGP / JSON-LD差し込み口）
│   │   │   ├── page.njk           # 固定ページ用（プライバシーポリシー等）
│   │   │   ├── article.njk        # レビュー/比較/ランキング記事共通レイアウト
│   │   │   └── listing.njk        # カテゴリ一覧・タグ一覧・記事一覧（ページネーション対応）
│   │   ├── partials/
│   │   │   ├── header.njk
│   │   │   ├── footer.njk
│   │   │   ├── nav.njk
│   │   │   ├── breadcrumbs.njk
│   │   │   ├── article-card.njk   # 一覧用サムネイルカード
│   │   │   ├── related-articles.njk
│   │   │   ├── pagination.njk
│   │   │   ├── amazon-button.njk  # Amazon商品リンク（ASIN+アソシエイトタグから自動生成）
│   │   │   └── seo-meta.njk       # title/description/OGP/canonical出力
│   │   └── schema/                # JSON-LD テンプレート
│   │       ├── website.njk        # WebSite + SearchAction
│   │       ├── breadcrumb.njk     # BreadcrumbList
│   │       ├── product-review.njk # Product + Review/AggregateRating
│   │       ├── item-list.njk      # ItemList（比較・ランキング用）
│   │       └── organization.njk   # Organization（運営者情報）
│   ├── assets/
│   │   ├── css/
│   │   │   ├── base.css           # リセット・変数（トークン）
│   │   │   ├── layout.css
│   │   │   └── components.css
│   │   ├── js/
│   │   │   ├── main.js            # ナビ開閉等の軽量UI
│   │   │   └── search.js          # 検索ページ用（ビルド時生成のインデックスJSONを読む）
│   │   └── images/
│   ├── articles/
│   │   ├── reviews/               # 商品レビュー記事 (*.md)
│   │   ├── comparisons/           # 比較記事 (*.md)
│   │   └── rankings/              # ランキング記事 (*.md)
│   ├── categories/                # カテゴリindex（一覧はcollectionsから自動生成）
│   ├── pages/
│   │   ├── privacy-policy.md
│   │   ├── contact.md
│   │   └── disclosure.md          # Amazonアソシエイト開示ページ
│   ├── search.njk                 # 検索ページ（クライアントJS駆動、サーバー不要）
│   ├── index.njk                  # トップページ
│   ├── sitemap.xml.njk            # sitemap.xml 自動生成
│   └── robots.txt                 # そのまま passthrough
├── .eleventy.js                   # Eleventy設定（collections, filters, shortcodes, pagination）
├── package.json
├── CNAME                          # 独自ドメイン
└── README.md
```

ビルド出力（GitHub Pagesへ実際にデプロイされる成果物）は `_site/` 配下に生成される、リンク・画像パスが解決済みの純粋なHTML/CSS/JS一式。

## 3. テンプレート設計

### レイアウト継承

```
base.njk (html/head/OGP/JSON-LD差し込み口, header, footer)
 └─ page.njk        … 固定ページ
 └─ article.njk     … 記事詳細（パンくず + 本文 + Amazon商品ブロック + 関連記事）
 └─ listing.njk      … カテゴリ/タグ/記事一覧（ページネーション）
```

### 記事のfront matter例

```yaml
---
title: "○○○○ レビュー｜実際に使って分かったメリット・デメリット"
description: "○○○○を3週間使用した実機レビュー。..."
layout: layouts/article.njk
type: review            # review | comparison | ranking
category: kitchen
tags: [調理家電, フライパン]
ogImage: /assets/images/xxxx.jpg
publishDate: 2026-07-01
updateDate: 2026-07-05
product:
  name: "○○○○"
  asin: "B0XXXXXXX"
  price: 4980
  rating: 4.5
  image: /assets/images/xxxx.jpg
  amazonUrl: "https://www.amazon.co.jp/dp/B0XXXXXXX"   # タグはpartial側で自動付与
---
本文はMarkdownで記述。
```

front matterに`type`/`category`/`tags`を持たせることで、Eleventyの`collections`が自動的に「カテゴリ別」「タグ別」「種別（レビュー/比較/ランキング）別」の記事リストを構築する。これにより **記事一覧・関連記事・内部リンクは全て自動生成** され、記事追加のたびに手動でリンクを足す作業は発生しない。

### Amazonリンクの一元管理

`amazon-button.njk` パーシャルがASINとサイト共通のアソシエイトタグ（`_data/site.json`）からリンクURLを組み立てる。将来タグを変更する場合もこのパーシャル1箇所を直せば全記事に反映される。リンクには `rel="sponsored noopener"` を付与する。

### パンくずリスト

URLのパス構造（`/reviews/{category}/{slug}/` 等）から自動生成し、`breadcrumbs.njk`（表示用）と`schema/breadcrumb.njk`（JSON-LD用）を同じデータソースから出力する。

## 4. SEO設計

### ページ単位の設定項目（front matterで制御）

| 項目 | 用途 |
|---|---|
| `title` | `<title>` / og:title / Twitter Card |
| `description` | meta description / og:description |
| `ogImage` | og:image / twitter:image（未指定時はサイトデフォルト画像） |
| `canonical` | 重複コンテンツ対策（デフォルトはページ自身のURL） |
| `publishDate` / `updateDate` | JSON-LDの`datePublished`/`dateModified`、更新日表示 |

### 構造化データ（JSON-LD）マッピング

| ページ種別 | schema.org type |
|---|---|
| トップページ | `WebSite` + `SearchAction` |
| 商品レビュー記事 | `Product` + `Review` / `AggregateRating` |
| 比較記事 | `ItemList`（各アイテムに `Product`） |
| ランキング記事 | `ItemList`（`position`付きで各順位の`Product`） |
| 全ページ共通 | `BreadcrumbList` |
| フッター/会社情報 | `Organization` |

### サイトマップ・robots

- `sitemap.xml.njk`：Eleventyの全コレクション（記事・カテゴリ・固定ページ）を走査し、`lastmod`（front matterの`updateDate`）付きで自動出力。記事追加時に手動更新は不要。
- `robots.txt`：`Sitemap:` 行でsitemap.xmlの場所を明示。検索クエリ付きURL（`/search?q=`）等の重複コンテンツはDisallowで除外。

### 内部リンク・回遊性

- カテゴリページ／タグページ：該当記事を自動リスト化（ページネーション対応）
- 記事内「関連記事」：同一`category`または共通`tags`を持つ記事から関連度スコアで自動抽出（`.eleventy.js`にフィルタとして実装）
- 一覧系ページは`pagination`機能でURLを`/page/2/`のように自動分割、`rel="prev"/"next"`を付与

### パフォーマンス

- CSSは`base.css`/`layout.css`/`components.css`のみ、ビルド時にminify
- JSは`main.js`（ナビ等の最小限UI）+ `search.js`（検索ページのみ読み込み）、`defer`属性
- 画像は`width`/`height`属性必須・`loading="lazy"`、可能ならWebP
- フォントはOSの標準ゴシック体スタックを使用（Webフォント読み込みによる遅延を避ける）

## 5. 運用フロー

### 記事追加（レビュー記事の例）

1. `src/articles/reviews/{slug}.md` を作成し、front matter + Markdown本文を記述
2. `category`は既存カテゴリのslugを指定（新規カテゴリの場合は`_data/categories.json`に1行追加するだけ）
3. `npm run serve` でローカルプレビュー
4. `git commit && git push` → GitHub Actionsが自動ビルド・GitHub Pagesへデプロイ
5. 以下は**すべて自動更新**（手動作業なし）
   - カテゴリ一覧・タグ一覧への追加
   - 記事一覧ページ・ページネーション
   - 関連記事セクション
   - `sitemap.xml`
   - 検索インデックス（`search-index.json`）

### カテゴリ追加

`_data/categories.json`に `{ slug, name, description }` を1件追加するだけで、ナビ・カテゴリ一覧ページ・パンくずが自動的に対応する。

### タグ管理

タグはfront matterの`tags`配列のみで管理し、Eleventyの`collections`がタグ別ページを自動生成する。タグ一覧ページ・タグ別記事一覧ともに新規タグを都度登録する必要はない。

### 検索ページ

ビルド時に全記事のメタデータ（title, description, url, category, tags, image）を`search-index.json`として出力し、`search.js`がクライアントサイドで部分一致検索を行う。バックエンド不要でGitHub Pagesにそのまま乗る。

## 6. デプロイ・ドメイン・Search Console

### GitHub Actions（GitHub Pagesデプロイ）

`push to main` → `actions/checkout` → `actions/setup-node` → `npm ci` → `npm run build`(Eleventy) → `actions/upload-pages-artifact` → `actions/deploy-pages`

### 独自ドメイン

- リポジトリ直下（Eleventyのpassthrough経由）に`CNAME`ファイルを設置
- レジストラ側でAレコード（GitHub Pages IP）またはCNAMEレコードを設定
- GitHub リポジトリ設定でカスタムドメインを登録し、Enforce HTTPSを有効化

### Google Search Console

- 独自ドメイン設定後、DNSレコード確認 or HTMLタグ確認でプロパティ登録
- `sitemap.xml`のURLを送信

## 7. 次のステップ（本提案の承認後）

1. Eleventy scaffold（`.eleventy.js`, `package.json`, `_includes`, `_data`）の実装
2. 共通レイアウト（header/footer/nav/breadcrumbs）とSEO/JSON-LD差し込み口の実装
3. サンプル記事（レビュー/比較/ランキング各1本）でテンプレート動作確認
4. GitHub Actionsワークフローの実装とGitHub Pagesへの疎通確認
5. 独自ドメイン・Search Console設定（ユーザー側の作業含む）
6. 記事の量産フェーズへ移行
