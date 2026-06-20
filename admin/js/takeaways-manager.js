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
      items.push("");
      BlogGenerator.TakeawaysManager._render();
    },

    _remove: function (index) {
      items.splice(index, 1);
      BlogGenerator.TakeawaysManager._render();
    },

    _syncFromDOM: function () {
      if (!listEl) return;
      var inputs = listEl.querySelectorAll(".takeaway-input");
      inputs.forEach(function (inp, i) {
        items[i] = inp.value;
      });
    },

    _render: function () {
      if (!listEl) return;
      BlogGenerator.TakeawaysManager._syncFromDOM();

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

        listEl.appendChild(row);
      });
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
