/**
 * BlogGenerator.FaqManager — Dynamic FAQ Section
 * =================================================
 */
(function () {
  "use strict";

  var faqs = [];
  var containerEl, listEl;

  BlogGenerator.FaqManager = {
    /**
     * Initialize the FAQ manager.
     * @param {string} containerId — ID of the wrapper element
     */
    init: function (containerId) {
      containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      listEl = containerEl.querySelector(".faq-list");
      var addBtn = containerEl.querySelector(".faq-add-btn");

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          BlogGenerator.FaqManager._add();
        });
      }

      /* Start with one empty FAQ item */
      BlogGenerator.FaqManager._add();
    },

    _add: function () {
      faqs.push({ question: "", answer: "" });
      BlogGenerator.FaqManager._render();
    },

    _remove: function (index) {
      faqs.splice(index, 1);
      BlogGenerator.FaqManager._render();
    },

    _syncFromDOM: function () {
      if (!listEl) return;
      var items = listEl.querySelectorAll(".faq-item-card");
      items.forEach(function (card, i) {
        var q = card.querySelector(".faq-question-input");
        var a = card.querySelector(".faq-answer-input");
        if (q) faqs[i].question = q.value;
        if (a) faqs[i].answer = a.value;
      });
    },

    _render: function () {
      if (!listEl) return;
      /* Sync before re-render to avoid losing typed content */
      BlogGenerator.FaqManager._syncFromDOM();

      listEl.innerHTML = "";
      faqs.forEach(function (faq, i) {
        var card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML =
          '<div class="card-header d-flex justify-content-between align-items-center">' +
          "  <strong>FAQ #" + (i + 1) + "</strong>" +
          '  <button type="button" class="btn btn-sm btn-outline-danger faq-remove-btn">' +
          '    <i class="bi bi-trash"></i> Remove' +
          "  </button>" +
          "</div>" +
          '<div class="card-body">' +
          '  <div class="mb-3">' +
          '    <label class="form-label fw-bold">Question</label>' +
          '    <textarea class="form-control faq-question-input" rows="2" placeholder="Tulis pertanyaan...">' +
          BlogGenerator.Utils.escapeHtml(faq.question) +
          "</textarea>" +
          "  </div>" +
          '  <div class="mb-0">' +
          '    <label class="form-label fw-bold">Answer</label>' +
          '    <textarea class="form-control faq-answer-input" rows="3" placeholder="Tulis jawaban...">' +
          BlogGenerator.Utils.escapeHtml(faq.answer) +
          "</textarea>" +
          "  </div>" +
          "</div>";

        card.querySelector(".faq-remove-btn").addEventListener("click", function () {
          BlogGenerator.FaqManager._syncFromDOM();
          BlogGenerator.FaqManager._remove(i);
        });

        listEl.appendChild(card);
      });
    },

    /**
     * Get all FAQs as array of {question, answer}.
     * Filters out empty entries.
     */
    getFaqs: function () {
      BlogGenerator.FaqManager._syncFromDOM();
      return faqs.filter(function (f) {
        return f.question.trim() !== "" && f.answer.trim() !== "";
      });
    },

    /**
     * Reset all FAQs.
     */
    reset: function () {
      faqs = [];
      BlogGenerator.FaqManager._render();
    },
  };
})();
