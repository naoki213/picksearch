import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 8080;
const { basePath = "" } = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "site.json"), "utf-8"));

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent(req.url.split("?")[0]);
  const unprefixed = basePath && requestPath.startsWith(basePath) ? requestPath.slice(basePath.length) || "/" : requestPath;
  const relativePath = unprefixed.endsWith("/") ? `${unprefixed}index.html` : unprefixed;
  const filePath = path.join(DIST_DIR, relativePath);

  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(DIST_DIR, "404.html"), (err2, data2) => {
        res.writeHead(err2 ? 404 : 404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(err2 ? "404 Not Found" : data2);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serving dist/ at http://localhost:${PORT}`);
});
