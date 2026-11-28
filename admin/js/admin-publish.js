/**
 * Dialogika Admin — Login + Publish ke Firebase
 * =============================================
 * Menambahkan alur "langsung upload" di atas generator HTML yang sudah ada:
 *   1. Login pakai akun Firebase Authentication (email/password).
 *   2. Pilih penulis dari koleksi `authors` di Firestore.
 *   3. Upload thumbnail ke Firebase Storage (opsional, bisa pakai URL).
 *   4. Klik "Publish ke Firebase" → artikel tersimpan di koleksi `articles`.
 *
 * Kalau Firebase belum dikonfigurasi, tombol publish dimatikan dan admin
 * tetap bisa memakai alur lama (Generate + Download HTML).
 */
(function () {
  "use strict";

  var configured = window.BlogDB && window.BlogDB.isConfigured();
  var currentUser = null;
  var generated = null;

  function $(id) {
    return document.getElementById(id);
  }

  function rawValue(id) {
    var el = $(id);
    return el ? String(el.value || "").trim() : "";
  }

  function showStatus(type, message, extraHtml) {
    var box = $("status-alert");
    if (!box) return;
    box.className = "alert alert-" + type + " mt-0 mb-0 flex-grow-1";
    box.innerHTML = message + (extraHtml || "");
    box.style.display = "block";
  }

  function setAuthUi(user) {
    currentUser = user || null;
    var label = $("auth-user");
    var loginBtn = $("btn-login");
    var logoutBtn = $("btn-logout");
    var publishBtn = $("btn-publish");

    if (label) label.textContent = user ? user.email : "";

    if (loginBtn) loginBtn.classList.toggle("d-none", Boolean(user));
    if (logoutBtn) logoutBtn.classList.toggle("d-none", !user);

    if (publishBtn) {
      var canPublish = configured && Boolean(user) && Boolean(generated);
      publishBtn.disabled = !canPublish;
      publishBtn.title = !configured
        ? "Firebase belum dikonfigurasi"
        : !user
          ? "Login dulu untuk publish"
          : !generated
            ? "Generate HTML dulu"
            : "Simpan artikel ke Firestore";
    }
  }

  function loadAuthorsIntoSelect() {
    var select = $("field-author");
    if (!select || !currentUser) return;

    window.BlogDB.loadAuthors()
      .then(function (authors) {
        var previous = select.value;
        var email = (currentUser && currentUser.email || "").toLowerCase();
        var ownAuthor = authors.filter(function (a) {
          return a.email && a.email.toLowerCase() === email;
        })[0];

        select.innerHTML = '<option value="Dialogika" data-id="">Dialogika</option>';
        authors
          .filter(function (a) { return a.active; })
          .forEach(function (author) {
            var opt = document.createElement("option");
            opt.value = author.name;
            opt.textContent = author.name + (author.role ? " — " + author.role : "");
            opt.setAttribute("data-id", author.id);
            select.appendChild(opt);
          });
        if (previous && previous !== "Dialogika") {
          var match = Array.prototype.slice
            .call(select.options)
            .filter(function (o) { return o.value === previous; })[0];
          if (match) select.value = previous;
        } else if (ownAuthor) {
          /* Login pakai email penulis → otomatis pilih namanya. */
          select.value = ownAuthor.name;
        }
      })
      .catch(function () {
        /* Diamkan: dropdown tetap berisi default Dialogika. */
      });
  }

  function bindLogin() {
    var form = $("login-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = rawValue("login-email");
      var password = $("login-password") ? $("login-password").value : "";
      var errorBox = $("login-error");
      var submitBtn = $("login-submit");
      if (errorBox) errorBox.textContent = "";

      if (!email || !password) {
        if (errorBox) errorBox.textContent = "Email dan password wajib diisi.";
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Login...';
      }

      window.BlogDB.signIn(email, password)
        .then(function () {
          var modalEl = $("loginModal");
          if (modalEl && window.bootstrap) {
            var modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
          }
          form.reset();
        })
        .catch(function (error) {
          if (errorBox) {
            errorBox.textContent =
              error && error.code === "auth/invalid-credential"
                ? "Email atau password salah."
                : (error && error.message) || "Login gagal.";
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
              '<i class="bi bi-box-arrow-in-right me-1"></i>Login';
          }
        });
    });

    var logoutBtn = $("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        window.BlogDB.signOut().then(function () {
          showStatus("secondary", "Kamu sudah logout. Generate + Download tetap bisa dipakai.");
        });
      });
    }
  }

  function bindImageUpload() {
    var input = $("field-featured-image-file");
    if (!input) return;

    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      var status = $("image-upload-status");
      if (!file) return;

      if (!configured) {
        if (status) status.innerHTML = '<span class="text-danger">Firebase belum dikonfigurasi.</span>';
        return;
      }
      if (!currentUser) {
        if (status) status.innerHTML = '<span class="text-danger">Login dulu untuk upload gambar.</span>';
        return;
      }

      if (status) {
        status.innerHTML =
          '<span class="text-primary"><span class="spinner-border spinner-border-sm me-1"></span>Mengupload…</span>';
      }

      var slug = (window.BlogGenerator.Utils.slugify(rawValue("field-title")) || "artikel") + "-" + Date.now();
      var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      var path = "articles/images/" + slug + "/" + safeName;

      window.BlogDB.uploadFile(file, path)
        .then(function (url) {
          var urlInput = $("field-featured-image");
          if (urlInput) urlInput.value = url;
          if (status) {
            status.innerHTML = '<span class="text-success">Gambar berhasil diupload.</span>';
          }
        })
        .catch(function (error) {
          if (status) {
            status.innerHTML =
              '<span class="text-danger">Upload gagal: ' +
              ((error && error.message) || "unknown error") +
              "</span>";
          }
        });
    });
  }

  function bindPublish() {
    var publishBtn = $("btn-publish");
    if (!publishBtn) return;

    document.addEventListener("blog:generated", function (event) {
      generated = event.detail && event.detail.data;
      setAuthUi(currentUser);
    });

    publishBtn.addEventListener("click", function () {
      var App = window.BlogGenerator.App;
      var data = App && App.getLastData ? App.getLastData() : null;
      var html = App && App.getGeneratedHtml ? App.getGeneratedHtml() : null;

      if (!data || !html) {
        showStatus("warning", "Klik <strong>Generate HTML</strong> dulu sebelum publish.");
        return;
      }
      if (!configured) {
        showStatus("warning", "Firebase belum dikonfigurasi. Isi <code>assets/js/firebase-config.js</code>.");
        return;
      }
      if (!currentUser) {
        showStatus("warning", "Login dulu untuk publish artikel.");
        var modalEl = $("loginModal");
        if (modalEl && window.bootstrap) new bootstrap.Modal(modalEl).show();
        return;
      }

      var authorSelect = $("field-author");
      var selectedOption =
        authorSelect && authorSelect.options[authorSelect.selectedIndex];
      var status = rawValue("field-status") || "published";

      var category = rawValue("field-category");
      if (!category) {
        showStatus("danger", "Kategori artikel wajib dipilih.");
        return;
      }

      var payload = {
        slug: data.SLUG,
        title: rawValue("field-title"),
        metaDescription: rawValue("field-meta-desc"),
        metaKeywords: rawValue("field-meta-keywords"),
        keywords: rawValue("field-meta-keywords"),
        excerpt: rawValue("field-meta-desc") || data.ARTICLE_CONTENT.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
        date: data.PUBLISHED_DATE_ISO || rawValue("field-date"),
        image: rawValue("field-featured-image"),
        category: category,
        author: authorSelect ? authorSelect.value : "Dialogika",
        authorId: selectedOption ? selectedOption.getAttribute("data-id") || "" : "",
        cheatsheetUrl: rawValue("field-cheatsheet-pdf"),
        status: status,
        html: html,
      };

      publishBtn.disabled = true;
      publishBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';

      window.BlogDB.publishArticle(payload)
        .then(function (slug) {
          var link =
            status === "published"
              ? ' <a href="/blog/' + slug + '.html" target="_blank" class="alert-link">Lihat artikel →</a>'
              : "";
          showStatus(
            "success",
            "<i class='bi bi-check-circle me-2'></i>Artikel <strong>" +
              slug +
              "</strong> tersimpan sebagai <strong>" +
              status +
              "</strong>." +
              link
          );
        })
        .catch(function (error) {
          showStatus(
            "danger",
            "<i class='bi bi-exclamation-triangle me-2'></i>Gagal publish: " +
              ((error && error.message) || "unknown error")
          );
        })
        .finally(function () {
          publishBtn.disabled = !currentUser;
          publishBtn.innerHTML =
            '<i class="bi bi-cloud-arrow-up me-2"></i>Publish ke Firebase';
        });
    });
  }

  function init() {
    setAuthUi(null);

    if (!configured) {
      var publishBtn = $("btn-publish");
      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.title = "Firebase belum dikonfigurasi";
      }
      var loginBtn = $("btn-login");
      if (loginBtn) loginBtn.classList.add("d-none");
      showStatus(
        "warning",
        "<i class='bi bi-info-circle me-2'></i><strong>Mode lokal:</strong> Firebase belum dikonfigurasi. " +
          "Isi <code>assets/js/firebase-config.js</code> untuk mengaktifkan publish langsung. " +
          "Sementara ini gunakan Generate + Download HTML."
      );
      return;
    }

    bindLogin();
    bindImageUpload();
    bindPublish();

    window.BlogDB.onAuth(function (user) {
      setAuthUi(user);
      if (user) {
        loadAuthorsIntoSelect();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
