/**
 * BlogGenerator.App — Main Orchestrator
 * ========================================
 * Initializes all modules, binds events, collects form data,
 * triggers template processing and download.
 */
(function () {
  "use strict";

  var Utils = BlogGenerator.Utils;
  var Config = BlogGenerator.Config;
  var Editor = BlogGenerator.Editor;
  var TagManager = BlogGenerator.TagManager;
  var FaqManager = BlogGenerator.FaqManager;
  var TakeawaysManager = BlogGenerator.TakeawaysManager;
  var SourcesManager = BlogGenerator.SourcesManager;
  var TemplateProcessor = BlogGenerator.TemplateProcessor;
  var Download = BlogGenerator.Download;
  var Builder = BlogGenerator.ArticleBuilder;

  var generatedHtml = null;
  var lastEntry = null; /* entri articles.json untuk artikel yang terakhir di-generate */

  /**
   * Baca semua isian form menjadi objek input untuk ArticleBuilder.
   */
  function readForm() {
    function val(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : "";
    }
    return {
      title: val("field-title"),
      metaDescription: val("field-meta-desc"),
      keywords: val("field-meta-keywords"),
      ogTitle: val("field-og-title"),
      ogDescription: val("field-og-desc"),
      ogImage: val("field-og-image"),
      author: val("field-author"),
      category: val("field-category"),
      date: val("field-date"),
      featuredImage: val("field-featured-image"),
      cheatsheetPdf: val("field-cheatsheet-pdf"),
      contentHtml: Editor.getContent(),
      tags: TagManager.getTags(),
      takeaways: TakeawaysManager.getItems(),
      faqs: FaqManager.getFaqs(),
      sources: SourcesManager.getSources(),
    };
  }

  /**
   * Validasi + bangun data template dan entri articles.json.
   * Logika ada di article-builder.js (dipakai juga oleh CLI).
   */
  function collectFormData() {
    var input = readForm();
    var error = Builder.validate(input);
    if (error) {
      alert(error);
      return null;
    }
    var result = Builder.build(input);
    lastEntry = result.entry;
    return result.data;
  }

  /**
   * Show preview in modal.
   */
  function showPreview(html) {
    var modal = document.getElementById("previewModal");
    var iframe = document.getElementById("previewFrame");
    if (!modal || !iframe) return;

    /* Write HTML into iframe via srcdoc */
    iframe.srcdoc = html;

    /* Show modal */
    var bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  /**
   * Tampilkan panel "Langkah publish artikel" + preview entri JSON.
   */
  function showPublishSteps(entry) {
    var box = document.getElementById("publish-steps");
    if (!box || !entry) return;
    box.querySelectorAll(".js-slug").forEach(function (el) {
      el.textContent = entry.slug;
    });
    var pre = document.getElementById("json-entry-preview");
    if (pre) pre.textContent = JSON.stringify(entry, null, 2);
    box.style.display = "block";
  }

  /**
   * Ambil articles.json terbaru, masukkan entri artikel ini, lalu download.
   */
  function downloadArticlesJson() {
    if (!lastEntry) {
      alert("Generate HTML terlebih dahulu!");
      return;
    }
    fetch(Config.articlesJsonPath, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function () {
        /* Admin dibuka langsung dari file (file://) atau JSON tidak terbaca */
        return null;
      })
      .then(function (current) {
        if (!Array.isArray(current)) {
          alert(
            "articles.json tidak bisa dibaca otomatis (admin dibuka tanpa server lokal?).\n" +
              "Gunakan tombol \"Salin entri\" lalu tempel entri tersebut di paling atas daftar assets/data/articles.json."
          );
          var details = document.querySelector("#publish-steps details");
          if (details) details.open = true;
          return;
        }
        var result = Builder.upsertIndex(current, lastEntry);
        var blob = new Blob([Builder.stringifyIndex(result.list)], {
          type: "application/json;charset=utf-8",
        });
        Download.trigger("articles.json", blob);
        var alertBox = document.getElementById("status-alert");
        if (alertBox) {
          alertBox.className = "alert alert-success mt-3";
          alertBox.innerHTML =
            '<i class="bi bi-check-circle me-2"></i>articles.json di-download (' +
            result.list.length +
            " artikel, entri <strong>" +
            lastEntry.slug +
            "</strong> " +
            (result.replaced ? "diperbarui" : "ditambahkan") +
            "). Timpa file <code>assets/data/articles.json</code>.";
          alertBox.style.display = "block";
        }
      });
  }

  function copyEntry() {
    if (!lastEntry) return;
    var text = JSON.stringify(lastEntry, null, 2) + ",";
    var btn = document.getElementById("btn-copy-entry");
    function done() {
      if (btn) btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Tersalin';
      setTimeout(function () {
        if (btn) btn.innerHTML = '<i class="bi bi-clipboard me-1"></i>Salin entri';
      }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        window.prompt("Salin entri berikut:", text);
      });
    } else {
      window.prompt("Salin entri berikut:", text);
    }
  }

  /**
   * Initialize the application.
   */
  function init() {
    /* Initialize sub-modules */
    Editor.init("editor-content", "editor-toolbar");
    TagManager.init("tag-manager");
    FaqManager.init("faq-manager");
    TakeawaysManager.init("takeaways-manager");
    SourcesManager.init("sources-manager");

    /* Populate category dropdown */
    var categorySelect = document.getElementById("field-category");
    if (categorySelect) {
      Config.categories.forEach(function (cat) {
        var opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
      });
    }

    /* Title validation indicator */
    var titleInput = document.getElementById("field-title");
    var titleValidEl = document.getElementById("title-valid");
    if (titleInput) {
      titleInput.addEventListener("input", function () {
        /* Auto-fill OG title if empty */
        var ogTitle = document.getElementById("field-og-title");
        if (ogTitle && !ogTitle.value.trim()) {
          ogTitle.placeholder = titleInput.value || "OG Title (auto from title)";
        }
        /* Title dash validation indicator */
        if (titleValidEl) {
          if (titleInput.value.indexOf(" - ") !== -1) {
            titleValidEl.innerHTML = '<span style="color:#198754">&#10003; Valid</span>';
          } else {
            titleValidEl.innerHTML = '<span style="color:#dc3545">&#10007; Butuh strip (-)</span>';
          }
        }
      });
    }

    /* Meta description character counter */
    var metaDescInput = document.getElementById("field-meta-desc");
    var metaDescCount = document.getElementById("meta-desc-count");
    if (metaDescInput && metaDescCount) {
      metaDescInput.addEventListener("input", function () {
        metaDescCount.textContent = metaDescInput.value.length;
      });
    }

    /* Generate HTML button */
    var generateBtn = document.getElementById("btn-generate");
    if (generateBtn) {
      generateBtn.addEventListener("click", function () {
        var data = collectFormData();
        if (!data) return;

        var slug = data.SLUG;

        /* Disable button and show loading */
        generateBtn.disabled = true;
        generateBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Generating...';

        TemplateProcessor.load()
          .then(function (template) {
            generatedHtml = TemplateProcessor.process(template, data);

            /* Enable download button */
            var downloadBtn = document.getElementById("btn-download");
            if (downloadBtn) {
              downloadBtn.disabled = false;
              downloadBtn.classList.remove("btn-secondary");
              downloadBtn.classList.add("btn-success");
            }

            /* Enable preview button */
            var previewBtn = document.getElementById("btn-preview");
            if (previewBtn) {
              previewBtn.disabled = false;
              previewBtn.classList.remove("btn-secondary");
              previewBtn.classList.add("btn-info");
            }

            /* Store slug for download */
            if (downloadBtn) downloadBtn.setAttribute("data-slug", slug);

            /* Aktifkan download articles.json + tampilkan langkah publish */
            var jsonBtn = document.getElementById("btn-download-json");
            if (jsonBtn) {
              jsonBtn.disabled = false;
              jsonBtn.classList.remove("btn-secondary");
              jsonBtn.classList.add("btn-warning");
            }
            showPublishSteps(lastEntry);

            /* Show success alert */
            var alertBox = document.getElementById("status-alert");
            if (alertBox) {
              alertBox.className = "alert alert-success mt-3";
              alertBox.innerHTML =
                '<i class="bi bi-check-circle me-2"></i>HTML berhasil di-generate! <strong>' +
                slug +
                ".html</strong> siap di-download.";
              alertBox.style.display = "block";
            }

            /* Show word count & read time */
            var infoBox = document.getElementById("article-info");
            if (infoBox) {
              var wordCount = Utils.wordCount(data.ARTICLE_CONTENT);
              var readTime = Utils.readingTime(data.ARTICLE_CONTENT);
              infoBox.textContent =
                wordCount + " kata · " + readTime + " menit baca";
              infoBox.style.display = "block";
            }
          })
          .catch(function (err) {
            var alertBox = document.getElementById("status-alert");
            if (alertBox) {
              alertBox.className = "alert alert-danger mt-3";
              alertBox.innerHTML =
                '<i class="bi bi-exclamation-triangle me-2"></i>Error: ' +
                err.message;
              alertBox.style.display = "block";
            }
          })
          .finally(function () {
            generateBtn.disabled = false;
            generateBtn.innerHTML =
              '<i class="bi bi-gear me-2"></i>Generate HTML';
          });
      });
    }

    /* Preview button */
    var previewBtn = document.getElementById("btn-preview");
    if (previewBtn) {
      previewBtn.addEventListener("click", function () {
        if (generatedHtml) {
          showPreview(generatedHtml);
        }
      });
    }

    /* Download articles.json + salin entri */
    var jsonBtn = document.getElementById("btn-download-json");
    if (jsonBtn) jsonBtn.addEventListener("click", downloadArticlesJson);
    var copyBtn = document.getElementById("btn-copy-entry");
    if (copyBtn) copyBtn.addEventListener("click", copyEntry);

    /* Download button */
    var downloadBtn = document.getElementById("btn-download");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        if (!generatedHtml) {
          alert("Generate HTML terlebih dahulu!");
          return;
        }
        var slug = downloadBtn.getAttribute("data-slug") || "blog-post";
        Download.generateAndDownload(generatedHtml, slug);
      });
    }
  }

  /* Run on DOM ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
