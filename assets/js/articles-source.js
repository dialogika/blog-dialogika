/**
 * Dialogika — Sumber Data Artikel
 * ================================
 * Satu pintu untuk semua halaman listing:
 *   - Kalau Firebase sudah dikonfigurasi  → ambil dari Firestore.
 *   - Kalau belum / gagal                → fallback ke articles.json statis.
 *
 * Pemakaian:
 *   ArticlesSource.load("assets/data/articles.json").then(function (articles) { ... });
 */
(function () {
  "use strict";

  function fetchJson(url) {
    return fetch(url, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    });
  }

  /**
   * URL lama di articles.json memakai prefix "/blog-dialogika/blog/".
   * Di Firebase Hosting artikel berada di "/blog/", jadi diseragamkan.
   */
  function normalizeUrls(list) {
    return (Array.isArray(list) ? list : []).map(function (article) {
      if (
        article &&
        typeof article.url === "string" &&
        article.url.indexOf("/blog-dialogika/blog/") === 0
      ) {
        article.url = article.url.replace("/blog-dialogika/blog/", "/blog/");
      }
      return article;
    });
  }

  function loadStatic(fallbackUrl) {
    return fetchJson(fallbackUrl)
      .then(normalizeUrls)
      .catch(function () { return []; });
  }

  var ArticlesSource = {
    load: function (fallbackUrl, options) {
      options = options || {};
      var hasFirebase =
        window.BlogDB && typeof window.BlogDB.loadArticles === "function";

      if (!hasFirebase || !window.BlogDB.isConfigured()) {
        return loadStatic(fallbackUrl);
      }

      return window.BlogDB.loadArticles(options)
        .then(function (articles) {
          /* Kalau Firestore masih kosong, tetap tampilkan artikel statis. */
          if (!articles || !articles.length) {
            return loadStatic(fallbackUrl);
          }
          return articles;
        })
        .catch(function () {
          return loadStatic(fallbackUrl);
        });
    },
  };

  window.ArticlesSource = ArticlesSource;
})();
