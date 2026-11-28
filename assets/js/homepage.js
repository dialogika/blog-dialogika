(function () {
  "use strict";

  var body = document.body;
  var panel = document.querySelector(".mobile-panel");
  var scrim = document.querySelector(".page-scrim");
  var mobileToggles = Array.prototype.slice.call(
    document.querySelectorAll(
      ".mobile-toggle, #mobile-menu-trigger, .mobile-navigation-icon",
    ),
  );
  var searchOverlay = document.querySelector(".search-overlay");
  var searchInput = document.getElementById("site-search");
  var cards = [];

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

  function getCategory(article) {
    var explicit = safeText(article.category, "");
    if (explicit) return explicit;
    var keywords = safeText(article.keywords, "General");
    return keywords.split(",")[0].trim() || "General";
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
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function estimateReadTime(article) {
    var source = [article.title, article.excerpt, article.keywords]
      .join(" ")
      .trim();
    var words = source ? source.split(/\s+/).length : 0;
    return Math.max(3, Math.round(words / 4)) + " min baca";
  }

  function getImage(article, fallback) {
    var image = safeText(article.image, "");
    if (!image || image === "https://pleased-emerald-qh2dbzzgll.edgeone.app/")
      return fallback;
    return image;
  }

  function getSearch(article) {
    return [
      article.title,
      article.excerpt,
      article.keywords,
      getCategory(article),
    ]
      .join(" ")
      .toLowerCase();
  }

  function setCards() {
    cards = Array.prototype.slice.call(
      document.querySelectorAll(".searchable-card"),
    );
  }

  function setMobileMenu(open) {
    if (!panel || !scrim) return;
    panel.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    panel.setAttribute("aria-hidden", String(!open));
    if (mobileToggles.length) {
      mobileToggles.forEach(function (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
    body.classList.toggle("no-scroll", open);
  }

  function setSearch(open) {
    if (!searchOverlay) return;
    searchOverlay.classList.toggle("open", open);
    searchOverlay.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("no-scroll", open);
    if (open && searchInput)
      setTimeout(function () {
        searchInput.focus();
      }, 150);
  }

  function filterArticles(term) {
    var query = (term || "").trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var searchable =
        (card.getAttribute("data-search") || "") + " " + card.textContent;
      var content = searchable.toLowerCase();
      var show = !query || content.indexOf(query) !== -1;
      card.classList.toggle("search-hidden", !show);
      if (show) visible += 1;
    });
    var emptyState = document.querySelector(".search-empty");
    if (emptyState) emptyState.style.display = visible ? "none" : "block";
    var latest = document.getElementById("latest");
    if (latest) latest.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function badgeClass(category) {
    var c = String(category || "").toLowerCase();
    if (/mental|health|psych|stres|emosi/.test(c))
      return "bg-badge-mind text-badge-mind-text";
    if (/self|diri|develop|confiden|percaya/.test(c))
      return "bg-badge-mind text-badge-mind-text";
    if (/komunikasi|communication|interview|hrd|karier|career|kerja/.test(c))
      return "bg-badge-comm text-badge-comm-text";
    return "bg-badge-speaking text-badge-speaking-text";
  }

  function categoryPill(category, href, extra) {
    return (
      '<a class="post-category inline-block ' +
      badgeClass(category) +
      " text-label-pill px-2.5 py-1 rounded-full uppercase tracking-wider " +
      (extra || "") +
      '" href="' +
      href +
      '">' +
      escapeHtml(category) +
      "</a>"
    );
  }

  function renderHeroPosts(articles) {
    var root = document.getElementById("hero-post-list");
    if (!root) return;
    root.innerHTML = articles
      .slice(1, 3)
      .map(function (article, index) {
        var category = getCategory(article);
        var accent = index === 1 ? " accent-card" : "";
        return (
          '<article class="single-hero-blog-post searchable-card' +
          accent +
          ' bg-surface-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-space-md flex flex-col sm:flex-row gap-space-md group" data-search="' +
          escapeHtml(getSearch(article)) +
          '"><a href="' +
          escapeHtml(article.url) +
          '" class="block w-full sm:w-40 h-36 shrink-0 rounded-xl overflow-hidden bg-surface-container relative"><img src="' +
          escapeHtml(
            getImage(article, "assets/images/latest-post/0" + (index + 1) + ".jpg"),
          ) +
          '" alt="' +
          escapeHtml(article.title) +
          '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></a>' +
          '<div class="flex-1 min-w-0 flex flex-col justify-between"><div><div class="hero-blog-post-top flex flex-wrap items-center gap-2 text-label-meta text-on-surface-variant mb-1.5">' +
          categoryPill(category, "#latest", "!py-0.5 !px-2 max-w-[160px] truncate") +
          "<span>Oleh Dialogika</span></div>" +
          '<h3 class="hero-blog-post-title font-heading text-headline-sm md:text-[17px] font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2"><a href="' +
          escapeHtml(article.url) +
          '">' +
          escapeHtml(article.title) +
          '</a></h3><p class="text-body-small text-on-surface-variant mt-1 line-clamp-2">' +
          escapeHtml(
            safeText(article.excerpt, "Baca insight terbaru dari Dialogika."),
          ) +
          '</p></div><div class="post-meta flex items-center justify-between pt-2 text-label-meta text-on-surface-variant"><span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">calendar_today</span> ' +
          escapeHtml(formatDate(article.date)) +
          "</span><span>" +
          escapeHtml(estimateReadTime(article)) +
          "</span></div></div></article>"
        );
      })
      .join("");
  }

  function renderTrending(articles) {
    var list = document.getElementById("trending-list");
    var feature = document.getElementById("trending-feature");
    if (!list || !feature) return;

    var leftItems = articles.slice(3, 6);
    list.innerHTML = leftItems
      .map(function (article) {
        var category = getCategory(article);
        return (
          '<article class="trending-single-item searchable-card bg-surface-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group" data-search="' +
          escapeHtml(getSearch(article)) +
          '"><a class="trending-post-thum relative block w-full aspect-[16/9] overflow-hidden bg-surface-container" href="' +
          escapeHtml(article.url) +
          '"><img src="' +
          escapeHtml(getImage(article, "assets/images/latest-post/01.jpg")) +
          '" alt="' +
          escapeHtml(article.title) +
          '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><span class="absolute bottom-2 right-2 bg-navy-light/80 text-on-primary text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">schedule</span>' +
          escapeHtml(estimateReadTime(article)) +
          '</span></a><div class="trending-post-content p-space-lg flex-1 flex flex-col justify-between"><div>' +
          '<div class="mb-2">' +
          categoryPill(category, "#latest", "max-w-full truncate") +
          '</div><h3 class="font-heading text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-3"><a href="' +
          escapeHtml(article.url) +
          '">' +
          escapeHtml(article.title) +
          '</a></h3></div><div class="post-meta pt-space-md mt-space-md border-t border-border-subtle/50 flex items-center justify-between text-label-meta text-on-surface-variant"><span class="flex items-center gap-2"><span class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-bold text-[11px] text-primary">DG</span><span class="font-medium text-on-surface">Dialogika</span></span><span>' +
          escapeHtml(formatDate(article.date)) +
          "</span></div></div></article>"
        );
      })
      .join("");

    var article = articles[6] || articles[0];
    if (!article) return;
    feature.innerHTML =
      '<article class="trending-feature searchable-card relative bg-surface-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group" data-search="' +
      escapeHtml(getSearch(article)) +
      '"><a href="' +
      escapeHtml(article.url) +
      '" class="block md:w-1/2 aspect-[16/9] md:aspect-auto md:min-h-[260px] overflow-hidden bg-surface-container"><img src="' +
      escapeHtml(
        getImage(article, "assets/images/blog/blog-details-video.jpg"),
      ) +
      '" alt="' +
      escapeHtml(article.title) +
      '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></a><div class="feature-content md:w-1/2 p-space-lg md:p-space-xl flex flex-col justify-center gap-space-sm"><span class="post-category inline-flex items-center gap-1 w-fit bg-primary text-on-primary text-label-pill px-3 py-1 rounded-full uppercase tracking-wider"><span class="material-symbols-outlined text-[14px]">local_fire_department</span>Most Popular</span><h3 class="font-heading text-headline-md md:text-headline-lg font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight"><a href="' +
      escapeHtml(article.url) +
      '">' +
      escapeHtml(article.title) +
      '</a></h3><p class="text-body-default text-on-surface-variant line-clamp-3">' +
      escapeHtml(
        safeText(
          article.excerpt,
          "Artikel pilihan untuk meningkatkan komunikasi dan rasa percaya diri.",
        ),
      ) +
      '</p><div class="post-meta flex flex-wrap items-center gap-2 text-label-meta text-on-surface-variant"><span>' +
      escapeHtml(estimateReadTime(article)) +
      "</span><span>•</span><span>" +
      escapeHtml(getCategory(article)) +
      '</span></div><a href="' +
      escapeHtml(article.url) +
      '" class="inline-flex items-center gap-1 font-heading text-headline-sm font-bold text-primary hover:text-royal-blue-hover mt-1">Baca artikel <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span></a></div></article>';
  }

  function renderFollowing(articles) {
    var root = document.getElementById("following-list");
    if (!root) return;
    root.innerHTML = articles
      .slice(0, 3)
      .map(function (article, index) {
        var category = getCategory(article);
        return (
          '<article class="following-card searchable-card bg-surface-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group" data-search="' +
          escapeHtml(getSearch(article)) +
          '"><a class="following-image relative block w-full aspect-[16/10] overflow-hidden bg-surface-container" href="' +
          escapeHtml(article.url) +
          '"><img src="' +
          escapeHtml(getImage(article, "assets/images/blog/01.jpg")) +
          '" alt="' +
          escapeHtml(article.title) +
          '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><span class="card-number absolute top-3 left-3 w-10 h-10 rounded-xl bg-accent-yellow text-navy-light font-heading font-extrabold flex items-center justify-center shadow-md">' +
          String(index + 1).padStart(2, "0") +
          '</span></a><div class="following-content p-space-lg flex-1 flex flex-col"><div class="mb-2">' +
          categoryPill(category, "#latest", "max-w-full truncate") +
          '</div><h3 class="font-heading text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2"><a href="' +
          escapeHtml(article.url) +
          '">' +
          escapeHtml(article.title) +
          '</a></h3><p class="text-body-small text-on-surface-variant line-clamp-3">' +
          escapeHtml(
            safeText(
              article.excerpt,
              "Insight terbaru dari Dialogika untuk bantu kamu berkembang.",
            ),
          ) +
          '</p><div class="post-meta mt-auto pt-space-md flex items-center justify-between text-label-meta text-on-surface-variant"><span>' +
          escapeHtml(formatDate(article.date)) +
          "</span><span>" +
          escapeHtml(estimateReadTime(article)) +
          "</span></div></div></article>"
        );
      })
      .join("");
  }

  function renderSidebar(articles) {
    var root = document.getElementById("latest-sidebar-list");
    if (!root) return;
    root.innerHTML = articles
      .slice(0, 3)
      .map(function (article, index) {
        return (
          '<a class="latest-item searchable-card flex items-center gap-3 py-2.5 border-b border-border-subtle/50 last:border-0 group" data-search="' +
          escapeHtml(getSearch(article)) +
          '" href="' +
          escapeHtml(article.url) +
          '"><img src="' +
          escapeHtml(
            getImage(
              article,
              "assets/images/latest-post/0" + (index + 1) + ".jpg",
            ),
          ) +
          '" alt="' +
          escapeHtml(article.title) +
          '" loading="lazy" class="w-16 h-16 rounded-xl object-cover shrink-0 bg-surface-container" /><span class="min-w-0 flex flex-col gap-0.5"><small class="text-label-meta text-primary font-semibold truncate">' +
          escapeHtml(getCategory(article)) +
          '</small><b class="font-heading text-[14px] leading-snug font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">' +
          escapeHtml(article.title) +
          "</b></span></a>"
        );
      })
      .join("");
  }

  function renderRecent(articles) {
    var root = document.getElementById("recent-list");
    if (!root) return;
    root.innerHTML = articles
      .slice(0, 6)
      .map(function (article) {
        return (
          '<article class="recent-card searchable-card bg-surface-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 p-3 flex gap-3 group" data-search="' +
          escapeHtml(getSearch(article)) +
          '"><a href="' +
          escapeHtml(article.url) +
          '" class="block w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-surface-container"><img src="' +
          escapeHtml(getImage(article, "assets/images/blog/01.jpg")) +
          '" alt="' +
          escapeHtml(article.title) +
          '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></a><div class="min-w-0 flex flex-col"><a class="post-category text-label-meta text-primary font-semibold truncate" href="#recent">' +
          escapeHtml(getCategory(article)) +
          '</a><h3 class="font-heading text-[15px] leading-snug font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-0.5"><a href="' +
          escapeHtml(article.url) +
          '">' +
          escapeHtml(article.title) +
          '</a></h3><p class="text-body-small text-on-surface-variant line-clamp-1 mt-0.5">' +
          escapeHtml(
            safeText(
              article.excerpt,
              "Temukan artikel terbaru dari Dialogika.",
            ),
          ) +
          '</p><div class="post-meta mt-auto pt-1 flex items-center gap-2 text-label-meta text-on-surface-variant"><span>Dialogika</span><span>•</span><span>' +
          escapeHtml(estimateReadTime(article)) +
          "</span></div></div></article>"
        );
      })
      .join("");
  }

  function updateTopicCounts(articles) {
    document.querySelectorAll("[data-topic-filter]").forEach(function (button) {
      var topic = (
        button.getAttribute("data-topic-filter") || ""
      ).toLowerCase();
      var count = articles.filter(function (article) {
        return getSearch(article).indexOf(topic) !== -1;
      }).length;
      var label = button.querySelector("small");
      if (label) label.textContent = count + " artikel";
    });
    document.querySelectorAll("[data-category-count]").forEach(function (el) {
      var topic = (el.getAttribute("data-category-count") || "").toLowerCase();
      var count = articles.filter(function (article) {
        return getSearch(article).indexOf(topic) !== -1;
      }).length;
      if (count) el.textContent = count + " artikel terbit";
    });
  }

  function bindStaticUi() {
    mobileToggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        setMobileMenu(true);
      });
    });
    var mobileClose = document.querySelector(".mobile-close");
    if (mobileClose)
      mobileClose.addEventListener("click", function () {
        setMobileMenu(false);
      });
    if (scrim)
      scrim.addEventListener("click", function () {
        setMobileMenu(false);
      });
    document.querySelectorAll(".mobile-panel a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMobileMenu(false);
      });
    });

    document.querySelectorAll(".js-search-open").forEach(function (button) {
      button.addEventListener("click", function () {
        setSearch(true);
      });
    });
    var searchClose = document.querySelector(".search-close");
    if (searchClose)
      searchClose.addEventListener("click", function () {
        setSearch(false);
      });
    if (searchOverlay)
      searchOverlay.addEventListener("click", function (event) {
        if (event.target === searchOverlay) setSearch(false);
      });
    var searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        filterArticles(searchInput ? searchInput.value : "");
        setSearch(false);
      });
    }

    document.querySelectorAll("[data-topic-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        filterArticles(button.getAttribute("data-topic-filter"));
      });
    });
    document.querySelectorAll("[data-topic-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        filterArticles(link.getAttribute("data-topic-link"));
      });
    });

    var newsletterForm = document.querySelector("[data-newsletter-form]");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = event.currentTarget.querySelector("small");
        if (status)
          status.textContent =
            "Terima kasih! Pendaftaran newsletter akan segera tersedia.";
        event.currentTarget.reset();
      });
    }

    document.querySelectorAll("[data-video-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll("[data-video-tab]").forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
      });
    });

    var scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      window.addEventListener(
        "scroll",
        function () {
          scrollTop.classList.toggle("visible", window.scrollY > 500);
        },
        { passive: true },
      );
      scrollTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMobileMenu(false);
        setSearch(false);
      }
    });
  }

  function bindTrendingControls() {
    var trendingItems = Array.prototype.slice.call(
      document.querySelectorAll(".trending-single-item"),
    );
    var offset = 0;
    function rotateTrending(direction) {
      if (!trendingItems.length) return;
      offset =
        (offset + direction + trendingItems.length) % trendingItems.length;
      trendingItems.forEach(function (item, index) {
        item.style.order =
          (index - offset + trendingItems.length) % trendingItems.length;
      });
    }
    var next = document.querySelector("[data-slider-next]");
    var prev = document.querySelector("[data-slider-prev]");
    if (next)
      next.addEventListener("click", function () {
        rotateTrending(1);
      });
    if (prev)
      prev.addEventListener("click", function () {
        rotateTrending(-1);
      });
  }

  function loadArticleData() {
    if (window.ArticlesSource) {
      return window.ArticlesSource.load("assets/data/articles.json");
    }
    return fetch("assets/data/articles.json").then(function (response) {
      return response.json();
    });
  }

  function initDynamicContent() {
    loadArticleData()
      .then(function (articles) {
        if (!articles || !articles.length) return;
        renderHeroPosts(articles);
        renderTrending(articles);
        renderFollowing(articles);
        renderSidebar(articles);
        renderRecent(articles);
        updateTopicCounts(articles);
        setCards();
        bindTrendingControls();
      })
      .catch(function () {});
  }

  bindStaticUi();
  initDynamicContent();
})();
