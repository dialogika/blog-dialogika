/**
 * BlogGenerator.ContentRenderer — HTML Snippet Generator
 * =======================================================
 * Converts raw data (tags, takeaways, FAQs) into HTML snippets
 * matching the blog template's structure.
 */
(function () {
  "use strict";

  BlogGenerator.ContentRenderer = {
    /**
     * Render tags as HTML.
     * The tag that matches the article's category name links to the category
     * page (so the category navigation works); other keyword tags stay as
     * non-navigational pills, matching the published article style.
     * @param {string[]} tags
     * @param {string} [category] — article's category name (e.g. "Public Speaking")
     * @param {string} [categoryUrl] — relative URL of the article's category page
     * @returns {string} — HTML string
     */
    renderTags: function (tags, category, categoryUrl) {
      if (!tags || tags.length === 0) return "";
      var cat = String(category || "").toLowerCase().trim();
      return tags
        .map(function (tag) {
          var href =
            categoryUrl && String(tag).toLowerCase().trim() === cat
              ? categoryUrl
              : "#";
          return (
            '<a href="' + BlogGenerator.Utils.escapeHtml(href) + '" class="tags-color">' +
            BlogGenerator.Utils.escapeHtml(tag) +
            "</a>"
          );
        })
        .join("\n                          ");
    },

    /**
     * Render Key Takeaways list items.
     * @param {string[]} items
     * @returns {string} — HTML <li> elements
     */
    renderTakeaways: function (items) {
      if (!items || items.length === 0) return "";
      return items
        .map(function (item) {
          return "<li>" + BlogGenerator.Utils.escapeHtml(item) + "</li>";
        })
        .join("\n                        ");
    },

    /**
     * Render full FAQ section HTML (accordion style matching template).
     * @param {Array} faqs — [{ question, answer }]
     * @returns {string} — Complete FAQ section HTML
     */
    renderFaq: function (faqs) {
      if (!faqs || faqs.length === 0) return "";
      var esc = BlogGenerator.Utils.escapeHtml;

      var html = '<section class="faq-section bg-surface-card p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-sm" id="faq">\n';
      html += '                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">' +
        '<span class="material-symbols-outlined text-primary text-[20px]">quiz</span><span>Pertanyaan yang Sering Diajukan</span></h2>\n';
      html += '                <div class="flex flex-col gap-2">\n';

      faqs.forEach(function (faq) {
        html += '                  <details class="faq-item group rounded-xl bg-surface-container-low">\n';
        html += '                    <summary class="faq-question flex items-center justify-between gap-3 p-space-md cursor-pointer font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary">\n';
        html += "                      <span>" + esc(faq.question) + "</span>\n";
        html += '                      <span class="faq-icon material-symbols-outlined text-primary transition-transform">add</span>\n';
        html += "                    </summary>\n";
        html += '                    <div class="faq-answer px-space-md pb-space-md font-body-default text-body-default text-on-surface-variant">\n';
        html += "                      <p>" + esc(faq.answer) + "</p>\n";
        html += "                    </div>\n";
        html += "                  </details>\n";
      });

      html += "                </div>\n";
      html += "              </section>";
      return html;
    },

    /**
     * Render sources list as HTML.
     * @param {Array} sources — [{ url, title, thumbnail }]
     * @returns {string} — Complete sources section HTML
     */
    renderSources: function (sources) {
      if (!sources || sources.length === 0) return "";
      var esc = BlogGenerator.Utils.escapeHtml;

      var html = '<section class="sources-area bg-surface-card p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-sm" id="referensi">\n';
      html += '                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">' +
        '<span class="material-symbols-outlined text-primary text-[20px]">menu_book</span><span>Sumber &amp; Referensi</span></h2>\n';
      html += '                <ol class="sources-list-wrap flex flex-col gap-2 font-body-small text-body-small text-on-surface-variant">\n';

      sources.forEach(function (src, i) {
        var title = esc(src.title || src.url);
        var url = esc(src.url);
        var num = (i + 1 < 10 ? "0" : "") + (i + 1) + ".";
        html += '                  <li><a class="source-card-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-royal-blue-subtle hover:text-primary transition-colors" href="' + url + '" target="_blank" rel="noopener noreferrer">';
        if (src.thumbnail) {
          html += '<img src="' + esc(src.thumbnail) + '" alt="' + title + '" loading="lazy" class="w-12 h-12 rounded-lg object-cover shrink-0" />';
        } else {
          html += '<span class="text-outline-variant font-mono shrink-0">' + num + "</span>";
        }
        html += '<span class="source-info flex flex-col min-w-0"><span class="font-semibold text-on-surface break-words">' + title + '</span>';
        if (title !== url) html += '<span class="text-navy-muted text-[12px] break-all">' + url + "</span>";
        html += '</span><span class="material-symbols-outlined text-[16px] ml-auto shrink-0">open_in_new</span></a></li>\n';
      });

      html += "                </ol>\n";
      html += "              </section>";
      return html;
    },

    /**
     * Render static social share HTML.
     * @returns {string}
     */
    renderSocialShare: function () {
      var s = BlogGenerator.Config.social;
      return (
        '<ul class="social-share-area">\n' +
        '                          <li><a href="' + s.instagram + '" target="_blank" rel="noopener noreferrer"><i class="icofont-instagram"></i></a></li>\n' +
        '                          <li><a href="' + s.tiktok + '" target="_blank" rel="noopener noreferrer"><i class="icofont-tiktok"></i></a></li>\n' +
        '                          <li><a href="' + s.youtube + '" target="_blank" rel="noopener noreferrer"><i class="icofont-youtube-play"></i></a></li>\n' +
        '                          <li><a href="' + s.linkedin + '" target="_blank" rel="noopener noreferrer"><i class="icofont-linkedin"></i></a></li>\n' +
        '                          <li><a href="' + s.facebook + '" target="_blank" rel="noopener noreferrer"><i class="icofont-facebook"></i></a></li>\n' +
        "                        </ul>"
      );
    },
  };
})();
