/* =====================================================================
   DIALOGIKA HEADER — web component <dialogika-header>
   ---------------------------------------------------------------------
   Cara pakai (di semua halaman):

     <head>
       ... (font Google + dialogika-header.css, lihat README) ...
     </head>
     <body>
       <dialogika-header></dialogika-header>
       <script src="../assets/js/dialogika-header.js"></script>

   - Pasang <script> TEPAT setelah tag <dialogika-header> agar header
     langsung tampil tanpa "kedip" (tidak menunggu seluruh halaman).
   - Path otomatis dihitung dari lokasi file JS ini, jadi berfungsi di
     root (index.html) maupun di subfolder (blog/, communication/, ...).
   - Menu aktif otomatis terdeteksi. Bisa dipaksa dengan atribut:
       <dialogika-header active="home"></dialogika-header>
       <dialogika-header active="artikel"></dialogika-header>
   - Pencarian mengarah ke arsip blog/index.html?q=...; jika sedang di
     halaman arsip (body[data-page="archive"]) akan memicu event
     "archive:search" sehingga hasil langsung tersaring tanpa reload.
   ===================================================================== */
(function () {
  "use strict";

  var script = document.currentScript;
  var ROOT = script ? new URL("../../", script.src).href : "/";
  var WA_URL = "https://wa.me/6285162992597";
  var SITE = "https://www.dialogika.co/";

  function url(path) {
    return ROOT + path;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icon(name) {
    return '<span class="dlg-icon" aria-hidden="true">' + name + "</span>";
  }

  /* ---------------- Data menu (ubah di sini) ---------------- */
  var PROGRAM = [
    {
      label: "Online",
      items: [
        { label: "Basic Play", href: SITE + "program/basic-play.html" },
        { label: "Basic Class", href: SITE + "program/basic-class.html", tag: "Best Buy" },
        "sep",
        { label: "Kids Play", href: SITE + "program/kids-play.html" },
        { label: "Kids Class", href: SITE + "program/kids-class.html", tag: "Best Buy" }
      ]
    },
    {
      label: "Offline",
      items: [
        { label: "First Class", href: SITE + "program/first-class.html", tag: "Best Buy" },
        { label: "First Kids", href: SITE + "program/first-kids.html" },
        { label: "First Lite", href: SITE + "program/first-lite.html" },
        "sep",
        { label: "First Private", href: SITE + "program/first-private.html" }
      ]
    },
    "sep",
    {
      label: "Area",
      items: [
        { label: "Yogyakarta", href: SITE + "program/index-jogja.html" },
        { label: "Bintaro", href: SITE + "program/index-tangsel.html" },
        { label: "Solo", href: SITE + "program/index-solo.html" },
        { label: "Banjarbaru", href: SITE + "program/index-banjarbaru.html" },
        { label: "Surabaya", href: SITE + "program/index-surabaya.html" }
      ]
    }
  ];

  var POSITION = [
    { label: "Client Manager", href: SITE + "intern/client-manager.html", tag: "Best" },
    { label: "Telemarketing", href: SITE + "intern/telemarketing.html", tag: "Best" },
    { label: "Digital Marketing", href: SITE + "intern/digital-marketing.html" },
    { label: "Model Talent", href: SITE + "intern/model-talent.html", tag: "Best" },
    "sep",
    { label: "Social Media Analyst", href: SITE + "intern/social-media-analyst.html" },
    { label: "Content Writing", href: SITE + "intern/content-writing.html" },
    { label: "Design Specialist", href: SITE + "intern/design-specialist.html" },
    { label: "HTML Writing", href: SITE + "intern/html-writing.html" },
    { label: "Video Editor", href: SITE + "intern/video-editing.html" },
    "sep",
    { label: "People Development", href: SITE + "intern/people-development.html" },
    { label: "HR Generalist", href: SITE + "intern/hr-generalist.html" },
    { label: "Recruiter Specialist", href: SITE + "intern/recruiter-specialist.html", tag: "Best" }
  ];

  var MORE = [
    { label: "Tentang Kami & Mentor", desc: "Profil mentor & visi Dialogika", icon: "groups", tone: "", href: SITE + "about/" },
    { label: "Acara & Webinar", desc: "Sesi belajar & event terbaru", icon: "event_available", tone: "comm", href: SITE + "event/" },
    { label: "Merchandise & Buku", desc: "Buku panduan & merchandise resmi", icon: "storefront", tone: "mind", href: SITE + "shop/" },
    { label: "Layanan Corporate", desc: "Training & workshop perusahaan", icon: "handshake", tone: "grey", href: SITE + "service/" },
    { label: "FAQ & Bantuan", desc: "Pertanyaan umum & panduan daftar", icon: "help", tone: "grey", href: SITE + "help/", sep: true }
  ];

  var SOCIAL = [
    {
      label: "Twitter",
      href: "https://twitter.com/dialogika_co",
      svg: '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>'
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/dialogika.co",
      svg: '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/dialogika.co",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/dialogika",
      svg: '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>'
    }
  ];

  var WA_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M9.11 7.39c-.17 0-.43.07-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.39 1.01 2.56.13.17 1.74 2.64 4.19 3.7.59.25 1.04.4 1.4.51.59.19 1.13.17 1.56.1.48-.07 1.48-.61 1.69-1.19.2-.59.2-1.09.14-1.19-.06-.1-.21-.16-.44-.27-.23-.12-1.37-.68-1.58-.76-.21-.07-.36-.11-.51.13-.15.23-.58.74-.71.89-.13.14-.26.16-.48.05-.23-.12-.96-.36-1.84-1.14-.68-.6-1.14-1.35-1.27-1.58-.13-.22-.01-.35.1-.46.11-.1.24-.27.36-.41.12-.14.16-.25.24-.4.08-.15.04-.29-.02-.4-.06-.11-.51-1.23-.7-1.68-.18-.45-.37-.39-.51-.39h-.44"/></svg>';

  /* ---------------- Renderer ---------------- */
  function renderTag(tag, yellow) {
    return tag ? '<span class="dlg-tag' + (yellow ? " dlg-tag--yellow" : "") + '">' + esc(tag) + "</span>" : "";
  }

  function renderMenuItems(items) {
    return items
      .map(function (item) {
        if (item === "sep") return '<div class="dlg-menu__sep" role="separator"></div>';
        return (
          '<a class="dlg-menu__item" href="' + esc(item.href) + '"><span>' + esc(item.label) + "</span>" + renderTag(item.tag) + "</a>"
        );
      })
      .join("");
  }

  function renderProgramMenu() {
    return PROGRAM.map(function (group) {
      if (group === "sep") return '<div class="dlg-menu__sep" role="separator"></div>';
      return (
        '<div class="dlg-sub">' +
        '<a class="dlg-menu__item dlg-menu__label" href="#" role="button" aria-haspopup="true" onclick="return false"><span>' +
        esc(group.label) + "</span>" + icon("chevron_right") + "</a>" +
        '<div class="dlg-sub__panel"><div class="dlg-menu">' + renderMenuItems(group.items) + "</div></div>" +
        "</div>"
      );
    }).join("");
  }

  function renderMore() {
    return MORE.map(function (item) {
      return (
        '<a class="dlg-rich' + (item.sep ? " dlg-rich--sep" : "") + '" href="' + esc(item.href) + '">' +
        '<span class="dlg-rich__icon' + (item.tone ? " dlg-rich__icon--" + item.tone : "") + '">' + icon(item.icon) + "</span>" +
        '<span class="dlg-rich__body"><span class="dlg-rich__title">' + esc(item.label) + '</span><span class="dlg-rich__desc">' + esc(item.desc) + "</span></span>" +
        "</a>"
      );
    }).join("");
  }

  function renderSocial(extra) {
    return (
      '<div class="dlg-social' + (extra || "") + '">' +
      SOCIAL.map(function (s) {
        return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '">' + s.svg + "</a>";
      }).join("") +
      "</div>"
    );
  }

  function searchForm(id, extraClass) {
    return (
      '<form class="dlg-search dlg-search-form' + (extraClass || "") + '" role="search" action="' + url("blog/index.html") + '" method="get">' +
      '<button class="dlg-search__btn" type="submit" aria-label="Cari">' + icon("search") + "</button>" +
      '<label class="dlg-sr-only" for="' + id + '">Cari artikel</label>' +
      '<input class="dlg-search__input" id="' + id + '" name="q" type="search" autocomplete="off" placeholder="Cari artikel, topik, atau program..." />' +
      "</form>"
    );
  }

  function navLink(key, active, label, href) {
    return '<a class="dlg-nav__link' + (active === key ? " is-active" : "") + '" href="' + href + '"' + (active === key ? ' aria-current="page"' : "") + ">" + label + "</a>";
  }

  function detectActive(el) {
    var forced = (el.getAttribute("active") || "").toLowerCase();
    if (forced) return forced;
    var path = window.location.pathname.replace(/\/+$/, "/");
    var rootPath = new URL(ROOT).pathname;
    var rel = path.indexOf(rootPath) === 0 ? path.slice(rootPath.length) : path.replace(/^\//, "");
    if (rel === "" || rel === "index.html") return "home";
    return "artikel";
  }

  function template(active) {
    return (
      '<div class="dlg-header">' +
      /* 1. Top bar */
      '<div class="dlg-topbar"><div class="dlg-wrap">' +
      '<div class="dlg-topbar__links">' +
      '<a href="' + SITE + 'help/">Help</a><span class="dlg-topbar__dot">•</span>' +
      '<a href="' + SITE + 'about/">Status</a><span class="dlg-topbar__dot">•</span>' +
      '<a href="' + SITE + 'intern/content-writing.html">Writers</a>' +
      "</div>" +
      '<div class="dlg-topbar__contact">' +
      '<div class="dlg-topbar__item dlg-topbar__item--strong">' + icon("call") + '<a href="tel:+6285162992597">(+62) 851-6299-2597</a></div>' +
      '<div class="dlg-topbar__item">' + icon("mail") + '<a href="mailto:admin@dialogika.co">admin@dialogika.co</a></div>' +
      "</div>" +
      '<div class="dlg-topbar__right">' +
      '<div class="dlg-topbar__item">' + icon("location_on") + "<span>Indonesia</span></div>" +
      '<div class="dlg-weather">' + icon("wb_sunny") + "<b>28° C</b></div>" +
      "</div>" +
      "</div></div>" +
      /* 2. Mid area */
      '<div class="dlg-mid"><div class="dlg-wrap">' +
      '<a class="dlg-logo" href="' + url("index.html") + '" aria-label="Blog Dialogika - Beranda"><img src="' + url("assets/images/logo/logo.png") + '" alt="Dialogika" width="132" height="40" /></a>' +
      '<div class="dlg-actions">' +
      '<div class="dlg-search-holder">' + searchForm("dlg-search-input") + "</div>" +
      '<a class="dlg-circle" href="' + url("blog/index.html") + '" aria-label="Artikel terbaru" title="Artikel terbaru">' + icon("notifications") + '<span class="dlg-circle__dot"></span></a>' +
      '<a class="dlg-circle" href="' + SITE + '" aria-label="Website Dialogika" title="Website Dialogika">' + icon("person") + "</a>" +
      '<a class="dlg-btn-wa" href="' + WA_URL + '" target="_blank" rel="noopener noreferrer">' + WA_SVG + "<span>Konsultasi</span></a>" +
      '<button class="dlg-circle dlg-burger" type="button" aria-label="Buka menu" aria-expanded="false" aria-controls="dlg-drawer">' + icon("menu") + "</button>" +
      "</div>" +
      "</div></div>" +
      /* 3. Bottom area */
      '<div class="dlg-bottom"><div class="dlg-wrap">' +
      renderSocial() +
      '<nav class="dlg-nav" aria-label="Navigasi utama">' +
      navLink("home", active, "Home", url("index.html")) +
      '<div class="dlg-dd">' +
      '<button class="dlg-nav__link" type="button" aria-haspopup="true"><span>Program</span>' + icon("expand_more") + "</button>" +
      '<div class="dlg-dd__panel"><div class="dlg-menu">' + renderProgramMenu() + "</div></div>" +
      "</div>" +
      '<div class="dlg-dd">' +
      '<button class="dlg-nav__link" type="button" aria-haspopup="true"><span>Position</span>' + icon("expand_more") + "</button>" +
      '<div class="dlg-dd__panel dlg-dd__panel--w64"><div class="dlg-menu">' + renderMenuItems(POSITION) + "</div></div>" +
      "</div>" +
      navLink("resume", active, "Resume", SITE + "intern/resume/") +
      '<div class="dlg-dd">' +
      '<button class="dlg-nav__link" type="button" aria-haspopup="true"><span>More</span>' + icon("expand_more") + "</button>" +
      '<div class="dlg-dd__panel dlg-dd__panel--right dlg-dd__panel--w72"><div class="dlg-menu dlg-menu--lg">' + renderMore() + "</div></div>" +
      "</div>" +
      navLink("artikel", active, "Artikel", url("blog/index.html")) +
      "</nav>" +
      "</div></div>" +
      "</div>" +
      /* Drawer mobile */
      '<div class="dlg-scrim" data-dlg-close></div>' +
      '<aside class="dlg-drawer" id="dlg-drawer" aria-label="Menu" aria-hidden="true">' +
      '<div class="dlg-drawer__head"><img src="' + url("assets/images/logo/logo.png") + '" alt="Dialogika" />' +
      '<button class="dlg-circle" type="button" aria-label="Tutup menu" data-dlg-close>' + icon("close") + "</button></div>" +
      '<div class="dlg-drawer__body">' +
      '<div class="dlg-drawer__search">' + searchForm("dlg-search-input-m") + "</div>" +
      '<nav class="dlg-drawer__nav" aria-label="Navigasi mobile">' +
      '<a href="' + url("index.html") + '"' + (active === "home" ? ' class="is-active"' : "") + ">Home</a>" +
      "<details><summary>Program" + icon("expand_more") + '</summary><div class="dlg-drawer__group">' +
      PROGRAM.filter(function (g) { return g !== "sep"; }).map(function (g) {
        return "<small>" + esc(g.label) + "</small>" + g.items.filter(function (i) { return i !== "sep"; }).map(function (i) {
          return '<a href="' + esc(i.href) + '"><span>' + esc(i.label) + "</span>" + renderTag(i.tag) + "</a>";
        }).join("");
      }).join("") +
      "</div></details>" +
      "<details><summary>Position" + icon("expand_more") + '</summary><div class="dlg-drawer__group">' +
      POSITION.filter(function (i) { return i !== "sep"; }).map(function (i) {
        return '<a href="' + esc(i.href) + '"><span>' + esc(i.label) + "</span>" + renderTag(i.tag) + "</a>";
      }).join("") +
      "</div></details>" +
      '<a href="' + SITE + 'intern/resume/">Resume</a>' +
      "<details><summary>More" + icon("expand_more") + '</summary><div class="dlg-drawer__group">' +
      MORE.map(function (i) { return '<a href="' + esc(i.href) + '"><span>' + esc(i.label) + "</span></a>"; }).join("") +
      "</div></details>" +
      '<a href="' + url("blog/index.html") + '"' + (active === "artikel" ? ' class="is-active"' : "") + ">Artikel</a>" +
      "</nav>" +
      "</div>" +
      '<div class="dlg-drawer__foot">' +
      '<a class="dlg-btn-wa" href="' + WA_URL + '" target="_blank" rel="noopener noreferrer">' + WA_SVG + "<span>Konsultasi Gratis</span></a>" +
      renderSocial(" dlg-social--lg") +
      "</div>" +
      "</aside>"
    );
  }

  /* ---------------- Perilaku ---------------- */
  function isArchivePage() {
    return document.body && document.body.getAttribute("data-page") === "archive";
  }

  function bind(el) {
    var burger = el.querySelector(".dlg-burger");
    var drawer = el.querySelector(".dlg-drawer");

    function setOpen(open) {
      el.classList.toggle("dlg-open", open);
      document.documentElement.classList.toggle("dlg-lock", open);
      drawer.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      if (open) {
        var first = drawer.querySelector("input, a, button");
        if (first) setTimeout(function () { first.focus(); }, 50);
      } else {
        burger.focus();
      }
    }

    burger.addEventListener("click", function () { setOpen(true); });
    el.querySelectorAll("[data-dlg-close]").forEach(function (btn) {
      btn.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.classList.contains("dlg-open")) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && el.classList.contains("dlg-open")) setOpen(false);
    });

    /* Search */
    var initial = new URLSearchParams(window.location.search).get("q") || "";
    el.querySelectorAll(".dlg-search-form").forEach(function (form) {
      var input = form.querySelector("input");
      if (initial && isArchivePage()) {
        input.value = initial;
        form.classList.add("is-filled");
      }
      input.addEventListener("input", function () {
        form.classList.toggle("is-filled", !!input.value.trim());
      });
      form.addEventListener("submit", function (event) {
        var query = input.value.trim();
        if (isArchivePage()) {
          event.preventDefault();
          document.dispatchEvent(new CustomEvent("archive:search", { detail: { query: query } }));
          if (el.classList.contains("dlg-open")) setOpen(false);
          return;
        }
        if (!query) {
          event.preventDefault();
          window.location.href = url("blog/index.html");
        }
      });
    });

    /* Tutup dropdown desktop setelah klik link (untuk fokus keyboard) */
    el.querySelectorAll(".dlg-dd__panel a:not(.dlg-menu__label)").forEach(function (link) {
      link.addEventListener("click", function () { link.blur(); });
    });
  }

  if (window.customElements && !window.customElements.get("dialogika-header")) {
    window.customElements.define(
      "dialogika-header",
      class extends HTMLElement {
        connectedCallback() {
          if (this._ready) return;
          this._ready = true;
          this.innerHTML = template(detectActive(this));
          bind(this);
        }
      }
    );
  }
})();
