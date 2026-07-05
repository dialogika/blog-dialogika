(function () {
  "use strict";

  var body = document.body;
  var panel = document.querySelector(".mobile-panel");
  var scrim = document.querySelector(".page-scrim");
  var mobileToggle = document.querySelector(".mobile-toggle");
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
    var keywords = safeText(article.keywords, "General");
    return keywords.split(",")[0].trim() || "General";
  }

  function formatDate(value) {
    if (!value) return "Tanggal belum tersedia";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "Tanggal belum tersedia";
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

  function getSearch(article) {
    return [article.title, article.excerpt, article.keywords, getCategory(article)].join(" ").toLowerCase();
  }

  function setCards() {
    cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
  }

  function setMobileMenu(open) {
    if (!panel || !scrim || !mobileToggle) return;
    panel.classList.toggle("open", open);
    scrim.classList.toggle("show", open);
    panel.setAttribute("aria-hidden", String(!open));
    mobileToggle.setAttribute("aria-expanded", String(open));
    body.classList.toggle("no-scroll", open);
  }

  function setSearch(open) {
    if (!searchOverlay) return;
    searchOverlay.classList.toggle("open", open);
    searchOverlay.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("no-scroll", open);
    if (open && searchInput) setTimeout(function () { searchInput.focus(); }, 150);
  }

  function filterArticles(term) {
    var query = (term || "").trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var searchable = (card.getAttribute("data-search") || "") + " " + card.textContent;
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

  function renderHeroPosts(articles) {
    var root = document.getElementById("hero-post-list");
    if (!root) return;
    root.innerHTML = articles.slice(1, 3).map(function (article, index) {
      var category = getCategory(article);
      var accent = index === 1 ? " accent-card" : "";
      return '<article class="single-hero-blog-post searchable-card' + accent + '" data-search="' + escapeHtml(getSearch(article)) + '"><div class="hero-blog-post-top"><a class="post-category" href="#latest">' + escapeHtml(category) + '</a><span>Oleh Dialogika</span></div><h3 class="hero-blog-post-title"><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><p>' + escapeHtml(safeText(article.excerpt, 'Baca insight terbaru dari Dialogika.')) + '</p><div class="post-meta"><span><i class="icofont-ui-calendar"></i> ' + escapeHtml(formatDate(article.date)) + '</span><span>' + escapeHtml(estimateReadTime(article)) + '</span></div></article>';
    }).join("");
  }

  function renderTrending(articles) {
    var list = document.getElementById("trending-list");
    var feature = document.getElementById("trending-feature");
    if (!list || !feature) return;

    var leftItems = articles.slice(3, 6);
    list.innerHTML = leftItems.map(function (article) {
      var category = getCategory(article);
      return '<article class="trending-single-item searchable-card" data-search="' + escapeHtml(getSearch(article)) + '"><a class="trending-post-thum" href="' + escapeHtml(article.url) + '"><img src="' + escapeHtml(getImage(article, 'assets/images/latest-post/01.jpg')) + '" alt="' + escapeHtml(article.title) + '" /></a><div class="trending-post-content"><a class="post-category" href="#latest">' + escapeHtml(category) + '</a><h3><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><div class="post-meta"><span>' + escapeHtml(estimateReadTime(article)) + '</span><span>Dialogika</span></div></div></article>';
    }).join("");

    var article = articles[6] || articles[0];
    if (!article) return;
    feature.innerHTML = '<article class="trending-feature searchable-card" data-search="' + escapeHtml(getSearch(article)) + '"><img src="' + escapeHtml(getImage(article, 'assets/images/blog/blog-details-video.jpg')) + '" alt="' + escapeHtml(article.title) + '" /><div class="feature-content"><span class="post-category">Most Popular</span><h3><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><p>' + escapeHtml(safeText(article.excerpt, 'Artikel pilihan untuk meningkatkan komunikasi dan rasa percaya diri.')) + '</p><div class="post-meta"><span>' + escapeHtml(estimateReadTime(article)) + '</span><span>' + escapeHtml(getCategory(article)) + '</span></div></div></article>';
  }

  function renderFollowing(articles) {
    var root = document.getElementById("following-list");
    if (!root) return;
    root.innerHTML = articles.slice(0, 3).map(function (article, index) {
      var category = getCategory(article);
      return '<article class="following-card searchable-card" data-search="' + escapeHtml(getSearch(article)) + '"><a class="following-image" href="' + escapeHtml(article.url) + '"><img src="' + escapeHtml(getImage(article, 'assets/images/blog/01.jpg')) + '" alt="' + escapeHtml(article.title) + '" /><span class="card-number">' + String(index + 1).padStart(2, "0") + '</span></a><div class="following-content"><a class="post-category" href="#latest">' + escapeHtml(category) + '</a><h3><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><p>' + escapeHtml(safeText(article.excerpt, 'Insight terbaru dari Dialogika untuk bantu kamu berkembang.')) + '</p><div class="post-meta"><span>' + escapeHtml(formatDate(article.date)) + '</span><span>' + escapeHtml(estimateReadTime(article)) + '</span></div></div></article>';
    }).join("");
  }

  function renderSidebar(articles) {
    var root = document.getElementById("latest-sidebar-list");
    if (!root) return;
    root.innerHTML = articles.slice(0, 3).map(function (article, index) {
      return '<a class="latest-item searchable-card" data-search="' + escapeHtml(getSearch(article)) + '" href="' + escapeHtml(article.url) + '"><img src="' + escapeHtml(getImage(article, 'assets/images/latest-post/0' + (index + 1) + '.jpg')) + '" alt="' + escapeHtml(article.title) + '" /><span><small>' + escapeHtml(getCategory(article)) + '</small><b>' + escapeHtml(article.title) + '</b></span></a>';
    }).join("");
  }

  function renderRecent(articles) {
    var root = document.getElementById("recent-list");
    if (!root) return;
    root.innerHTML = articles.slice(0, 6).map(function (article) {
      return '<article class="recent-card searchable-card" data-search="' + escapeHtml(getSearch(article)) + '"><a href="' + escapeHtml(article.url) + '"><img src="' + escapeHtml(getImage(article, 'assets/images/blog/01.jpg')) + '" alt="' + escapeHtml(article.title) + '" /></a><div><a class="post-category" href="#recent">' + escapeHtml(getCategory(article)) + '</a><h3><a href="' + escapeHtml(article.url) + '">' + escapeHtml(article.title) + '</a></h3><p>' + escapeHtml(safeText(article.excerpt, 'Temukan artikel terbaru dari Dialogika.')) + '</p><div class="post-meta"><span>Dialogika</span><span>' + escapeHtml(estimateReadTime(article)) + '</span></div></div></article>';
    }).join("");
  }

  function updateTopicCounts(articles) {
    document.querySelectorAll("[data-topic-filter]").forEach(function (button) {
      var topic = (button.getAttribute("data-topic-filter") || "").toLowerCase();
      var count = articles.filter(function (article) {
        return getSearch(article).indexOf(topic) !== -1;
      }).length;
      var label = button.querySelector("small");
      if (label) label.textContent = count + " artikel";
    });
  }

  function bindStaticUi() {
    if (mobileToggle) mobileToggle.addEventListener("click", function () { setMobileMenu(true); });
    var mobileClose = document.querySelector(".mobile-close");
    if (mobileClose) mobileClose.addEventListener("click", function () { setMobileMenu(false); });
    if (scrim) scrim.addEventListener("click", function () { setMobileMenu(false); });
    document.querySelectorAll(".mobile-panel a").forEach(function (link) { link.addEventListener("click", function () { setMobileMenu(false); }); });

    document.querySelectorAll(".js-search-open").forEach(function (button) { button.addEventListener("click", function () { setSearch(true); }); });
    var searchClose = document.querySelector(".search-close");
    if (searchClose) searchClose.addEventListener("click", function () { setSearch(false); });
    if (searchOverlay) searchOverlay.addEventListener("click", function (event) { if (event.target === searchOverlay) setSearch(false); });
    var searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        filterArticles(searchInput ? searchInput.value : "");
        setSearch(false);
      });
    }

    document.querySelectorAll("[data-topic-filter]").forEach(function (button) {
      button.addEventListener("click", function () { filterArticles(button.getAttribute("data-topic-filter")); });
    });
    document.querySelectorAll("[data-topic-link]").forEach(function (link) {
      link.addEventListener("click", function () { filterArticles(link.getAttribute("data-topic-link")); });
    });

    var newsletterForm = document.querySelector("[data-newsletter-form]");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = event.currentTarget.querySelector("small");
        if (status) status.textContent = "Terima kasih! Pendaftaran newsletter akan segera tersedia.";
        event.currentTarget.reset();
      });
    }

    document.querySelectorAll("[data-video-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll("[data-video-tab]").forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
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
        setSearch(false);
      }
    });
  }

  function bindTrendingControls() {
    var trendingItems = Array.prototype.slice.call(document.querySelectorAll(".trending-single-item"));
    var offset = 0;
    function rotateTrending(direction) {
      if (!trendingItems.length) return;
      offset = (offset + direction + trendingItems.length) % trendingItems.length;
      trendingItems.forEach(function (item, index) { item.style.order = (index - offset + trendingItems.length) % trendingItems.length; });
    }
    var next = document.querySelector("[data-slider-next]");
    var prev = document.querySelector("[data-slider-prev]");
    if (next) next.addEventListener("click", function () { rotateTrending(1); });
    if (prev) prev.addEventListener("click", function () { rotateTrending(-1); });
  }

  function initDynamicContent() {
    fetch("assets/data/articles.json")
      .then(function (response) { return response.json(); })
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
