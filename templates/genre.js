import { renderLayout } from "./layout.js";
import { escapeHtml } from "./util.js";
import { postCard } from "./components.js";

export function renderGenre({ site, genres, genre, posts }) {
  const content = `
  <section class="section">
    <h1 class="section__title">${escapeHtml(genre.name)}の記事一覧</h1>
    <p class="section__lead">${escapeHtml(genre.description)}</p>
    <div class="post-grid">
      ${
        posts.length
          ? posts.map((p) => postCard(p, genres, site)).join("")
          : `<p class="empty-state">このジャンルの記事は準備中です。</p>`
      }
    </div>
  </section>`;

  return renderLayout({
    site,
    genres,
    activeGenre: genre.id,
    title: `${genre.name}の記事一覧`,
    description: genre.description,
    canonicalPath: `/genre/${genre.id}/`,
    content,
  });
}
