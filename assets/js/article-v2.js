/*
 * Interaksi halaman detail artikel (UI v2) — dipakai semua artikel.
 * Template: admin/template/blog-template.html
 *
 * - Progress bar baca & estimasi waktu baca
 * - Tombol Apresiasi (clap) & Salin Link (+ toast)
 * - Proteksi gambar featured (klik kanan dimatikan)
 * - Daftar isi otomatis dari H2 di #article-body
 * - Kotak Key Takeaways / FAQ / Sumber disembunyikan jika kosong
 * - Artikel terkait (sidebar + grid "Lanjutkan Membaca") dari assets/data/articles.json
 * - Form newsletter
 */
(function () {
  "use strict";

  var body = document.body;
  var SLUG = body.getAttribute("data-article-slug") || "";
  var DATA_URL = "../assets/data/articles.json";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- Rapikan jarak di bawah header ----------
   * Beberapa versi header (mis. <dialogika-header> dengan posisi fixed) menambahkan
   * ruang pengganjal sendiri. Jika ruang itu ikut terhitung dua kali, muncul celah
   * kosong besar di atas breadcrumb. Fungsi ini mengukur celah antara bagian bawah
   * header dan awal konten, lalu menghapus kelebihannya.
   */
  /* Posisi bawah header: bagian bawah "bar" header (elemen di atas <main>) yang benar-benar
     berisi konten terlihat (teks/logo/ikon). Elemen pengganjal kosong, panel menu mobile,
     dropdown, dan overlay setinggi layar diabaikan. */
  function isShown(el) {
    if (el.checkVisibility) return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    var cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) !== 0;
  }
  function contentBottom(el, vw) {
    var max = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var range = document.createRange();
    for (var node = walker.currentNode; node; node = walker.nextNode()) {
      var r = null;
      if (node.nodeType === 3) {
        if (!node.nodeValue.trim() || !node.parentElement || !isShown(node.parentElement)) continue;
        range.selectNodeContents(node);
        r = range.getBoundingClientRect();
      } else if (/^(IMG|SVG|svg|INPUT|BUTTON|PICTURE|VIDEO)$/.test(node.tagName) && isShown(node)) {
        r = node.getBoundingClientRect();
      }
      if (r && r.height > 0 && r.right > 0 && r.left < vw) max = Math.max(max, r.bottom);
    }
    return max;
  }
  function headerBottom(main) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var bottom = 0;
    var nodes = [];
    for (var sib = main.previousElementSibling; sib; sib = sib.previousElementSibling) {
      if (/^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE)$/.test(sib.tagName)) continue;
      nodes.push(sib);
      Array.prototype.push.apply(nodes, sib.querySelectorAll("*"));
    }
    nodes.forEach(function (n) {
      if (!isShown(n)) return;
      var r = n.getBoundingClientRect();
      if (r.height < 30 || r.width < vw * 0.5) return; // bukan bar selebar halaman
      if (r.height > vh * 0.6) return; // panel/overlay setinggi layar
      if (r.right <= 0 || r.left >= vw || r.top > 400) return;
      var cb = contentBottom(n, vw);
      if (!cb) return; // pengganjal kosong
      if (r.bottom - cb > 90) return; // sebagian besar ruang kosong (mengandung pengganjal)
      bottom = Math.max(bottom, r.bottom);
    });
    return bottom;
  }
  function fixHeaderGap() {
    var main = document.querySelector("main");
    if (!main) return;
    // ukur hanya saat halaman di paling atas (posisi header fixed/sticky = posisi awalnya)
    if ((window.pageYOffset || document.documentElement.scrollTop) > 2) {
      window.addEventListener("scroll", function once() {
        if ((window.pageYOffset || document.documentElement.scrollTop) <= 2) {
          window.removeEventListener("scroll", once);
          fixHeaderGap();
        }
      }, { passive: true });
      return;
    }
    main.style.marginTop = "";
    var hb = headerBottom(main);
    if (!hb) return;
    var first = main.firstElementChild || main;
    var gap = Math.round(first.getBoundingClientRect().top - hb);
    if (gap > 4) {
      var current = parseFloat(getComputedStyle(main).marginTop) || 0;
      main.style.marginTop = current - gap + "px";
    }
  }
  function scheduleHeaderGapFix() {
    requestAnimationFrame(function () { requestAnimationFrame(fixHeaderGap); });
  }
  if (window.customElements && customElements.whenDefined) {
    customElements.whenDefined("dialogika-header").then(scheduleHeaderGapFix);
  }
  window.addEventListener("load", function () {
    scheduleHeaderGapFix();
    setTimeout(scheduleHeaderGapFix, 400); // header yang dirender belakangan
  });
  window.addEventListener("resize", scheduleHeaderGapFix);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleHeaderGapFix);
  scheduleHeaderGapFix();

  /* ---------- Progress bar baca ---------- */
  var progress = $("dialogika-reading-progress");
  if (progress) {
    var updateProgress = function () {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = total > 0 ? Math.min(Math.max((scrollY / total) * 100, 0), 100) + "%" : "0%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------- Waktu baca (250 kata/menit) ---------- */
  var articleBody = $("article-body");
  var readTime = $("read-time-text");
  if (articleBody && readTime) {
    var words = articleBody.innerText.trim().split(/\s+/).filter(Boolean).length;
    readTime.textContent = Math.max(1, Math.ceil(words / 250)) + " menit baca";
  }

  /* ---------- Inisial penulis ---------- */
  document.querySelectorAll("[data-author-initials]").forEach(function (el) {
    var name = (el.getAttribute("data-author-initials") || "Dialogika")
      .replace(/^(coach|kak|mentor)\s+/i, "")
      .trim();
    var parts = name.split(/\s+/).filter(Boolean);
    el.textContent = ((parts[0] || "D")[0] + (parts.length > 1 ? parts[parts.length - 1][0] : (parts[0] || "G")[1] || "")).toUpperCase();
  });

  /* ---------- Clap ---------- */
  var clapCount = 0;
  var MAX_CLAPS = 50;
  function handleClap() {
    if (clapCount >= MAX_CLAPS) return;
    clapCount++;
    document.querySelectorAll("[data-clap-count]").forEach(function (el) {
      el.textContent = clapCount;
    });
    document.querySelectorAll("[data-clap]").forEach(function (btn) {
      btn.classList.add("bg-royal-blue-subtle", "text-brand");
      var icon = btn.querySelector(".clap-icon");
      if (icon) {
        icon.style.transform = "scale(1.35)";
        setTimeout(function () { icon.style.transform = ""; }, 160);
      }
    });
  }

  /* ---------- Salin link + toast ---------- */
  function showCopyToast() {
    var t = $("copy-toast");
    if (!t) return;
    t.classList.add("show");
    clearTimeout(showCopyToast.timer);
    showCopyToast.timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  function handleShare() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(showCopyToast, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      var e = document.createElement("textarea");
      e.value = url;
      e.style.position = "fixed";
      e.style.opacity = "0";
      document.body.appendChild(e);
      e.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(e);
      showCopyToast();
    }
  }

  document.addEventListener("click", function (event) {
    var t = event.target;
    if (!t || !t.closest) return;
    if (t.closest("[data-clap]")) handleClap();
    if (t.closest("[data-copy-link]")) handleShare();
  });

  /* Kompatibilitas: fungsi lama yang mungkin dipanggil lewat atribut onclick */
  window.handleClap = handleClap;
  window.handleShare = handleShare;
  window.toggleFaq = function (btn) {
    var item = btn && btn.closest ? btn.closest("details, .faq-item") : null;
    if (item && item.tagName === "DETAILS") item.open = !item.open;
  };

  /* ---------- Proteksi gambar featured ---------- */
  document.querySelectorAll(".watermark-container").forEach(function (el) {
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  });

  /* ---------- Sembunyikan kotak yang kosong ---------- */
  document.querySelectorAll("[data-hide-if-empty]").forEach(function (box) {
    var sel = box.getAttribute("data-hide-if-empty");
    var target = sel ? box.querySelector(sel) : box;
    if (!target || !target.textContent.trim()) box.hidden = true;
  });

  /* ---------- Daftar isi dari H2 ---------- */
  var tocBox = $("toc-box");
  var tocList = $("toc-list");
  if (articleBody && tocBox && tocList) {
    var headings = Array.prototype.slice.call(articleBody.querySelectorAll("h2"));
    // Artikel tanpa H2 yang cukup: pakai H3 sebagai bagian
    if (headings.length < 2) headings = Array.prototype.slice.call(articleBody.querySelectorAll("h3"));
    var used = {};
    var items = headings
      .map(function (h, i) {
        var text = h.textContent.replace(/\s+/g, " ").trim();
        if (!text) return null;
        if (!h.id) {
          var id = "bagian-" + (text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || i + 1);
          while (used[id]) id += "-" + (i + 1);
          h.id = id;
        }
        used[h.id] = true;
        return { id: h.id, text: text, el: h };
      })
      .filter(Boolean);

    if (items.length >= 2) {
      tocList.innerHTML = items
        .map(function (it, i) {
          return (
            '<a href="#' + escapeHtml(it.id) + '" data-toc-id="' + escapeHtml(it.id) + '" class="p-2 rounded-lg hover:bg-royal-blue-subtle text-on-surface-variant hover:text-brand transition-colors flex items-start gap-2">' +
            '<span class="text-outline-variant font-mono shrink-0">' + (i + 1 < 10 ? "0" : "") + (i + 1) + ".</span>" +
            '<span class="line-clamp-2">' + escapeHtml(it.text) + "</span></a>"
          );
        })
        .join("");
      tocBox.hidden = false;

      if ("IntersectionObserver" in window) {
        var links = tocList.querySelectorAll("a");
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              links.forEach(function (a) {
                a.classList.toggle("active", a.getAttribute("data-toc-id") === entry.target.id);
              });
            });
          },
          { rootMargin: "-160px 0px -65% 0px" }
        );
        items.forEach(function (it) { observer.observe(it.el); });
      }
    }
  }

  /* ---------- Artikel terkait dari articles.json ---------- */
  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6, agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11 };
  function parseDate(value) {
    if (!value) return null;
    var d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    var m = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (!m) return null;
    var month = MONTHS[m[2].toLowerCase().slice(0, 3)];
    return month === undefined ? null : new Date(+m[3], month, +m[1]);
  }
  function formatDate(value) {
    var d = parseDate(value);
    return d ? d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
  }
  function categoryUrl(category) {
    return "../" + String(category || "").toLowerCase().trim().replace(/\s+/g, "-") + "/index.html";
  }
  function image(article) {
    var src = String(article.image || "").trim();
    return !src || src === "https://pleased-emerald-qh2dbzzgll.edgeone.app/" ? "../assets/images/blog/01.jpg" : src;
  }
  function readTimeOf(article) {
    var n = [article.title, article.excerpt, article.keywords].join(" ").split(/\s+/).filter(Boolean).length;
    return Math.max(3, Math.round(n / 4)) + " min baca";
  }

  var sideRoot = $("related-sidebar");
  var gridRoot = $("related-grid");
  var currentCategory = body.getAttribute("data-article-category") || "";

  if (sideRoot || gridRoot) {
    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (articles) {
        if (!articles || !articles.length) return;
        var others = articles
          .filter(function (a) { return a.slug !== SLUG; })
          .sort(function (a, b) {
            var da = parseDate(a.date), db = parseDate(b.date);
            return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
          });
        var sameCat = others.filter(function (a) { return currentCategory && a.category === currentCategory; });
        var rest = others.filter(function (a) { return sameCat.indexOf(a) === -1; });
        var picks = sameCat.concat(rest);

        if (sideRoot) {
          sideRoot.innerHTML = picks
            .slice(0, 3)
            .map(function (a, i) {
              return (
                (i ? '<div class="h-px bg-border-subtle/60"></div>' : "") +
                '<a class="flex gap-3 group items-start" href="' + escapeHtml(a.url) + '">' +
                '<img alt="' + escapeHtml(a.title) + '" src="' + escapeHtml(image(a)) + '" loading="lazy" class="w-20 h-16 rounded-xl object-cover shrink-0 bg-surface-container group-hover:opacity-90 transition-opacity" />' +
                '<span class="flex flex-col min-w-0">' +
                '<span class="text-[10px] text-brand uppercase font-bold tracking-wide">' + escapeHtml(a.category || "Artikel") + "</span>" +
                '<span class="font-heading text-[13px] leading-snug font-bold text-on-surface group-hover:text-brand transition-colors line-clamp-2">' + escapeHtml(a.title) + "</span>" +
                '<span class="text-[11px] text-navy-muted mt-1">' + escapeHtml(readTimeOf(a)) + "</span>" +
                "</span></a>"
              );
            })
            .join("");
          var sideBox = $("related-sidebar-box");
          if (sideBox) sideBox.hidden = false;
        }

        if (gridRoot) {
          gridRoot.innerHTML = picks
            .slice(0, 3)
            .map(function (a) {
              var meta = [formatDate(a.date), readTimeOf(a)].filter(Boolean).join(" • ");
              return (
                '<article class="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group">' +
                '<a href="' + escapeHtml(a.url) + '" class="relative block aspect-video overflow-hidden bg-surface-container" tabindex="-1" aria-hidden="true">' +
                '<img alt="' + escapeHtml(a.title) + '" src="' + escapeHtml(image(a)) + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />' +
                '<span class="absolute top-3 left-3 bg-navy-light/90 text-accent-yellow text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">' + escapeHtml(a.category || "Artikel") + "</span></a>" +
                '<div class="p-space-md flex flex-col flex-1 justify-between gap-space-sm"><div>' +
                '<span class="text-label-meta text-navy-muted">' + escapeHtml(meta) + "</span>" +
                '<h3 class="font-heading text-headline-md font-bold text-on-surface group-hover:text-brand transition-colors mt-1 line-clamp-2"><a href="' + escapeHtml(a.url) + '">' + escapeHtml(a.title) + "</a></h3>" +
                '<p class="text-body-small text-on-surface-variant line-clamp-2 mt-2">' + escapeHtml(a.excerpt || "") + "</p></div>" +
                '<a href="' + escapeHtml(a.url) + '" class="pt-space-sm flex items-center justify-between text-label-meta font-semibold text-brand">' +
                '<span>Baca Selengkapnya</span><span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>' +
                "</div></article>"
              );
            })
            .join("");
        }
      })
      .catch(function () {});
  }

  var moreLink = $("related-more-link");
  if (moreLink && currentCategory) {
    moreLink.href = categoryUrl(currentCategory);
    var label = moreLink.querySelector("[data-label]");
    if (label) label.textContent = "Lihat Semua Artikel " + currentCategory;
  }

  /* ---------- Newsletter ---------- */
  document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector("[role=status]");
      if (status) status.textContent = "Terima kasih! Pendaftaran newsletter akan segera tersedia.";
      form.reset();
    });
  });
})();
