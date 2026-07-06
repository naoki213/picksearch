import { escapeHtml, formatDate, withBase } from "./util.js";

export function postCard(post, genres, site) {
  const genre = genres.find((g) => g.id === post.genre);
  return `
  <article class="post-card">
    <a href="${withBase(site, `/posts/${post.slug}/`)}" class="post-card__link">
      <span class="post-card__genre">${escapeHtml(genre ? genre.name : "")}</span>
      <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
      <p class="post-card__excerpt">${escapeHtml(post.description || "")}</p>
      <div class="post-card__meta">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <span>${post.readingMinutes}分で読了</span>
      </div>
    </a>
  </article>`;
}

export function genreNav(genres, activeId, site) {
  return `
  <nav class="genre-nav" aria-label="ジャンル">
    <ul>
      <li><a href="${withBase(site, "/")}"${!activeId ? ' class="is-active"' : ""}>トップ</a></li>
      ${genres
        .map(
          (g) =>
            `<li><a href="${withBase(site, `/genre/${g.id}/`)}"${activeId === g.id ? ' class="is-active"' : ""}>${escapeHtml(g.name)}</a></li>`
        )
        .join("")}
    </ul>
  </nav>`;
}
