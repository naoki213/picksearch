import { renderLayout } from "./layout.js";
import { escapeHtml, withBase } from "./util.js";
import { postCard } from "./components.js";

export function renderHome({ site, genres, posts }) {
  const hero = `
  <section class="hero-full" style="background-image: linear-gradient(180deg, rgba(20, 24, 32, 0.35), rgba(15, 18, 24, 0.65)), url('${withBase(site, "/images/hero.png")}')">
    <div class="container hero-full__inner">
      <h1>${escapeHtml(site.title)}</h1>
      <p>${escapeHtml(site.description)}</p>
      <a href="#latest" class="hero-full__cta">Read the latest stories</a>
    </div>
  </section>`;

  const content = `
  <section class="section" id="latest">
    <h2 class="section__title">Latest Articles</h2>
    <div class="post-grid">
      ${posts.map((p) => postCard(p, genres, site)).join("")}
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
    hero,
    content,
  });
}
