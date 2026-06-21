/**
 * BlogGenerator.SourcesManager — External Sources / Outbound Links
 * ====================================================================
 * Manages a list of external source links (URL + title + thumbnail)
 * that appear in the generated blog post as a "Sources" section.
 */
(function () {
  "use strict";

  var sources = [];
  var containerEl, listEl;

  BlogGenerator.SourcesManager = {
    /**
     * Initialize the sources manager.
     * @param {string} containerId — ID of the wrapper element
     */
    init: function (containerId) {
      containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      listEl = containerEl.querySelector(".sources-list");
      var addBtn = containerEl.querySelector(".source-add-btn");

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          BlogGenerator.SourcesManager._add();
        });
      }
    },

    _add: function () {
      /* Sync BEFORE pushing to preserve existing typed data */
      BlogGenerator.SourcesManager._syncFromDOM();
      sources.push({ url: "", title: "", thumbnail: "" });
      BlogGenerator.SourcesManager._renderDOM();
    },

    _remove: function (index) {
      /* Sync BEFORE splicing so we don't lose data */
      BlogGenerator.SourcesManager._syncFromDOM();
      sources.splice(index, 1);
      BlogGenerator.SourcesManager._renderDOM();
    },

    _syncFromDOM: function () {
      if (!listEl) return;
      var cards = listEl.querySelectorAll(".source-item-card");
      cards.forEach(function (card, i) {
        if (i >= sources.length) return;
        var u = card.querySelector(".source-url-input");
        var t = card.querySelector(".source-title-input");
        var th = card.querySelector(".source-thumb-input");
        if (u) sources[i].url = u.value;
        if (t) sources[i].title = t.value;
        if (th) sources[i].thumbnail = th.value;
      });
    },

    /**
     * Render DOM cards from the sources array WITHOUT syncing first.
     */
    _renderDOM: function () {
      if (!listEl) return;
      listEl.innerHTML = "";
      sources.forEach(function (src, i) {
        var card = document.createElement("div");
        card.className = "card mb-2 source-item-card";
        card.innerHTML =
          '<div class="card-body p-2">' +
          '  <div class="d-flex justify-content-between mb-1">' +
          '    <strong style="font-size:12px">Source #' + (i + 1) + "</strong>" +
          '    <button type="button" class="btn btn-sm btn-outline-danger source-remove-btn" style="padding:1px 6px;font-size:11px">' +
          '      <i class="bi bi-x"></i>' +
          "    </button>" +
          "  </div>" +
          '  <input type="url" class="form-control form-control-sm source-url-input mb-1" placeholder="https://..." value="' +
          BlogGenerator.Utils.escapeHtml(src.url) + '">' +
          '  <input type="text" class="form-control form-control-sm source-title-input mb-1" placeholder="Title / Judul sumber" value="' +
          BlogGenerator.Utils.escapeHtml(src.title) + '">' +
          '  <input type="url" class="form-control form-control-sm source-thumb-input" placeholder="Thumbnail URL (opsional)" value="' +
          BlogGenerator.Utils.escapeHtml(src.thumbnail) + '">' +
          "</div>";

        card.querySelector(".source-remove-btn").addEventListener("click", function () {
          BlogGenerator.SourcesManager._syncFromDOM();
          BlogGenerator.SourcesManager._remove(i);
        });

        listEl.appendChild(card);
      });
    },

    _render: function () {
      if (!listEl) return;
      BlogGenerator.SourcesManager._syncFromDOM();
      BlogGenerator.SourcesManager._renderDOM();
    },

    /**
     * Get all sources as array of {url, title, thumbnail}.
     * Filters out entries without a URL.
     */
    getSources: function () {
      BlogGenerator.SourcesManager._syncFromDOM();
      return sources.filter(function (s) {
        return s.url.trim() !== "";
      });
    },

    /**
     * Reset all sources.
     */
    reset: function () {
      sources = [];
      BlogGenerator.SourcesManager._render();
    },
  };
})();
