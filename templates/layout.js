import { escapeHtml } from "./util.js";
import { genreNav } from "./components.js";

export function renderLayout({
  site,
  genres,
  activeGenre,
  title,
  description,
  canonicalPath,
  ogImage,
  jsonLd,
  content,
}) {
  const pageTitle = title ? `${title} | ${site.title}` : site.title;
  const desc = description || site.description;
  const url = `${site.baseUrl}${canonicalPath}`;

  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(site.title)}">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${url}">
${ogImage ? `<meta property="og:image" content="${site.baseUrl}${ogImage}">` : ""}
<meta name="twitter:card" content="summary_large_image">
${site.twitter ? `<meta name="twitter:site" content="${escapeHtml(site.twitter)}">` : ""}
<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.title)}" href="/feed.xml">
<link rel="stylesheet" href="/css/style.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body>
<header class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="site-header__logo">${escapeHtml(site.title)}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="メニューを開閉する">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div id="primary-nav">
    ${genreNav(genres, activeGenre)}
  </div>
</header>
<main class="container">
${content}
</main>
<footer class="site-footer">
  <div class="container">
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}</p>
  </div>
</footer>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}
