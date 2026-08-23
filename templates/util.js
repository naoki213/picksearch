export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function withBase(site, p) {
  const base = site.basePath || "";
  return `${base}${p}`;
}

export function amazonUrl(site, asin) {
  const domain = site.amazonDomain || "amazon.co.jp";
  const tag = site.amazonAssociateTag;
  const base = `https://www.${domain}/dp/${asin}/`;
  return tag ? `${base}?tag=${encodeURIComponent(tag)}` : base;
}

export function formatPrice(price, site) {
  const currency = site.amazonDomain === "amazon.com" ? "$" : "¥";
  return `${currency}${Number(price).toLocaleString("en-US")}`;
}

export function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-龠ぁ-んァ-ヶー]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
