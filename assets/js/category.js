(function () {
  "use strict";

  var body = document.body;
  var CATEGORY = body.getAttribute("data-category") || "";
  var IS_ALL = !CATEGORY || CATEGORY.toLowerCase() === "all";
  var PER_PAGE = 6;
  var allArticles = [];
  var currentPage = 1;
  var currentSearch = "";
  var currentFilter = "";

  var panel = document.querySelector(".mobile-panel");
  var scrim = document.querySelector(".page-scrim");
  var mobileToggle = document.querySelector(".mobile-toggle");

  function safeText(value, fallback) {
    return value && String(value).trim() ? String(value).trim() : fallback;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var MONTHS = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4, may: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, aug: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9, oct: 9,
    november: 10, nov: 10,
    desember: 11, des: 11, dec: 11
  };

  function parseDate(value) {
    var raw = safeText(value, "");
    if (!raw) return null;
    var direct = new Date(raw);
    if (!isNaN(direct.getTime())) return direct;
    var m = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (!m) return null;
    var month = MONTHS[m[2].toLowerCase()];
    if (month === undefined) return null;
    return new Date(+m[3], month, +m[1]);
  }

  function formatDate(value) {
    if (!value) return "Tanggal belum tersedia";
    var date = parseDate(value);
    if (!date) return "Tanggal belum tersedia";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  }

  function estimateReadTime(article) {
    var source = [article.title, article.excerpt, article.keywords].join(" ").trim();
    var words = source ? source.split(/\s+/).length : 0;
    return Math.max(3, Math.round(words / 4)) + " min baca";
  }

  function getImage(article, fallback) {
    var image = safeText(article.image, "");
    if (!image || image === "https://pleased-emerald-qh2dbzzgll.edgeone.app/") return fallback;
    return image;
  }

  function setMobileMenu(open) {
    if (!panel || !scrim || !mobileToggle) return;
    panel.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    panel.setAttribute("aria-hidden", String(!open));
    mobileToggle.setAttribute("aria-expanded", String(open));
    body.classList.toggle("no-scroll", open);
  }

  function renderArticles(articles) {
    var root = document.getElementById("category-list");
    if (!root) return;
    if (!articles.length) {
      root.innerHTML = "";
      var emptyState = document.getElementById("empty-state");
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    var emptyState = document.getElementById("empty-state");
    if (emptyState) emptyState.style.display = "none";
    root.innerHTML = articles.map(function (article) {
      var label = safeText(article.category, IS_ALL ? "Artikel" : CATEGORY);
      return '<article class="recent-card"><a href="' + escapeHtml(article.url) + '"><img src="' + escapeHtml(getImage(article, "../assets/images/blog/01.jpg")) + '" alt="' + escapeHtml(article.title) + '" /></a><div><span class="post-category">' + escapeHtml(label) + '</span><h3><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><p>' + escapeHtml(safeText(article.excerpt, "Temukan artikel dari Dialogika.")) + '</p><div class="post-meta"><span>Dialogika</span><span>' + escapeHtml(estimateReadTime(article)) + '</span><span>' + escapeHtml(formatDate(article.date)) + '</span></div></div></article>';
    }).join("");
  }

  function renderPagination(totalPages) {
    var root = document.getElementById("pagination");
    if (!root) return;
    if (totalPages <= 1) {
      root.innerHTML = "";
      return;
    }
    var html = "";
    if (currentPage > 1) {
      html += '<button class="page-btn" data-page="' + (currentPage - 1) + '"><i class="icofont-long-arrow-left"></i> Sebelumnya</button>';
    }
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="page-btn' + (i === currentPage ? " active" : "") + '" data-page="' + i + '">' + i + '</button>';
    }
    if (currentPage < totalPages) {
      html += '<button class="page-btn" data-page="' + (currentPage + 1) + '">Selanjutnya <i class="icofont-long-arrow-right"></i></button>';
    }
    root.innerHTML = html;
    root.querySelectorAll(".page-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentPage = parseInt(this.getAttribute("data-page"), 10);
        render();
      });
    });
  }

  function renderResultCount(count) {
    var el = document.getElementById("result-count");
    if (el) el.textContent = count;
  }

  function renderFilters() {
    var root = document.getElementById("category-filter");
    if (!root || !IS_ALL) return;
    var counts = {};
    allArticles.forEach(function (article) {
      var name = safeText(article.category, "Lainnya");
      counts[name] = (counts[name] || 0) + 1;
    });
    var html =
      '<button class="archive-filter active" data-category-value="" type="button">Semua (' +
      allArticles.length +
      ")</button>";
    Object.keys(counts).sort().forEach(function (name) {
      html +=
        '<button class="archive-filter" data-category-value="' +
        escapeHtml(name) +
        '" type="button">' +
        escapeHtml(name) +
        " (" +
        counts[name] +
        ")</button>";
    });
    root.innerHTML = html;
    root.querySelectorAll(".archive-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentFilter = btn.getAttribute("data-category-value") || "";
        currentPage = 1;
        root.querySelectorAll(".archive-filter").forEach(function (item) {
          item.classList.toggle("active", item === btn);
        });
        render();
      });
    });
  }

  function render() {
    var filtered = IS_ALL
      ? allArticles.filter(function (a) {
          return !currentFilter || a.category === currentFilter;
        })
      : allArticles.filter(function (a) {
          return a.category === CATEGORY;
        });
    if (currentSearch) {
      var q = currentSearch.toLowerCase();
      filtered = filtered.filter(function (a) {
        return (a.title + " " + a.excerpt + " " + a.keywords + " " + a.category).toLowerCase().indexOf(q) !== -1;
      });
    }
    var totalPages = Math.ceil(filtered.length / PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    var start = (currentPage - 1) * PER_PAGE;
    var pageArticles = filtered.slice(start, start + PER_PAGE);
    renderArticles(pageArticles);
    renderPagination(totalPages);
    renderResultCount(filtered.length);
  }

  function init() {
    fetch("../assets/data/articles.json")
      .then(function (r) { return r.json(); })
      .then(function (articles) {
        allArticles = articles;
        renderFilters();
        render();
      })
      .catch(function () {});

    var searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        currentSearch = this.value;
        currentPage = 1;
        render();
      });
    }

    if (mobileToggle) mobileToggle.addEventListener("click", function () { setMobileMenu(true); });
    var mobileClose = document.querySelector(".mobile-close");
    if (mobileClose) mobileClose.addEventListener("click", function () { setMobileMenu(false); });
    if (scrim) scrim.addEventListener("click", function () { setMobileMenu(false); });
    document.querySelectorAll(".mobile-panel a").forEach(function (link) { link.addEventListener("click", function () { setMobileMenu(false); }); });

    document.querySelectorAll(".js-search-open").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = document.getElementById("search-input");
        if (input) input.focus();
      });
    });

    var scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      window.addEventListener("scroll", function () { scrollTop.classList.toggle("visible", window.scrollY > 500); }, { passive: true });
      scrollTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMobileMenu(false);
      }
    });
  }

  init();
})();
