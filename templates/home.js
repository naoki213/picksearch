import { renderLayout } from "./layout.js";
import { postCard } from "./components.js";

export function renderHome({ site, genres, posts }) {
  const content = `
  <section class="hero">
    <h1>${site.title}</h1>
    <p>${site.description}</p>
  </section>
  <section class="section">
    <h2 class="section__title">新着記事</h2>
    <div class="post-grid">
      ${posts.map((p) => postCard(p, genres)).join("")}
    </div>
  </section>`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.title,
    description: site.description,
    url: site.baseUrl,
  };

  return renderLayout({
    site,
    genres,
    activeGenre: null,
    title: null,
    description: site.description,
    canonicalPath: "/",
    jsonLd,
    content,
  });
}
