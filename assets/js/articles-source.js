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

  var ArticlesSource = {
    load: function (fallbackUrl, options) {
      options = options || {};
      var hasFirebase =
        window.BlogDB && typeof window.BlogDB.loadArticles === "function";

      if (!hasFirebase || !window.BlogDB.isConfigured()) {
        return fetchJson(fallbackUrl).catch(function () { return []; });
      }

      return window.BlogDB.loadArticles(options)
        .then(function (articles) {
          /* Kalau Firestore masih kosong, tetap tampilkan artikel statis. */
          if (!articles || !articles.length) {
            return fetchJson(fallbackUrl).catch(function () { return []; });
          }
          return articles;
        })
        .catch(function () {
          return fetchJson(fallbackUrl).catch(function () { return []; });
        });
    },
  };

  window.ArticlesSource = ArticlesSource;
})();
