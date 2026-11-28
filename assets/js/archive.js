/* =====================================================================
   DIALOGIKA — HALAMAN ARSIP (blog/index.html)
   Data diambil dari assets/data/articles.json, lalu dirender menjadi
   kartu. Fitur: cari, filter kategori, urutkan, paginasi, state di URL
   (?q=&kategori=&urut=&hal=), dan terhubung dengan search di header.
   ===================================================================== */
(function () {
  "use strict";

  var DATA_URL = "../assets/data/articles.json";
  var PER_PAGE = 9;
  var FALLBACK_IMG = "../assets/images/blog/01.jpg";
  var CATEGORIES = ["Public Speaking", "Communication", "Self Development", "Mental Health"];
  var TONES = {
    "Public Speaking": "speaking",
    Communication: "comm",
    "Self Development": "self",
    "Mental Health": "mind"
  };
  var MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, mei: 4, jun: 5, jul: 6,
    aug: 7, agu: 7, agt: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11, des: 11
  };

  var els = {
    grid: document.getElementById("articles-grid"),
    empty: document.getElementById("empty-state"),
    emptyTitle: document.getElementById("empty-title"),
    emptyText: document.getElementById("empty-text"),
    pager: document.getElementById("pagination-bar"),
    count: document.getElementById("article-count-badge"),
    search: document.getElementById("archive-search"),
    searchField: document.getElementById("archive-search-field"),
    clear: document.getElementById("archive-search-clear"),
    sort: document.getElementById("archive-sort"),
    chips: document.getElementById("category-filters"),
    reset: document.getElementById("reset-filters-btn"),
    toolbar: document.getElementById("archive-toolbar"),
    live: document.getElementById("archive-live")
  };

  var state = { all: [], query: "", category: "Semua", sort: "newest", page: 1 };

  /* ---------------- Utilitas ---------------- */
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function norm(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function tokens(query) {
    return norm(query).split(/\s+/).filter(Boolean);
  }

  /* Mendukung "22 Nov 2026", "2 Jul 2026", dan ISO "2025-01-28T08:00:00+07:00" */
  function parseDate(value) {
    if (!value) return null;
    var m = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/);
    if (m) {
      var month = MONTHS[m[2].slice(0, 3).toLowerCase()];
      if (month != null) return new Date(Number(m[3]), month, Number(m[1]));
    }
    var d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDate(date) {
    if (!date) return "";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  function highlight(text, query) {
    var raw = String(text || "");
    var list = tokens(query);
    if (!list.length) return esc(raw);
    var hay = norm(raw);
    var ranges = [];
    list.forEach(function (t) {
      var i = hay.indexOf(t);
      while (i !== -1) {
        ranges.push([i, i + t.length]);
        i = hay.indexOf(t, i + t.length);
      }
    });
    if (!ranges.length) return esc(raw);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    ranges.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push(r.slice());
    });
    var out = "";
    var pos = 0;
    merged.forEach(function (r) {
      out += esc(raw.slice(pos, r[0])) + "<mark>" + esc(raw.slice(r[0], r[1])) + "</mark>";
      pos = r[1];
    });
    return out + esc(raw.slice(pos));
  }

  function articleHref(article) {
    if (article.slug) return encodeURI(article.slug) + ".html";
    return article.url || "#";
  }

  function articleImage(article) {
    var img = String(article.image || "").trim();
    if (!img || /edgeone\.app\/?$/.test(img) || /dialogikalogo$/.test(img)) return FALLBACK_IMG;
    return img;
  }

  function normalizeCategory(value) {
    var v = norm(value);
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (norm(CATEGORIES[i]) === v) return CATEGORIES[i];
    }
    return value || "Self Development";
  }

  /* ---------------- URL state ---------------- */
  function readUrl() {
    var p = new URLSearchParams(window.location.search);
    state.query = (p.get("q") || "").trim();
    var cat = p.get("kategori");
    state.category = cat && CATEGORIES.indexOf(normalizeCategory(cat)) !== -1 ? normalizeCategory(cat) : "Semua";
    var sort = p.get("urut");
    state.sort = sort === "oldest" || sort === "az" ? sort : "newest";
    state.page = Math.max(1, parseInt(p.get("hal"), 10) || 1);
  }

  function writeUrl() {
    var u = new URL(window.location.href);
    var p = u.searchParams;
    state.query ? p.set("q", state.query) : p.delete("q");
    state.category !== "Semua" ? p.set("kategori", state.category) : p.delete("kategori");
    state.sort !== "newest" ? p.set("urut", state.sort) : p.delete("urut");
    state.page > 1 ? p.set("hal", String(state.page)) : p.delete("hal");
    window.history.replaceState(null, "", u.pathname + (p.toString() ? "?" + p.toString() : "") + u.hash);
  }

  /* ---------------- Filter & urut ---------------- */
  function filtered() {
    var list = tokens(state.query);
    var result = state.all.filter(function (a) {
      if (state.category !== "Semua" && a.category !== state.category) return false;
      if (!list.length) return true;
      return list.every(function (t) { return a._search.indexOf(t) !== -1; });
    });
    result.sort(function (a, b) {
      if (state.sort === "az") return a.title.localeCompare(b.title, "id");
      var da = a._date ? a._date.getTime() : 0;
      var db = b._date ? b._date.getTime() : 0;
      return state.sort === "oldest" ? da - db : db - da;
    });
    return result;
  }

  /* ---------------- Render ---------------- */
  function cardHtml(a) {
    var tone = TONES[a.category] || "self";
    var href = esc(articleHref(a));
    var meta = [formatDate(a._date), a.readTime ? esc(a.readTime) : ""].filter(Boolean).join(" • ");
    var author = a.author || "Tim Dialogika";
    var initials = author.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    return (
      '<article class="dlg-card">' +
      '<a class="dlg-card__media" href="' + href + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + esc(articleImage(a)) + '" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + FALLBACK_IMG + '\'" />' +
      "</a>" +
      '<div class="dlg-card__body"><div>' +
      '<div class="dlg-card__meta"><span class="dlg-pill dlg-tone-' + tone + '">' + esc(a.category) + "</span>" +
      (meta ? '<span class="dlg-meta">' + meta + "</span>" : "") + "</div>" +
      '<h2 class="dlg-card__title"><a href="' + href + '">' + highlight(a.title, state.query) + "</a></h2>" +
      '<p class="dlg-card__excerpt">' + esc(a.excerpt || "Baca artikel selengkapnya dari Dialogika.") + "</p>" +
      "</div>" +
      '<div class="dlg-card__foot">' +
      '<div class="dlg-author dlg-meta"><span class="dlg-avatar dlg-tone-' + tone + '">' + esc(initials) + "</span><span>" + esc(author) + "</span></div>" +
      '<span class="dlg-card__more dlg-hs" aria-hidden="true"><span>Baca Selengkapnya</span><span class="dlg-icon">arrow_forward</span></span>' +
      "</div></div></article>"
    );
  }

  function pagerHtml(page, pages) {
    function btn(p) {
      return '<button type="button" data-page="' + p + '" class="dlg-hs' + (p === page ? ' is-active" aria-current="page"' : '"') + ' aria-label="Halaman ' + p + '">' + p + "</button>";
    }
    var html =
      '<button type="button" class="dlg-pager__nav dlg-hs" data-page="' + (page - 1) + '"' + (page === 1 ? " disabled" : "") + ' aria-label="Halaman sebelumnya">' +
      '<span class="dlg-icon">chevron_left</span><span>Sebelumnya</span></button>';
    var shown = [];
    for (var p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - page) <= 1) shown.push(p);
    }
    var prev = 0;
    shown.forEach(function (p) {
      if (p - prev > 1) html += '<span class="dlg-pager__gap">…</span>';
      html += btn(p);
      prev = p;
    });
    html +=
      '<button type="button" class="dlg-pager__nav dlg-hs" data-page="' + (page + 1) + '"' + (page === pages ? " disabled" : "") + ' aria-label="Halaman berikutnya">' +
      "<span>Selanjutnya</span><span class=\"dlg-icon\">chevron_right</span></button>";
    return html;
  }

  function syncControls() {
    if (els.search.value !== state.query) els.search.value = state.query;
    els.searchField.classList.toggle("has-value", !!state.query);
    els.sort.value = state.sort;
    Array.prototype.forEach.call(els.chips.querySelectorAll(".dlg-chip"), function (chip) {
      var on = chip.getAttribute("data-category") === state.category;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    document.querySelectorAll(".dlg-search-form input").forEach(function (input) {
      if (document.activeElement !== input) input.value = state.query;
      input.closest("form").classList.toggle("is-filled", !!state.query);
    });
  }

  function render(scroll) {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER_PAGE;
    var slice = list.slice(start, start + PER_PAGE);

    els.grid.innerHTML = slice.map(cardHtml).join("");
    els.grid.setAttribute("aria-busy", "false");

    var isDefault = state.category === "Semua" && !state.query;
    els.count.textContent = isDefault ? state.all.length + " Artikel Dipublikasikan" : list.length + " Artikel Ditemukan";

    var none = list.length === 0;
    els.empty.hidden = !none;
    els.grid.hidden = none;
    if (none) {
      els.emptyTitle.textContent = "Tidak ada artikel yang cocok dengan pencarianmu.";
      els.emptyText.textContent = 'Coba gunakan kata kunci lain atau pilih kategori "Semua".';
      els.reset.hidden = false;
    }

    els.pager.hidden = none || pages <= 1;
    els.pager.innerHTML = pages > 1 ? pagerHtml(state.page, pages) : "";

    els.live.textContent = none
      ? "Tidak ada artikel ditemukan."
      : list.length + " artikel ditemukan, halaman " + state.page + " dari " + pages + ".";

    syncControls();
    writeUrl();
    if (scroll && els.toolbar) els.toolbar.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderChips() {
    var counts = { Semua: state.all.length };
    state.all.forEach(function (a) { counts[a.category] = (counts[a.category] || 0) + 1; });
    var html = ["Semua"].concat(CATEGORIES).map(function (cat) {
      var tone = cat === "Semua" ? "" : " dlg-tone-" + TONES[cat];
      return (
        '<button type="button" class="dlg-chip' + tone + '" data-category="' + esc(cat) + '" aria-pressed="false">' +
        esc(cat) + '<span class="dlg-chip__count">' + (counts[cat] || 0) + "</span></button>"
      );
    }).join("");
    els.chips.innerHTML = html;
  }

  function showError() {
    els.grid.hidden = true;
    els.pager.hidden = true;
    els.empty.hidden = false;
    els.emptyTitle.textContent = "Artikel gagal dimuat.";
    els.emptyText.textContent = "Periksa koneksi internet kamu lalu muat ulang halaman ini.";
    els.reset.hidden = true;
    els.count.textContent = "Arsip Artikel";
  }

  /* ---------------- Event ---------------- */
  var typingTimer;
  els.search.addEventListener("input", function () {
    els.searchField.classList.toggle("has-value", !!els.search.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      state.query = els.search.value.trim();
      state.page = 1;
      render(false);
    }, 180);
  });
  els.search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") e.preventDefault();
  });
  els.clear.addEventListener("click", function () {
    state.query = "";
    state.page = 1;
    render(false);
    els.search.focus();
  });
  els.sort.addEventListener("change", function () {
    state.sort = els.sort.value;
    state.page = 1;
    render(false);
  });
  els.chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".dlg-chip");
    if (!chip) return;
    state.category = chip.getAttribute("data-category");
    state.page = 1;
    render(false);
  });
  els.pager.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-page]");
    if (!b || b.disabled || b.classList.contains("is-active")) return;
    state.page = parseInt(b.getAttribute("data-page"), 10) || 1;
    render(true);
  });
  els.reset.addEventListener("click", function () {
    state.query = "";
    state.category = "Semua";
    state.sort = "newest";
    state.page = 1;
    render(false);
  });
  /* Dari search di header (dialogika-header.js) */
  document.addEventListener("archive:search", function (e) {
    state.query = ((e.detail && e.detail.query) || "").trim();
    state.page = 1;
    render(true);
  });

  /* ---------------- Init ---------------- */
  readUrl();
  syncControls();
  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (Array.isArray(data) && Array.isArray(data[0])) data = data[0];
      var seen = {};
      state.all = (Array.isArray(data) ? data : [])
        .filter(function (a) {
          if (!a || !a.title || seen[a.slug || a.title]) return false;
          seen[a.slug || a.title] = true;
          return true;
        })
        .map(function (a) {
          var item = Object.assign({}, a);
          item.title = String(a.title).trim();
          item.category = normalizeCategory(a.category);
          item._date = parseDate(a.date);
          item._search = norm([item.title, a.excerpt, a.keywords, item.category, a.author].join(" "));
          return item;
        });
      renderChips();
      render(false);
    })
    .catch(function (err) {
      console.error("[archive] gagal memuat artikel:", err);
      showError();
    });
})();
