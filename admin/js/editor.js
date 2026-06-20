/**
 * BlogGenerator.Editor — Rich Text Editor (contenteditable)
 * ==========================================================
 * Custom WYSIWYG editor with toolbar for blog article composition.
 * Supports headings, bold, italic, underline, lists, blockquote,
 * highlight, badge, image, internal link, external link.
 */
(function () {
  "use strict";

  var editorEl, toolbarEl;
  var savedSelection = null;

  BlogGenerator.Editor = {
    /**
     * Initialize the editor.
     * @param {string} editorId — ID of the contenteditable div
     * @param {string} toolbarId — ID of the toolbar container
     */
    init: function (editorId, toolbarId) {
      editorEl = document.getElementById(editorId);
      toolbarEl = document.getElementById(toolbarId);
      if (!editorEl || !toolbarEl) return;

      BlogGenerator.Editor._buildToolbar();
      BlogGenerator.Editor._bindEvents();
    },

    /**
     * Build the toolbar buttons.
     */
    _buildToolbar: function () {
      var badges = BlogGenerator.Config.badges;

      toolbarEl.innerHTML =
        '<div class="editor-toolbar-group">' +
        '  <button type="button" class="editor-btn" data-cmd="formatBlock" data-value="h2" title="Heading 2"><b>H2</b></button>' +
        '  <button type="button" class="editor-btn" data-cmd="formatBlock" data-value="h3" title="Heading 3"><b>H3</b></button>' +
        '  <button type="button" class="editor-btn" data-cmd="formatBlock" data-value="h4" title="Heading 4"><b>H4</b></button>' +
        '  <button type="button" class="editor-btn" data-cmd="formatBlock" data-value="p" title="Paragraph">P</button>' +
        "</div>" +
        '<div class="editor-toolbar-group">' +
        '  <button type="button" class="editor-btn" data-cmd="bold" title="Bold"><i class="bi bi-type-bold"></i></button>' +
        '  <button type="button" class="editor-btn" data-cmd="italic" title="Italic"><i class="bi bi-type-italic"></i></button>' +
        '  <button type="button" class="editor-btn" data-cmd="underline" title="Underline"><i class="bi bi-type-underline"></i></button>' +
        "</div>" +
        '<div class="editor-toolbar-group">' +
        '  <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="Bullet List"><i class="bi bi-list-ul"></i></button>' +
        '  <button type="button" class="editor-btn" data-cmd="insertOrderedList" title="Numbered List"><i class="bi bi-list-ol"></i></button>' +
        '  <button type="button" class="editor-btn" data-cmd="formatBlock" data-value="blockquote" title="Blockquote"><i class="bi bi-quote"></i></button>' +
        "</div>" +
        '<div class="editor-toolbar-group">' +
        '  <button type="button" class="editor-btn" data-action="highlight" title="Highlight"><i class="bi bi-highlighter"></i></button>' +
        '  <button type="button" class="editor-btn" data-action="badge" title="Badge"><i class="bi bi-bookmark-star"></i> Badge</button>' +
        "</div>" +
        '<div class="editor-toolbar-group">' +
        '  <button type="button" class="editor-btn" data-action="image" title="Image"><i class="bi bi-image"></i></button>' +
        '  <button type="button" class="editor-btn" data-action="internalLink" title="Internal Link"><i class="bi bi-link-45deg"></i> Internal</button>' +
        '  <button type="button" class="editor-btn" data-action="externalLink" title="External Link"><i class="bi bi-box-arrow-up-right"></i> External</button>' +
        "</div>";
    },

    /**
     * Bind toolbar and editor events.
     */
    _bindEvents: function () {
      /* Save selection on mouseup / keyup in editor */
      editorEl.addEventListener("mouseup", function () {
        BlogGenerator.Editor._saveSelection();
      });
      editorEl.addEventListener("keyup", function () {
        BlogGenerator.Editor._saveSelection();
      });

      /* Toolbar button clicks */
      toolbarEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".editor-btn");
        if (!btn) return;
        e.preventDefault();

        var cmd = btn.getAttribute("data-cmd");
        var action = btn.getAttribute("data-action");
        var value = btn.getAttribute("data-value");

        if (cmd) {
          BlogGenerator.Editor._execCommand(cmd, value);
        } else if (action) {
          BlogGenerator.Editor._handleAction(action);
        }
      });
    },

    /**
     * Execute a native execCommand.
     */
    _execCommand: function (cmd, value) {
      editorEl.focus();
      BlogGenerator.Editor._restoreSelection();

      if (cmd === "formatBlock") {
        document.execCommand("formatBlock", false, "<" + value + ">");
      } else {
        document.execCommand(cmd, false, null);
      }

      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Handle custom actions (highlight, badge, image, links).
     */
    _handleAction: function (action) {
      switch (action) {
        case "highlight":
          BlogGenerator.Editor._wrapSelection("span", "highlight");
          break;
        case "badge":
          BlogGenerator.Editor._insertBadge();
          break;
        case "image":
          BlogGenerator.Editor._showImageModal();
          break;
        case "internalLink":
          BlogGenerator.Editor._showLinkModal("internal");
          break;
        case "externalLink":
          BlogGenerator.Editor._showLinkModal("external");
          break;
      }
    },

    /**
     * Wrap current selection in a span with given class.
     */
    _wrapSelection: function (tag, className) {
      editorEl.focus();
      BlogGenerator.Editor._restoreSelection();

      var selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        alert("Pilih teks terlebih dahulu untuk menerapkan " + className + ".");
        return;
      }

      var range = selection.getRangeAt(0);
      var wrapper = document.createElement(tag);
      wrapper.className = className;

      try {
        range.surroundContents(wrapper);
      } catch (e) {
        /* If selection crosses element boundaries, extract and wrap */
        var fragment = range.extractContents();
        wrapper.appendChild(fragment);
        range.insertNode(wrapper);
      }

      selection.removeAllRanges();
      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Insert a badge at cursor or prompt user.
     */
    _insertBadge: function () {
      var badges = BlogGenerator.Config.badges;
      var choice = prompt(
        "Pilih badge:\n" +
        badges.map(function (b, i) { return (i + 1) + ". " + b; }).join("\n") +
        "\n\nKetik nomor:"
      );

      if (!choice) return;
      var index = parseInt(choice, 10) - 1;
      if (isNaN(index) || index < 0 || index >= badges.length) return;

      editorEl.focus();
      BlogGenerator.Editor._restoreSelection();

      var badge = '<span class="badge-disruptor">' + badges[index] + "</span> ";
      document.execCommand("insertHTML", false, badge);
      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Show image insert modal.
     */
    _showImageModal: function () {
      var url = prompt("Masukkan URL gambar:");
      if (!url) return;
      var alt = prompt("Masukkan alt text gambar:", "") || "";

      editorEl.focus();
      BlogGenerator.Editor._restoreSelection();

      var html =
        '<div class="h2-image-container">' +
        '  <img class="h2-section-img" src="' + BlogGenerator.Utils.escapeHtml(url) +
        '" alt="' + BlogGenerator.Utils.escapeHtml(alt) + '" loading="lazy" />' +
        "</div><p><br></p>";

      document.execCommand("insertHTML", false, html);
      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Show link modal (internal or external).
     */
    _showLinkModal: function (type) {
      BlogGenerator.Editor._saveSelection();

      var selection = window.getSelection();
      var selectedText = selection.toString() || "";

      var url, text;
      if (type === "internal") {
        url = prompt("Masukkan URL internal (contoh: /blog/slug-artikel):");
        if (!url) return;
        text = prompt("Teks link:", selectedText) || selectedText;

        editorEl.focus();
        BlogGenerator.Editor._restoreSelection();

        var html = '<a href="' + BlogGenerator.Utils.escapeHtml(url) + '">' +
          BlogGenerator.Utils.escapeHtml(text) + "</a>";
        document.execCommand("insertHTML", false, html);
      } else {
        url = prompt("Masukkan URL external (https://...):");
        if (!url) return;
        text = prompt("Teks link:", selectedText) || selectedText;

        editorEl.focus();
        BlogGenerator.Editor._restoreSelection();

        var html2 = '<a href="' + BlogGenerator.Utils.escapeHtml(url) +
          '" target="_blank" rel="noopener noreferrer">' +
          BlogGenerator.Utils.escapeHtml(text) + "</a>";
        document.execCommand("insertHTML", false, html2);
      }

      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Save current selection for later restoration.
     */
    _saveSelection: function () {
      var sel = window.getSelection();
      if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0);
      }
    },

    /**
     * Restore previously saved selection.
     */
    _restoreSelection: function () {
      if (savedSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
      }
    },

    /**
     * Get the editor HTML content.
     */
    getContent: function () {
      return editorEl ? editorEl.innerHTML : "";
    },

    /**
     * Set editor HTML content.
     */
    setContent: function (html) {
      if (editorEl) editorEl.innerHTML = html;
    },

    /**
     * Clear the editor.
     */
    clear: function () {
      if (editorEl) editorEl.innerHTML = "<p><br></p>";
    },
  };
})();
