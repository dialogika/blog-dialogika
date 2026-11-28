/**
 * BlogGenerator.ArticleBuilder — Satu sumber logika generator artikel
 * ====================================================================
 * Mengubah data artikel (objek biasa) menjadi:
 *   1. `data`  : nilai untuk semua {{PLACEHOLDER}} di admin/template/blog-template.html
 *   2. `entry` : entri baru untuk assets/data/articles.json (beranda, arsip,
 *                halaman kategori & "Artikel Terkait" membaca file ini)
 *
 * Dipakai oleh:
 *   - admin/index.html (generator berbasis form, lewat app.js)
 *   - scripts/generate-article.js (generator CLI)
 * sehingga hasil keduanya selalu identik dengan tampilan terbaru.
 *
 * Bentuk input:
 * {
 *   title, metaDescription, keywords, ogTitle, ogDescription, ogImage,
 *   author, category, date ("YYYY-MM-DD"), featuredImage, cheatsheetPdf,
 *   contentHtml, tags: [], takeaways: [], faqs: [{question, answer}],
 *   sources: [{url, title, thumbnail}]
 * }
 */
(function () {
  "use strict";

  var MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_INDEX = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, mei: 4, jun: 5, jul: 6,
    aug: 7, agu: 7, agt: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11, des: 11
  };

  function str(v) {
    return v == null ? "" : String(v).trim();
  }

  function list(v) {
    return Array.isArray(v) ? v : [];
  }

  /** "2026-11-28" → "28 Nov 2026" (format yang dipakai articles.json terbaru) */
  function indexDate(ymd) {
    var p = str(ymd).split("-");
    if (p.length !== 3) return "";
    return parseInt(p[2], 10) + " " + MONTHS_EN[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  /** Mengurai "22 Nov 2026" maupun ISO menjadi timestamp (0 jika gagal). */
  function parseIndexDate(value) {
    var s = str(value);
    var m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/);
    if (m) {
      var mi = MONTH_INDEX[m[2].slice(0, 3).toLowerCase()];
      if (mi != null) return new Date(Number(m[3]), mi, Number(m[1])).getTime();
    }
    var t = new Date(s).getTime();
    return isNaN(t) ? 0 : t;
  }

  function excerptFrom(input, Utils) {
    var desc = str(input.metaDescription);
    if (desc) return desc;
    var text = Utils.stripHtml(input.contentHtml || "").replace(/\s+/g, " ").trim();
    return text.length > 220 ? text.slice(0, 220) + "..." : text;
  }

  BlogGenerator.ArticleBuilder = {
    /**
     * Cek data wajib. Mengembalikan pesan error (string) atau null jika valid.
     */
    validate: function (input) {
      var title = str(input.title);
      if (!title) return "Judul artikel wajib diisi!";
      if (title.indexOf(" - ") === -1) {
        return 'Judul harus mengandung format "Keyword - Theory" (dengan strip -).\nContoh: Cara Membuat Standup Comedy - Tips Menarik Penonton';
      }
      if (!str(input.category)) return "Kategori wajib dipilih!";
      if (BlogGenerator.Config.categories.indexOf(str(input.category)) === -1) {
        return "Kategori tidak dikenal: " + input.category + "\nPilihan: " + BlogGenerator.Config.categories.join(", ");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(str(input.date))) return "Tanggal publish wajib diisi (format YYYY-MM-DD)!";
      if (!str(BlogGenerator.Utils.stripHtml(input.contentHtml || ""))) return "Isi artikel masih kosong!";
      return null;
    },

    /**
     * Bangun data placeholder + entri articles.json.
     * @returns {{slug: string, data: Object, entry: Object}}
     */
    build: function (input) {
      var Utils = BlogGenerator.Utils;
      var Config = BlogGenerator.Config;
      var Schema = BlogGenerator.Schema;
      var Render = BlogGenerator.ContentRenderer;

      var title = str(input.title);
      var metaDesc = str(input.metaDescription);
      var metaKeywords = str(input.keywords);
      var ogTitle = str(input.ogTitle) || title;
      var ogDesc = str(input.ogDescription) || metaDesc;
      var featuredImageUrl = str(input.featuredImage);
      var ogImage = str(input.ogImage) || featuredImageUrl;
      var author = str(input.author) || Config.defaultAuthor;
      var category = str(input.category);
      var publishedDate = str(input.date);
      var articleContent = input.contentHtml || "";

      var tags = list(input.tags).map(str).filter(Boolean);
      var takeaways = list(input.takeaways).map(str).filter(Boolean);
      var faqs = list(input.faqs).filter(function (f) {
        return f && str(f.question) && str(f.answer);
      });
      var sources = list(input.sources).filter(function (s) {
        return s && str(s.url);
      });

      var slug = str(input.slug) || Utils.slugify(title);
      var canonicalUrl = Config.baseUrl + slug;
      var publishedDateIso = Utils.toIsoDateTime(publishedDate);

      var faqJsonLd = Schema.generateFaqSchema(faqs);
      var categoryUrl = Config.categoryUrls[category] || "#";

      var data = {
        PAGE_TITLE: Utils.escapeHtml(title),
        META_DESCRIPTION: Utils.escapeHtml(metaDesc),
        META_KEYWORDS: Utils.escapeHtml(metaKeywords),
        CANONICAL_URL: Utils.escapeHtml(canonicalUrl),
        OG_TITLE: Utils.escapeHtml(ogTitle),
        OG_DESCRIPTION: Utils.escapeHtml(ogDesc),
        OG_URL: Utils.escapeHtml(canonicalUrl),
        OG_IMAGE: Utils.escapeHtml(ogImage),
        TWITTER_TITLE: Utils.escapeHtml(ogTitle),
        TWITTER_DESCRIPTION: Utils.escapeHtml(ogDesc),
        TWITTER_IMAGE: Utils.escapeHtml(ogImage),
        PUBLISHED_DATE_ISO: publishedDateIso,
        MODIFIED_DATE_ISO: publishedDateIso,
        ARTICLE_JSON_LD: Schema.generateArticleSchema({
          title: title,
          description: metaDesc,
          image: featuredImageUrl,
          publishedDateIso: publishedDateIso,
          modifiedDateIso: publishedDateIso,
          canonicalUrl: canonicalUrl,
        }),
        FAQ_JSON_LD_BLOCK: faqJsonLd
          ? '<script type="application/ld+json">\n' + faqJsonLd + "\n    </script>"
          : "",
        BREADCRUMB_JSON_LD: Schema.generateBreadcrumbSchema(category, title),
        FEATURED_IMAGE_URL: Utils.escapeHtml(featuredImageUrl),
        FEATURED_IMAGE_ALT: Utils.escapeHtml(title),
        CATEGORY: Utils.escapeHtml(category),
        AUTHOR: Utils.escapeHtml(author),
        PUBLISHED_DATE_DISPLAY: Utils.formatDate(publishedDate),
        ARTICLE_H1: Utils.escapeHtml(title),
        ARTICLE_CONTENT: articleContent,
        TAGS_HTML: Render.renderTags(tags, category, categoryUrl),
        KEY_TAKEAWAYS_HTML: Render.renderTakeaways(takeaways),
        FAQ_HTML: Render.renderFaq(faqs),
        SOURCES_HTML: Render.renderSources(sources),
        CHEATSHEET_URL: Utils.escapeHtml(str(input.cheatsheetPdf)),
        BREADCRUMB_CATEGORY: Utils.escapeHtml(category),
        CATEGORY_URL: Utils.escapeHtml(categoryUrl),
        SLUG: slug,
      };

      var entry = {
        slug: slug,
        title: title,
        date: indexDate(publishedDate),
        keywords: metaKeywords,
        excerpt: excerptFrom(input, Utils),
        image: featuredImageUrl,
        url: Config.articleUrlPrefix + slug + ".html",
        category: category,
      };

      return { slug: slug, data: data, entry: entry };
    },

    /**
     * Masukkan / perbarui entri di daftar articles.json, urut terbaru dulu.
     * Entri dengan slug sama diganti (aman dijalankan berulang kali).
     * @returns {{list: Array, replaced: boolean}}
     */
    upsertIndex: function (articles, entry) {
      var source = Array.isArray(articles) ? articles : [];
      var replaced = false;
      var next = source.filter(function (a) {
        var same = a && a.slug === entry.slug;
        if (same) replaced = true;
        return !same;
      });
      next.push(entry);
      next = next
        .map(function (a, i) { return { a: a, i: i, t: parseIndexDate(a && a.date) }; })
        .sort(function (x, y) { return y.t - x.t || x.i - y.i; })
        .map(function (x) { return x.a; });
      return { list: next, replaced: replaced };
    },

    /** Serialisasi sama persis dengan format articles.json di repo. */
    stringifyIndex: function (articles) {
      return JSON.stringify(articles, null, 2) + "\n";
    },
  };
})();
