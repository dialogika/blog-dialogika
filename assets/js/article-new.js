/* =====================================================================
   Dialogika Blog — Interaksi Halaman Artikel (tampilan baru)
   Dipakai oleh semua artikel yang dibuat dari admin/template/blog-template.html.
   Data artikel dibaca dari atribut <body data-article-slug / data-article-category>.
   ===================================================================== */
(function () {
  "use strict";

  var bodyEl = document.body;
  var CURRENT_SLUG = bodyEl.getAttribute("data-article-slug") || "";
  var CURRENT_CATEGORY = bodyEl.getAttribute("data-article-category") || "";
  var ARTICLES_JSON = bodyEl.getAttribute("data-articles-json") || "../assets/data/articles.json";

  function $(id) { return document.getElementById(id); }

  // ---------- Reading progress ----------
  var progressBar = $("dialogika-reading-progress");
  function updateProgress() {
    if (!progressBar) return;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (total > 0 ? Math.min(Math.max((y / total) * 100, 0), 100) : 0) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  // ---------- Read time ----------
  var content = $("article-content") || $("article-body");
  var readTimeEl = $("read-time-text");
  if (content && readTimeEl) {
    var words = (content.innerText || content.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    readTimeEl.textContent = Math.max(1, Math.ceil(words / 250)) + " menit baca";
  }

  // ---------- Inisial penulis ----------
  var authorEl = document.querySelector(".author-name");
  if (authorEl) {
    var initials = authorEl.textContent.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "D";
    document.querySelectorAll(".author-initials").forEach(function (el) { el.textContent = initials; });
  }

  // ---------- Sembunyikan Key Takeaways jika kosong ----------
  var kt = $("key-takeaways");
  if (kt && !kt.querySelector("li")) kt.style.display = "none";

  // ---------- Mobile menu ----------
  var toggle = $("mobile-menu-toggle");
  var menu = $("mobile-menu");
  var menuIcon = $("mobile-menu-icon");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      toggle.setAttribute("aria-expanded", String(open));
      if (menuIcon) menuIcon.textContent = open ? "close" : "menu";
    });
  }

  // ---------- Toast ----------
  var toast = $("copy-toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector("span:last-child").textContent = msg;
    toast.classList.remove("opacity-0", "translate-y-4");
    toast.classList.add("opacity-100", "translate-y-0");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.add("opacity-0", "translate-y-4");
      toast.classList.remove("opacity-100", "translate-y-0");
    }, 2800);
  }

  // ---------- Clap (tersimpan per artikel di browser) ----------
  var clapKey = "dialogika-clap-" + CURRENT_SLUG;
  var clapped = false;
  try { clapped = localStorage.getItem(clapKey) === "1"; } catch (e) {}
  var clapBtns = document.querySelectorAll(".clap-btn");
  function renderClap() {
    clapBtns.forEach(function (b) {
      var c = b.querySelector(".clap-count");
      if (c) c.textContent = clapped ? "1" : "0";
      b.classList.toggle("bg-royal-blue-subtle", clapped);
      b.classList.toggle("text-primary", clapped);
      b.setAttribute("aria-pressed", String(clapped));
    });
  }
  clapBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      clapped = !clapped;
      try { localStorage.setItem(clapKey, clapped ? "1" : "0"); } catch (e) {}
      renderClap();
    });
  });
  renderClap();

  // ---------- Copy link ----------
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }
  document.querySelectorAll(".copy-link-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).catch(function () { fallbackCopy(url); });
      } else {
        fallbackCopy(url);
      }
      showToast("Link berhasil disalin ke clipboard!");
    });
  });

  // ---------- Newsletter ----------
  var nf = $("newsletter-form");
  if (nf) {
    nf.addEventListener("submit", function (e) {
      e.preventDefault();
      nf.reset();
      showToast("Terima kasih! Kamu sudah terdaftar di newsletter.");
    });
  }

  // ---------- Scroll top ----------
  var st = $("scroll-top");
  if (st) {
    st.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Proteksi gambar ----------
  document.querySelectorAll(".protected-media, .h2-image-container, .h2-watermark-container").forEach(function (el) {
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  });

  // ---------- Daftar isi otomatis dari H2 ----------
  var tocNav = $("toc-nav");
  var tocCard = $("toc-card");
  if (tocNav && content) {
    var used = {};
    function headings(sel) {
      return Array.prototype.slice.call(content.querySelectorAll(sel)).filter(function (h) {
        return h.textContent.trim().length > 0;
      });
    }
    var heads = headings("h2");
    if (heads.length < 2) heads = headings("h2, h3"); // artikel tanpa H2: pakai H3
    if (heads.length < 2) {
      // Artikel hasil paste Google Docs: judul bagian berupa paragraf tebal pendek
      heads = Array.prototype.slice.call(content.querySelectorAll("p")).filter(function (p) {
        var t = p.textContent.replace(/\s+/g, " ").trim();
        if (t.length < 4 || t.length > 90 || /^(contoh|baca juga)\b/i.test(t) || /[:.]$/.test(t)) return false;
        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null);
        var node, bold = true;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue.trim()) continue;
          if (parseInt(getComputedStyle(node.parentElement).fontWeight, 10) < 600) { bold = false; break; }
        }
        if (bold) p.classList.add("prose-subheading");
        return bold;
      });
    }
    if (heads.length < 2) {
      if (tocCard) tocCard.style.display = "none";
    } else {
      heads.forEach(function (h, i) {
        var text = h.textContent.replace(/\s+/g, " ").trim();
        if (!h.id) {
          var base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "bagian";
          var id = base, n = 2;
          while (used[id] || document.getElementById(id)) id = base + "-" + n++;
          h.id = id;
        }
        used[h.id] = true;
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.className = "toc-link p-2 rounded-lg hover:bg-royal-blue-subtle text-on-surface-variant hover:text-primary transition-colors flex items-start gap-2";
        a.innerHTML = '<span class="toc-num text-outline-variant font-mono shrink-0">' + (i + 1 < 10 ? "0" : "") + (i + 1) + '.</span><span class="line-clamp-2"></span>';
        a.lastChild.textContent = text;
        tocNav.appendChild(a);
      });

      if ("IntersectionObserver" in window) {
        var links = tocNav.querySelectorAll(".toc-link");
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            links.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id);
            });
          });
        }, { rootMargin: "-25% 0px -65% 0px" });
        heads.forEach(function (h) { io.observe(h); });
      }
    }
  }

  // ---------- Artikel terkait & terbaru dari articles.json ----------
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6, agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11 };
  function parseDate(str) {
    var raw = String(str || "").trim();
    var direct = new Date(raw);
    if (!isNaN(direct.getTime())) return direct.getTime();
    var p = raw.split(/\s+/);
    var mk = (p[1] || "").toLowerCase().slice(0, 3);
    return new Date(parseInt(p[2], 10) || 1970, MONTHS.hasOwnProperty(mk) ? MONTHS[mk] : 0, parseInt(p[0], 10) || 1).getTime();
  }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }
  function catUrl(c) { return "../" + String(c || "").toLowerCase().replace(/ /g, "-") + "/index.html"; }

  var sidebar = $("sidebar-related");
  var latest = $("latest-post-wrapper");
  if (!sidebar && !latest) return;

  var articleDataPromise = window.ArticlesSource
    ? window.ArticlesSource.load(ARTICLES_JSON)
    : fetch(ARTICLES_JSON).then(function (r) { return r.json(); });

  articleDataPromise
    .then(function (articles) {
      var posts = (articles || [])
        .filter(function (p) { return p.slug !== CURRENT_SLUG; })
        .sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
      if (!posts.length) throw new Error("empty");

      var related = posts.filter(function (p) { return p.category === CURRENT_CATEGORY; }).slice(0, 3);
      if (related.length < 3) {
        related = related.concat(posts.filter(function (p) { return related.indexOf(p) < 0; }).slice(0, 3 - related.length));
      }
      if (sidebar) {
        sidebar.innerHTML = related.map(function (p, i) {
          return (i ? '<div class="h-px bg-border-subtle/50"></div>' : "") +
            '<a class="flex gap-3 group items-start" href="' + esc(p.url) + '">' +
            '<img alt="' + esc(p.title) + '" class="w-20 h-16 rounded-xl object-cover shrink-0 bg-surface-container group-hover:opacity-90 transition-opacity" src="' + esc(p.image) + '" loading="lazy" />' +
            '<div class="flex flex-col min-w-0">' +
            '<span class="font-label-pill text-[10px] text-primary uppercase font-bold">' + esc(p.category) + "</span>" +
            '<h4 class="font-headline-sm text-[13px] leading-tight font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">' + esc(p.title) + "</h4>" +
            '<span class="font-label-meta text-[11px] text-navy-muted mt-1">' + esc(p.date) + "</span>" +
            "</div></a>";
        }).join("");
      }

      if (latest) {
        var relatedSlugs = related.map(function (p) { return p.slug; });
        var grid = posts.filter(function (p) { return relatedSlugs.indexOf(p.slug) < 0; }).slice(0, 3);
        if (grid.length < 3) grid = posts.slice(0, 3);
        latest.innerHTML = grid.map(function (p) {
          return '<article class="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">' +
            '<a href="' + esc(p.url) + '" class="relative block aspect-video overflow-hidden bg-surface-container">' +
            '<img alt="' + esc(p.title) + '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="' + esc(p.image) + '" loading="lazy" />' +
            "</a>" +
            '<div class="p-space-md flex flex-col flex-1 justify-between gap-space-sm">' +
            "<div>" +
            '<div class="flex flex-wrap items-center gap-2 font-label-meta text-label-meta text-navy-muted">' +
            '<a href="' + catUrl(p.category) + '" class="px-2.5 py-0.5 rounded-full bg-royal-blue-subtle text-primary font-bold text-[11px] uppercase hover:bg-primary hover:text-on-primary transition-colors">' + esc(p.category) + "</a>" +
            "<span>" + esc(p.date) + "</span></div>" +
            '<h3 class="font-headline-md text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors mt-2"><a href="' + esc(p.url) + '">' + esc(p.title) + "</a></h3>" +
            '<p class="font-body-small text-body-small text-on-surface-variant line-clamp-2 mt-2">' + esc(p.excerpt) + "</p>" +
            "</div>" +
            '<a href="' + esc(p.url) + '" class="pt-space-sm flex items-center justify-between font-label-meta text-label-meta">' +
            '<span class="font-semibold text-primary">Baca Selengkapnya</span>' +
            '<span class="material-symbols-outlined text-[18px] text-primary">arrow_forward</span></a>' +
            "</div></article>";
        }).join("");
      }
    })
    .catch(function () {
      if (sidebar) sidebar.innerHTML = '<a href="index.html" class="font-body-small text-body-small text-primary font-semibold">Lihat semua artikel →</a>';
      if (latest) latest.innerHTML = "";
    });
})();
