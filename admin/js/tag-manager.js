/**
 * BlogGenerator.TagManager — Dynamic Tag Input
 * =================================================
 */
(function () {
  "use strict";

  var tags = [];
  var containerEl, inputEl, listEl;

  BlogGenerator.TagManager = {
    /**
     * Initialize the tag manager.
     * @param {string} containerId — ID of the wrapper element
     */
    init: function (containerId) {
      containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      inputEl = containerEl.querySelector(".tag-input");
      listEl = containerEl.querySelector(".tag-list");
      var addBtn = containerEl.querySelector(".tag-add-btn");

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          BlogGenerator.TagManager._addFromInput();
        });
      }

      if (inputEl) {
        inputEl.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            BlogGenerator.TagManager._addFromInput();
          }
        });
      }
    },

    _addFromInput: function () {
      var val = inputEl.value.trim();
      if (val && tags.indexOf(val) === -1) {
        tags.push(val);
        BlogGenerator.TagManager._render();
      }
      inputEl.value = "";
      inputEl.focus();
    },

    _remove: function (index) {
      tags.splice(index, 1);
      BlogGenerator.TagManager._render();
    },

    _render: function () {
      if (!listEl) return;
      listEl.innerHTML = "";
      tags.forEach(function (tag, i) {
        var badge = document.createElement("span");
        badge.className = "badge bg-primary me-2 mb-2 d-inline-flex align-items-center";
        badge.style.fontSize = "14px";
        badge.style.padding = "6px 12px";
        badge.innerHTML =
          BlogGenerator.Utils.escapeHtml(tag) +
          ' <button type="button" class="btn-close btn-close-white ms-2" style="font-size:10px" data-tag-index="' +
          i +
          '"></button>';
        badge.querySelector(".btn-close").addEventListener("click", function () {
          BlogGenerator.TagManager._remove(i);
        });
        listEl.appendChild(badge);
      });
    },

    /**
     * Get all tags as an array of strings.
     */
    getTags: function () {
      return tags.slice();
    },

    /**
     * Reset all tags.
     */
    reset: function () {
      tags = [];
      BlogGenerator.TagManager._render();
    },
  };
})();
