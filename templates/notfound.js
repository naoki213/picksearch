import { renderLayout } from "./layout.js";

export function renderNotFound({ site, genres }) {
  const content = `
  <section class="section">
    <h1 class="section__title">ページが見つかりません</h1>
    <p>お探しのページは移動または削除された可能性があります。</p>
    <p><a href="/">トップページに戻る</a></p>
  </section>`;

  return renderLayout({
    site,
    genres,
    activeGenre: null,
    title: "404 Not Found",
    description: "ページが見つかりません。",
    canonicalPath: "/404.html",
    content,
  });
}
