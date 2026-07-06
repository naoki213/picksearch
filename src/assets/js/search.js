(function () {
  "use strict";

  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");
  if (!form || !input || !results) return;

  var indexPromise = fetch("/search-index.json").then(function (res) {
    return res.json();
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function render(items, query) {
    if (!query) {
      status.textContent = "";
      results.innerHTML = "";
      return;
    }
    status.textContent = items.length + "件の記事が見つかりました";
    results.innerHTML = items
      .map(function (item) {
        return (
          '<article class="article-card">' +
          '<a class="article-card-link" href="' + escapeHtml(item.url) + '">' +
          (item.image ? '<img class="article-card-image" src="' + escapeHtml(item.image) + '" alt="" width="320" height="200" loading="lazy">' : "") +
          '<div class="article-card-body">' +
          '<h3 class="article-card-title">' + escapeHtml(item.title) + "</h3>" +
          '<p class="article-card-description">' + escapeHtml(item.description) + "</p>" +
          "</div></a></article>"
        );
      })
      .join("");
  }

  function search(query, allItems) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter(function (item) {
      var haystack = [item.title, item.description, item.category].concat(item.tags || []).join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
  }

  indexPromise.then(function (allItems) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;
    if (initialQuery) render(search(initialQuery, allItems), initialQuery);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var query = input.value;
      var url = new URL(window.location.href);
      url.searchParams.set("q", query);
      window.history.replaceState({}, "", url);
      render(search(query, allItems), query);
    });
  });
})();
