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
  var savedAnchorNode = null;
  var savedAnchorOffset = 0;
  var savedFocusNode = null;
  var savedFocusOffset = 0;

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
        '  <button type="button" class="editor-btn" data-action="blockquote" title="Blockquote"><i class="bi bi-quote"></i></button>' +
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
      /* Save selection continuously via selectionchange */
      document.addEventListener("selectionchange", function () {
        if (editorEl && editorEl.contains(document.activeElement) ||
            (editorEl && window.getSelection().anchorNode &&
             editorEl.contains(window.getSelection().anchorNode))) {
          BlogGenerator.Editor._saveSelection();
        }
      });

      /* Also save on mouseup / keyup for reliability */
      editorEl.addEventListener("mouseup", function () {
        BlogGenerator.Editor._saveSelection();
      });
      editorEl.addEventListener("keyup", function () {
        BlogGenerator.Editor._saveSelection();
      });

      /* Prevent toolbar mousedown from stealing focus/selection */
      toolbarEl.addEventListener("mousedown", function (e) {
        e.preventDefault();
      });

      /* Enter key: strip highlight from newly created paragraph */
      editorEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          var sel = window.getSelection();
          if (!sel.rangeCount) return;
          var node = sel.anchorNode;
          if (node.nodeType !== 1) node = node.parentNode;
          var insideHighlight = node.closest("span.highlight");
          if (insideHighlight) {
            e.preventDefault();
            /* Insert a new plain <p> after the current block and move cursor there */
            document.execCommand("insertParagraph", false, null);
            /* After insert, cursor is in a new node — strip highlight from it */
            var newSel = window.getSelection();
            if (newSel.rangeCount) {
              var cur = newSel.anchorNode;
              if (cur.nodeType !== 1) cur = cur.parentNode;
              var hl = cur.closest("span.highlight");
              if (hl) {
                /* Move content out of highlight into plain context */
                var plainP = document.createElement("p");
                plainP.innerHTML = "<br>";
                hl.parentNode.insertBefore(plainP, hl.nextSibling);
                /* Place cursor in the new plain paragraph */
                var r = document.createRange();
                r.setStart(plainP, 0);
                r.collapse(true);
                newSel.removeAllRanges();
                newSel.addRange(r);
              }
            }
          }
        }
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
          BlogGenerator.Editor._wrapSelection("span", "badge-disruptor");
          break;
        case "blockquote":
          BlogGenerator.Editor._insertBlockquote();
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
     * If the entire selection is already inside ONE wrapper (and only that),
     * unwrap it (toggle off). Otherwise, merge overlapping wrappers into one.
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
      var selector = tag + "." + className;

      /* --- Find all wrapper elements overlapping the selection --- */
      var wrappers = [];
      var ancestorEl = range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentNode;

      /* Check the ancestor itself (TreeWalker only visits descendants) */
      if (ancestorEl.matches && ancestorEl.matches(selector)) {
        wrappers.push(ancestorEl);
      }

      var treeWalker = document.createTreeWalker(
        ancestorEl,
        NodeFilter.SHOW_ELEMENT,
        null
      );
      var node;
      while ((node = treeWalker.nextNode())) {
        if (node.matches && node.matches(selector) && range.intersectsNode(node)) {
          wrappers.push(node);
        }
      }

      /* --- Check: is the ENTIRE selection inside exactly ONE wrapper? --- */
      var startNode = range.startContainer.nodeType === 1
        ? range.startContainer
        : range.startContainer.parentNode;
      var endNode = range.endContainer.nodeType === 1
        ? range.endContainer
        : range.endContainer.parentNode;
      var startWrap = startNode.closest(selector);
      var endWrap = endNode.closest(selector);

      if (wrappers.length === 1 && startWrap === wrappers[0] && endWrap === wrappers[0]) {
        /* Toggle off: unwrap the single wrapper */
        var parent = wrappers[0].parentNode;
        while (wrappers[0].firstChild) {
          parent.insertBefore(wrappers[0].firstChild, wrappers[0]);
        }
        parent.removeChild(wrappers[0]);
        selection.removeAllRanges();
        BlogGenerator.Editor._saveSelection();
        return;
      }

      /* --- Merge: remove all overlapping wrappers, then wrap the whole range --- */
      wrappers.forEach(function (w) {
        var p = w.parentNode;
        while (w.firstChild) {
          p.insertBefore(w.firstChild, w);
        }
        p.removeChild(w);
      });

      /* Re-get the range since DOM changed */
      selection.removeAllRanges();
      selection.addRange(range);

      var wrapper = document.createElement(tag);
      wrapper.className = className;

      try {
        range.surroundContents(wrapper);
      } catch (e) {
        var fragment = range.extractContents();
        wrapper.appendChild(fragment);
        range.insertNode(wrapper);
      }

      selection.removeAllRanges();
      BlogGenerator.Editor._saveSelection();
    },

    /**
     * Insert a styled blockquote with text and author/cite.
     */
    _insertBlockquote: function () {
      var text = prompt("Masukkan teks kutipan:");
      if (!text) return;
      var author = prompt("Masukkan nama penulis / sumber (boleh kosong):") || "";

      editorEl.focus();
      BlogGenerator.Editor._restoreSelection();

      var cite = author
        ? '<cite>— ' + BlogGenerator.Utils.escapeHtml(author) + "</cite>"
        : "";

      var html =
        '<blockquote class="blockquote-box">' +
        '<p class="blockquote-text">“' + BlogGenerator.Utils.escapeHtml(text) + '”</p>' +
        cite +
        "</blockquote><p><br></p>";

      document.execCommand("insertHTML", false, html);
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
     * Preserves anchor/focus to support right-to-left selections.
     */
    _saveSelection: function () {
      var sel = window.getSelection();
      if (sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        /* Only save if selection is inside the editor */
        if (editorEl.contains(range.commonAncestorContainer)) {
          savedSelection = range.cloneRange();
          savedAnchorNode = sel.anchorNode;
          savedAnchorOffset = sel.anchorOffset;
          savedFocusNode = sel.focusNode;
          savedFocusOffset = sel.focusOffset;
        }
      }
    },

    /**
     * Restore previously saved selection.
     * Restores anchor/focus to preserve selection direction (LTR vs RTL).
     */
    _restoreSelection: function () {
      if (savedSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();

        /* Try to restore with correct direction (anchor → focus) */
        if (savedAnchorNode && savedFocusNode &&
            editorEl.contains(savedAnchorNode) &&
            editorEl.contains(savedFocusNode)) {
          try {
            sel.collapse(savedAnchorNode, savedAnchorOffset);
            sel.extend(savedFocusNode, savedFocusOffset);
          } catch (e) {
            /* Fallback: just add the range */
            sel.addRange(savedSelection);
          }
        } else {
          sel.addRange(savedSelection);
        }
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
