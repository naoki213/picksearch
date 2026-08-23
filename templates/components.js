import { escapeHtml, formatDate, withBase, amazonUrl, formatPrice } from "./util.js";

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
        <span>${post.readingMinutes} min read</span>
      </div>
    </a>
  </article>`;
}

export function productCard(product, site) {
  return `
  <div class="product-box">
    ${product.image ? `<img src="${withBase(site, product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` : ""}
    <div class="product-box__body">
      <p class="product-box__name">${escapeHtml(product.name)}</p>
      ${product.price ? `<p class="product-box__price">${formatPrice(product.price, site)}</p>` : ""}
      <a class="amazon-button" href="${amazonUrl(site, product.asin)}" rel="sponsored noopener nofollow" target="_blank">
        View on Amazon
      </a>
    </div>
  </div>`;
}

export function productGrid(products, site) {
  if (!products || !products.length) return "";
  return `
  <section class="product-grid-section">
    <h2 class="section__title">Recommended Products</h2>
    <div class="product-grid">
      ${products.map((p) => productCard(p, site)).join("")}
    </div>
  </section>`;
}

export function genreNav(genres, activeId, site) {
  return `
  <nav class="genre-nav" aria-label="Categories">
    <ul>
      <li><a href="${withBase(site, "/")}"${!activeId ? ' class="is-active"' : ""}>Home</a></li>
      ${genres
        .map(
          (g) =>
            `<li><a href="${withBase(site, `/genre/${g.id}/`)}"${activeId === g.id ? ' class="is-active"' : ""}>${escapeHtml(g.name)}</a></li>`
        )
        .join("")}
    </ul>
  </nav>`;
}
