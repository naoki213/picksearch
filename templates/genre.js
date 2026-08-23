import { renderLayout } from "./layout.js";
import { escapeHtml } from "./util.js";
import { postCard } from "./components.js";

export function renderGenre({ site, genres, genre, posts }) {
  const content = `
  <section class="section">
    <h1 class="section__title">${escapeHtml(genre.name)}</h1>
    <p class="section__lead">${escapeHtml(genre.description)}</p>
    <div class="post-grid">
      ${
        posts.length
          ? posts.map((p) => postCard(p, genres, site)).join("")
          : `<p class="empty-state">No articles yet in this category.</p>`
      }
    </div>
  </section>`;

  return renderLayout({
    site,
    genres,
    activeGenre: genre.id,
    title: genre.name,
    description: genre.description,
    canonicalPath: `/genre/${genre.id}/`,
    content,
  });
}
