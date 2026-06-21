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
  var Schema = BlogGenerator.Schema;
  var ContentRenderer = BlogGenerator.ContentRenderer;
  var TemplateProcessor = BlogGenerator.TemplateProcessor;
  var Download = BlogGenerator.Download;

  var generatedHtml = null;

  /**
   * Collect all form data into a single object.
   */
  function collectFormData() {
    var title = document.getElementById("field-title").value.trim();
    var metaDesc = document.getElementById("field-meta-desc").value.trim();
    var metaKeywords = document.getElementById("field-meta-keywords").value.trim();
    var ogTitle = document.getElementById("field-og-title").value.trim() || title;
    var ogDesc = document.getElementById("field-og-desc").value.trim() || metaDesc;
    var ogImage = document.getElementById("field-og-image").value.trim();
    var author = document.getElementById("field-author").value.trim() || Config.defaultAuthor;
    var category = document.getElementById("field-category").value.trim();
    var publishedDate = document.getElementById("field-date").value;
    var featuredImageUrl = document.getElementById("field-featured-image").value.trim();
    var cheatsheetPdf = document.getElementById("field-cheatsheet-pdf").value.trim();

    if (!title) {
      alert("Judul artikel wajib diisi!");
      return null;
    }

    /* Title dash validation: must contain " - " */
    if (title.indexOf(" - ") === -1) {
      alert('Judul harus mengandung format "Keyword - Theory" (dengan strip -).\nContoh: Cara Membuat Standup Comedy - Tips Menarik Penonton');
      return null;
    }

    var slug = Utils.slugify(title);
    var canonicalUrl = Config.baseUrl + slug;

    var publishedDateIso = Utils.toIsoDateTime(publishedDate);
    var publishedDateDisplay = Utils.formatDate(publishedDate);

    var articleContent = Editor.getContent();
    var tags = TagManager.getTags();
    var faqs = FaqManager.getFaqs();
    var takeaways = TakeawaysManager.getItems();
    var sources = SourcesManager.getSources();

    var articleJsonLd = Schema.generateArticleSchema({
      title: title,
      description: metaDesc,
      image: featuredImageUrl,
      publishedDateIso: publishedDateIso,
      modifiedDateIso: publishedDateIso,
      canonicalUrl: canonicalUrl,
    });

    var faqJsonLd = Schema.generateFaqSchema(faqs);
    var faqJsonLdBlock = "";
    if (faqJsonLd) {
      faqJsonLdBlock =
        '<script type="application/ld+json">\n' + faqJsonLd + "\n    </script>";
    }

    var breadcrumbJsonLd = Schema.generateBreadcrumbSchema(category, title);
    var tagsHtml = ContentRenderer.renderTags(tags);
    var takeawaysHtml = ContentRenderer.renderTakeaways(takeaways);
    var faqHtml = ContentRenderer.renderFaq(faqs);
    var sourcesHtml = ContentRenderer.renderSources(sources);

    return {
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
      ARTICLE_JSON_LD: articleJsonLd,
      FAQ_JSON_LD_BLOCK: faqJsonLdBlock,
      BREADCRUMB_JSON_LD: breadcrumbJsonLd,
      FEATURED_IMAGE_URL: Utils.escapeHtml(featuredImageUrl),
      FEATURED_IMAGE_ALT: Utils.escapeHtml(title),
      CATEGORY: Utils.escapeHtml(category),
      AUTHOR: Utils.escapeHtml(author),
      PUBLISHED_DATE_DISPLAY: publishedDateDisplay,
      ARTICLE_H1: Utils.escapeHtml(title),
      ARTICLE_CONTENT: articleContent,
      TAGS_HTML: tagsHtml,
      KEY_TAKEAWAYS_HTML: takeawaysHtml,
      FAQ_HTML: faqHtml,
      SOURCES_HTML: sourcesHtml,
      CHEATSHEET_URL: Utils.escapeHtml(cheatsheetPdf),
      BREADCRUMB_CATEGORY: Utils.escapeHtml(category),
      SLUG: slug,
    };
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
