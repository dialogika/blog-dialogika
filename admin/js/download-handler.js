/**
 * BlogGenerator.Download — File Download Handler
 * =================================================
 * Creates a Blob from generated HTML and triggers a browser download.
 */
(function () {
  "use strict";

  BlogGenerator.Download = {
    /**
     * Create a Blob from HTML string.
     * @param {string} html
     * @returns {Blob}
     */
    createBlob: function (html) {
      return new Blob([html], { type: "text/html;charset=utf-8" });
    },

    /**
     * Trigger file download in the browser.
     * @param {string} filename — e.g. "cara-membuat-standup.html"
     * @param {Blob} blob
     */
    trigger: function (filename, blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      /* Cleanup */
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },

    /**
     * Convenience method: generate and download in one call.
     * @param {string} html
     * @param {string} slug
     */
    generateAndDownload: function (html, slug) {
      var blob = BlogGenerator.Download.createBlob(html);
      var filename = slug + ".html";
      BlogGenerator.Download.trigger(filename, blob);
    },
  };
})();
