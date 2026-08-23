import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

import { renderHome } from "../templates/home.js";
import { renderPost } from "../templates/post.js";
import { renderGenre } from "../templates/genre.js";
import { renderNotFound } from "../templates/notfound.js";
import { slugify } from "../templates/util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, "utf-8");
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function estimateReadingMinutes(rawContent) {
  const charCount = rawContent.replace(/\s+/g, "").length;
  return Math.max(1, Math.round(charCount / 400));
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const slug = data.slug || slugify(path.basename(file, ".md"));
    return {
      ...data,
      slug,
      html: marked.parse(content),
      readingMinutes: estimateReadingMinutes(content),
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function escapeXml(str) {
  return String(str).replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );
}

function renderSitemap({ site, genres, posts }) {
  const urls = [
    `${site.baseUrl}/`,
    ...genres.map((g) => `${site.baseUrl}/genre/${g.id}/`),
    ...posts.map((p) => `${site.baseUrl}/posts/${p.slug}/`),
  ];
  const body = urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderFeed({ site, posts }) {
  const items = posts
    .slice(0, 20)
    .map(
      (p) => `
  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${site.baseUrl}/posts/${p.slug}/</link>
    <guid>${site.baseUrl}/posts/${p.slug}/</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${escapeXml(p.description || "")}</description>
  </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>${escapeXml(
    site.title
  )}</title>\n  <link>${site.baseUrl}/</link>\n  <description>${escapeXml(
    site.description
  )}</description>${items}\n</channel></rss>\n`;
}

function build() {
  const site = loadJSON(path.join(CONTENT_DIR, "site.json"));
  const genres = loadJSON(path.join(CONTENT_DIR, "genres.json"));
  const posts = loadPosts();

  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  ensureDir(DIST_DIR);
  copyDir(PUBLIC_DIR, DIST_DIR);

  writeFile(path.join(DIST_DIR, "index.html"), renderHome({ site, genres, posts }));

  for (const post of posts) {
    const genre = genres.find((g) => g.id === post.genre);
    if (!genre) {
      console.warn(`Warning: genre "${post.genre}" for post "${post.title}" was not found in content/genres.json.`);
      continue;
    }
    writeFile(
      path.join(DIST_DIR, "posts", post.slug, "index.html"),
      renderPost({ site, genres, genre, post, posts })
    );
  }

  for (const genre of genres) {
    const genrePosts = posts.filter((p) => p.genre === genre.id);
    writeFile(
      path.join(DIST_DIR, "genre", genre.id, "index.html"),
      renderGenre({ site, genres, genre, posts: genrePosts })
    );
  }

  writeFile(path.join(DIST_DIR, "404.html"), renderNotFound({ site, genres }));
  writeFile(path.join(DIST_DIR, "sitemap.xml"), renderSitemap({ site, genres, posts }));
  writeFile(
    path.join(DIST_DIR, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`
  );
  writeFile(path.join(DIST_DIR, "feed.xml"), renderFeed({ site, posts }));

  console.log(`Build complete: ${posts.length} post(s) / ${genres.length} genre(s) -> dist/`);
}

build();
