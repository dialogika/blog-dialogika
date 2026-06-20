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
     * @param {string[]} tags
     * @returns {string} — HTML string
     */
    renderTags: function (tags) {
      if (!tags || tags.length === 0) return "";
      return tags
        .map(function (tag) {
          return '<a href="#" class="tags-color">' + BlogGenerator.Utils.escapeHtml(tag) + "</a>";
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

      var html = '<div class="faq-section">\n';
      html += '                      <div class="faq-title">\n';
      html += "                        Pertanyaan yang Sering Diajukan\n";
      html += "                      </div>\n\n";

      faqs.forEach(function (faq) {
        html += '                      <div class="faq-item">\n';
        html += '                        <button class="faq-question" onclick="toggleFaq(this)">\n';
        html += "                          <span>" + BlogGenerator.Utils.escapeHtml(faq.question) + "</span>\n";
        html += '                          <span class="faq-icon">+</span>\n';
        html += "                        </button>\n";
        html += '                        <div class="faq-answer">\n';
        html += "                          <p>\n";
        html += "                            " + BlogGenerator.Utils.escapeHtml(faq.answer) + "\n";
        html += "                          </p>\n";
        html += "                        </div>\n";
        html += "                      </div>\n\n";
      });

      html += "                    </div>";
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
        '                          <li><a href="' + s.twitter + '" target="_blank" rel="noopener noreferrer"><i class="icofont-twitter"></i></a></li>\n' +
        '                          <li><a href="' + s.facebook + '" target="_blank" rel="noopener noreferrer"><i class="icofont-facebook"></i></a></li>\n' +
        '                          <li><a href="' + s.instagram + '" target="_blank" rel="noopener noreferrer"><i class="icofont-instagram"></i></a></li>\n' +
        '                          <li><a href="' + s.linkedin + '" target="_blank" rel="noopener noreferrer"><i class="icofont-linkedin"></i></a></li>\n' +
        "                        </ul>"
      );
    },
  };
})();
