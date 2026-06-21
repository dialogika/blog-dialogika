/**
 * BlogGenerator.TakeawaysManager — Dynamic Key Takeaways
 * ========================================================
 */
(function () {
  "use strict";

  var items = [];
  var containerEl, listEl;

  BlogGenerator.TakeawaysManager = {
    /**
     * Initialize the takeaways manager.
     * @param {string} containerId — ID of the wrapper element
     */
    init: function (containerId) {
      containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      listEl = containerEl.querySelector(".takeaways-list");
      var addBtn = containerEl.querySelector(".takeaway-add-btn");

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          BlogGenerator.TakeawaysManager._add();
        });
      }

      /* Start with one empty item */
      BlogGenerator.TakeawaysManager._add();
    },

    _add: function () {
      /* Sync BEFORE pushing to preserve existing typed data */
      BlogGenerator.TakeawaysManager._syncFromDOM();
      items.push("");
      BlogGenerator.TakeawaysManager._renderDOM();
    },

    _remove: function (index) {
      /* Sync BEFORE splicing so we don't lose data */
      BlogGenerator.TakeawaysManager._syncFromDOM();
      items.splice(index, 1);
      BlogGenerator.TakeawaysManager._renderDOM();
    },

    /**
     * Insert a new empty item at a specific position (after Enter key).
     */
    _insertAt: function (index) {
      BlogGenerator.TakeawaysManager._syncFromDOM();
      items.splice(index + 1, 0, "");
      BlogGenerator.TakeawaysManager._renderDOM();
      /* Focus the newly inserted input */
      if (listEl) {
        var inputs = listEl.querySelectorAll(".takeaway-input");
        if (inputs[index + 1]) inputs[index + 1].focus();
      }
    },

    _syncFromDOM: function () {
      if (!listEl) return;
      var inputs = listEl.querySelectorAll(".takeaway-input");
      inputs.forEach(function (inp, i) {
        if (i < items.length) items[i] = inp.value;
      });
    },

    /**
     * Render DOM from items array WITHOUT syncing first.
     */
    _renderDOM: function () {
      if (!listEl) return;
      listEl.innerHTML = "";
      items.forEach(function (text, i) {
        var row = document.createElement("div");
        row.className = "input-group mb-2";
        row.innerHTML =
          '  <span class="input-group-text">' + (i + 1) + "</span>" +
          '  <input type="text" class="form-control takeaway-input" placeholder="Tulis poin takeaway..." value="' +
          BlogGenerator.Utils.escapeHtml(text) +
          '">' +
          '  <button type="button" class="btn btn-outline-danger takeaway-remove-btn">' +
          '    <i class="bi bi-x-lg"></i>' +
          "  </button>";

        row.querySelector(".takeaway-remove-btn").addEventListener("click", function () {
          BlogGenerator.TakeawaysManager._syncFromDOM();
          BlogGenerator.TakeawaysManager._remove(i);
        });

        /* Enter key: insert new takeaway below current one */
        var inp = row.querySelector(".takeaway-input");
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            BlogGenerator.TakeawaysManager._insertAt(i);
          }
        });

        listEl.appendChild(row);
      });
    },

    _render: function () {
      if (!listEl) return;
      BlogGenerator.TakeawaysManager._syncFromDOM();
      BlogGenerator.TakeawaysManager._renderDOM();
    },

    /**
     * Get all takeaways as an array of strings.
     * Filters out empty entries.
     */
    getItems: function () {
      BlogGenerator.TakeawaysManager._syncFromDOM();
      return items.filter(function (t) {
        return t.trim() !== "";
      });
    },

    /**
     * Reset all takeaways.
     */
    reset: function () {
      items = [];
      BlogGenerator.TakeawaysManager._render();
    },
  };
})();
