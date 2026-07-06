const fs = require("fs");
const markdownIt = require("markdown-it");
const site = require("./src/_data/site.json");

function toDate(value) {
  return value instanceof Date ? value : new Date(value || "1970-01-01");
}

function byDateDesc(a, b) {
  const dateA = toDate(a.data.updateDate || a.data.publishDate);
  const dateB = toDate(b.data.updateDate || b.data.publishDate);
  return dateB - dateA;
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Groups articles by a key (category slug, or each tag) and splits each
// group into fixed-size pages so new articles never require manual
// pagination or archive-page upkeep.
function buildArchivePages(articles, getKeys, pageSize) {
  const groups = {};
  articles.forEach((item) => {
    const keys = getKeys(item) || [];
    keys.forEach((key) => {
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
  });

  const pages = [];
  Object.keys(groups).forEach((key) => {
    const sorted = groups[key].slice().sort(byDateDesc);
    const chunks = chunk(sorted, pageSize);
    chunks.forEach((pageItems, idx) => {
      pages.push({
        key,
        pageNumber: idx + 1,
        totalPages: chunks.length,
        items: pageItems,
        totalCount: sorted.length,
      });
    });
  });
  return pages;
}

module.exports = function (eleventyConfig) {
  // ---- Passthrough (static assets shipped as-is) ----
  eleventyConfig.addPassthroughCopy("src/assets");
  // Add src/CNAME (containing just the domain name) once a custom domain is chosen.
  if (fs.existsSync("src/CNAME")) {
    eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  }

  // ---- Markdown ----
  const md = markdownIt({ html: false, breaks: false, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  // ---- Filters ----
  eleventyConfig.addFilter("dateDisplay", (iso) => {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-");
    return `${y}年${Number(m)}月${Number(d)}日`;
  });

  eleventyConfig.addFilter("isoDate", (value) => toDate(value).toISOString().slice(0, 10));

  eleventyConfig.addFilter("formatPrice", (price) => Number(price).toLocaleString("ja-JP"));

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("stars", (rating) => {
    const filled = Math.round(Number(rating) || 0);
    return "★".repeat(filled) + "☆".repeat(Math.max(0, 5 - filled));
  });

  eleventyConfig.addFilter("amazonUrl", (asin, tag) => {
    const associateTag = tag || site.amazonAssociateTag;
    return `https://www.amazon.co.jp/dp/${asin}?tag=${associateTag}`;
  });

  eleventyConfig.addFilter("categoryBySlug", (categories, slug) =>
    (categories || []).find((c) => c.slug === slug)
  );

  eleventyConfig.addFilter("filterByCategory", (articles, slug) =>
    (articles || []).filter((item) => item.data.category === slug)
  );

  eleventyConfig.addFilter("filterByTag", (articles, tag) =>
    (articles || []).filter((item) => (item.data.tags || []).includes(tag))
  );

  eleventyConfig.addFilter("allTags", (articles) => {
    const tags = new Set();
    (articles || []).forEach((item) => (item.data.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  });

  // Same-category / shared-tag scoring keeps every article's "related"
  // block current without any manual cross-linking.
  eleventyConfig.addFilter("relatedArticles", (articles, current, limit = 4) => {
    if (!current) return [];
    const currentTags = new Set(current.tags || []);
    return (articles || [])
      .filter((item) => item.url !== current.page.url)
      .map((item) => {
        let score = 0;
        if (item.data.category === current.category) score += 2;
        (item.data.tags || []).forEach((t) => {
          if (currentTags.has(t)) score += 1;
        });
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || byDateDesc(a.item, b.item))
      .slice(0, limit)
      .map((entry) => entry.item);
  });

  eleventyConfig.addFilter("pageUrl", (pageNumber, base) => {
    if (!pageNumber) return base;
    return `${base}page/${pageNumber + 1}/`;
  });

  function archiveUrlFor(key, pageNumber, base) {
    if (pageNumber <= 1) return `${base}${key}/`;
    return `${base}${key}/page/${pageNumber}/`;
  }

  eleventyConfig.addFilter("archiveUrl", (archivePage, base) =>
    archiveUrlFor(archivePage.key, archivePage.pageNumber, base)
  );

  eleventyConfig.addFilter("archiveSiblingUrl", (archivePage, base, delta) => {
    const target = archivePage.pageNumber + delta;
    if (target < 1 || target > archivePage.totalPages) return null;
    return archiveUrlFor(archivePage.key, target, base);
  });

  eleventyConfig.addFilter("jsonld", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("searchIndexJson", (articles) =>
    JSON.stringify(
      (articles || []).map((item) => ({
        title: item.data.title,
        description: item.data.description,
        url: item.url,
        category: item.data.category,
        tags: item.data.tags || [],
        image: item.data.ogImage || site.defaultOgImage,
      }))
    )
  );

  eleventyConfig.addShortcode("currentYear", () => String(new Date().getFullYear()));

  // ---- Collections ----
  eleventyConfig.addCollection("reviews", (api) =>
    api.getFilteredByGlob("src/articles/reviews/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("comparisons", (api) =>
    api.getFilteredByGlob("src/articles/comparisons/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("rankings", (api) =>
    api.getFilteredByGlob("src/articles/rankings/*.md").sort(byDateDesc)
  );
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/**/*.md").sort(byDateDesc)
  );

  eleventyConfig.addCollection("categoryArchivePages", (api) => {
    const articles = api.getFilteredByGlob("src/articles/**/*.md");
    return buildArchivePages(articles, (item) => [item.data.category], site.pagination.size);
  });

  eleventyConfig.addCollection("tagArchivePages", (api) => {
    const articles = api.getFilteredByGlob("src/articles/**/*.md");
    return buildArchivePages(articles, (item) => item.data.tags || [], site.pagination.size);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
