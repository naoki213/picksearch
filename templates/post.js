import { renderLayout } from "./layout.js";
import { escapeHtml, formatDate, withBase, amazonUrl } from "./util.js";
import { postCard, productGrid } from "./components.js";

export function renderPost({ site, genres, genre, post, posts }) {
  const related = posts
    .filter((p) => p.slug !== post.slug && p.genre === post.genre)
    .slice(0, 3);

  const content = `
  <article class="post">
    <header class="post__header">
      <p class="post__genre"><a href="${withBase(site, `/genre/${genre.id}/`)}">${escapeHtml(genre.name)}</a></p>
      <h1 class="post__title">${escapeHtml(post.title)}</h1>
      <div class="post__meta">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <span>${post.readingMinutes} min read</span>
      </div>
      ${
        post.tags && post.tags.length
          ? `<ul class="post__tags">${post.tags.map((t) => `<li>#${escapeHtml(t)}</li>`).join("")}</ul>`
          : ""
      }
    </header>
    <div class="post__body">
      ${post.html}
    </div>
    ${productGrid(post.products, site)}
  </article>
  ${
    related.length
      ? `<section class="section">
    <h2 class="section__title">Related Articles</h2>
    <div class="post-grid">
      ${related.map((p) => postCard(p, genres, site)).join("")}
    </div>
  </section>`
      : ""
  }`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.author },
    publisher: { "@type": "Organization", name: site.title },
    mainEntityOfPage: `${site.baseUrl}/posts/${post.slug}/`,
  };

  return renderLayout({
    site,
    genres,
    activeGenre: genre.id,
    title: post.title,
    description: post.description,
    canonicalPath: `/posts/${post.slug}/`,
    jsonLd,
    content,
  });
}
