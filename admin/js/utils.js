/**
 * BlogGenerator.Utils — Shared Helper Functions
 * ===============================================
 */
(function () {
  "use strict";

  BlogGenerator.Utils = {
    /**
     * Convert any string to a URL-safe slug.
     * "Cara Membuat Standup Comedy" → "cara-membuat-standup-comedy"
     */
    slugify: function (text) {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    },

    /**
     * Escape special characters for safe embedding inside JSON strings.
     */
    escapeHtml: function (str) {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    /**
     * Escape for JSON string embedding (different from HTML escape).
     */
    escapeJson: function (str) {
      if (!str) return "";
      return str
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    },

    /**
     * Strip all HTML tags and return plain text.
     */
    stripHtml: function (html) {
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    },

    /**
     * Count words in an HTML string.
     */
    wordCount: function (html) {
      var text = this.stripHtml(html).trim();
      if (!text) return 0;
      return text.split(/\s+/).length;
    },

    /**
     * Estimate reading time in minutes (250 wpm).
     */
    readingTime: function (html) {
      var count = this.wordCount(html);
      return Math.max(1, Math.ceil(count / 250));
    },

    /**
     * Format ISO date string to Indonesian display format.
     * "2023-08-15" → "15 Agustus 2023"
     */
    formatDate: function (isoString) {
      if (!isoString) return "";
      var months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
      ];
      var parts = isoString.split("-");
      var day = parseInt(parts[2], 10);
      var month = months[parseInt(parts[1], 10) - 1];
      var year = parts[0];
      return day + " " + month + " " + year;
    },

    /**
     * Convert a date input value (YYYY-MM-DD) to ISO 8601 with timezone.
     */
    toIsoDateTime: function (isoString) {
      if (!isoString) return "";
      return isoString + "T08:00:00+07:00";
    },

    /**
     * Generate a unique ID for dynamic elements.
     */
    uid: function () {
      return "id-" + Math.random().toString(36).substr(2, 9);
    },
  };
})();
