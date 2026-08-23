import { renderLayout } from "./layout.js";
import { withBase } from "./util.js";

export function renderNotFound({ site, genres }) {
  const content = `
  <section class="section">
    <h1 class="section__title">Page Not Found</h1>
    <p>The page you're looking for may have been moved or removed.</p>
    <p><a href="${withBase(site, "/")}">Back to homepage</a></p>
  </section>`;

  return renderLayout({
    site,
    genres,
    activeGenre: null,
    title: "404 Not Found",
    description: "This page could not be found.",
    canonicalPath: "/404.html",
    content,
  });
}
