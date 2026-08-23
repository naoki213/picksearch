import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "../templates/util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "..", "content", "posts");
const GENRES_FILE = path.join(__dirname, "..", "content", "genres.json");

const [, , title, genre = "life"] = process.argv;

if (!title) {
  console.error('Usage: npm run new-post -- "Post Title" genreId');
  console.error("See content/genres.json for the list of genre IDs.");
  process.exit(1);
}

const genres = JSON.parse(fs.readFileSync(GENRES_FILE, "utf-8"));
if (!genres.some((g) => g.id === genre)) {
  console.error(`Genre ID "${genre}" was not found in content/genres.json.`);
  process.exit(1);
}

const slug = slugify(title);
const date = new Date().toISOString().slice(0, 10);
const filePath = path.join(POSTS_DIR, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`A file with this slug already exists: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${title}"
slug: "${slug}"
description: "Write a short summary of the post here (about 160 characters)."
genre: "${genre}"
tags: []
date: "${date}"
---

Start writing the post here.
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filePath, template, "utf-8");
console.log(`Draft created: ${filePath}`);
