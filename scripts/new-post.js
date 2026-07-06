import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "../templates/util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "..", "content", "posts");
const GENRES_FILE = path.join(__dirname, "..", "content", "genres.json");

const [, , title, genre = "life"] = process.argv;

if (!title) {
  console.error('使い方: npm run new-post -- "記事タイトル" ジャンルID');
  console.error("ジャンルID一覧は content/genres.json を参照してください。");
  process.exit(1);
}

const genres = JSON.parse(fs.readFileSync(GENRES_FILE, "utf-8"));
if (!genres.some((g) => g.id === genre)) {
  console.error(`ジャンルID "${genre}" は content/genres.json に存在しません。`);
  process.exit(1);
}

const slug = slugify(title);
const date = new Date().toISOString().slice(0, 10);
const filePath = path.join(POSTS_DIR, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`既に同じslugのファイルが存在します: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${title}"
slug: "${slug}"
description: "ここに記事の要約（120文字程度）を書いてください。"
genre: "${genre}"
tags: []
date: "${date}"
---

ここから本文を書いてください。
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filePath, template, "utf-8");
console.log(`記事の下書きを作成しました: ${filePath}`);
