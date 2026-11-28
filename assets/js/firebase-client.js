/**
 * Dialogika — Firebase Client (compat SDK)
 * ========================================
 * Dipakai bersama oleh halaman publik dan admin.
 *
 * - Halaman publik cukup memuat file ini + firebase-config.js.
 *   SDK Firebase akan dimuat otomatis saat pertama kali dibutuhkan.
 * - Admin memuat SDK secara eksplisit di HTML, tapi tetap aman kalau tidak.
 *
 * Semua method mengembalikan Promise. Jika Firebase belum dikonfigurasi,
 * promise ditolak dengan error yang jelas supaya halaman bisa fallback
 * ke assets/data/articles.json.
 */
(function () {
  "use strict";

  var CONFIG = window.DIALOGIKA_FIREBASE_CONFIG || {};
  var SDK_VERSION = "10.12.5";
  var SDK_FILES = [
    "firebase-app-compat.js",
    "firebase-auth-compat.js",
    "firebase-firestore-compat.js",
    "firebase-storage-compat.js",
  ];

  var loadPromise = null;
  var services = {};

  function isConfigured() {
    var key = String(CONFIG.apiKey || "");
    return Boolean(
      CONFIG.projectId &&
        key &&
        key.indexOf("PASTE") === -1 &&
        key.indexOf("YOUR_") === -1
    );
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-fb-sdk="' + src + '"]');
      if (existing) {
        if (existing.getAttribute("data-loaded") === "1") return resolve();
        existing.addEventListener("load", function () { resolve(); });
        existing.addEventListener("error", function () { reject(new Error("Gagal memuat " + src)); });
        return;
      }
      var el = document.createElement("script");
      el.src = src;
      el.async = false;
      el.setAttribute("data-fb-sdk", src);
      el.onload = function () {
        el.setAttribute("data-loaded", "1");
        resolve();
      };
      el.onerror = function () {
        reject(new Error("Gagal memuat " + src));
      };
      document.head.appendChild(el);
    });
  }

  function ready() {
    if (!isConfigured()) {
      return Promise.reject(
        new Error(
          "Firebase belum dikonfigurasi. Isi assets/js/firebase-config.js terlebih dahulu."
        )
      );
    }
    if (loadPromise) return loadPromise;

    var base = "https://www.gstatic.com/firebasejs/" + SDK_VERSION + "/";
    var sdkReady =
      window.firebase &&
      window.firebase.auth &&
      window.firebase.firestore;

    /* Muat berurutan supaya firebase-app tersedia sebelum modul lain. */
    var loading = Promise.resolve();
    if (!sdkReady) {
      SDK_FILES.forEach(function (file) {
        loading = loading.then(function () {
          return loadScript(base + file);
        });
      });
    }

    loadPromise = loading.then(function () {
      if (!window.firebase) throw new Error("SDK Firebase gagal dimuat.");
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(CONFIG);
      }
      services.app = firebase.app();
      services.auth = firebase.auth();
      services.db = firebase.firestore();
      services.storage = firebase.storage();
      return services;
    });

    return loadPromise;
  }

  function toMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (value.seconds) return value.seconds * 1000;
    var d = new Date(value);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  function docToArticle(id, data) {
    data = data || {};
    var slug = data.slug || id;
    return {
      id: id,
      slug: slug,
      title: data.title || "",
      date: data.date || data.publishedAtIso || "",
      keywords: data.keywords || "",
      excerpt: data.excerpt || data.metaDescription || "",
      image: data.image || data.featuredImage || "",
      category: data.category || "",
      author: data.author || "Dialogika",
      authorId: data.authorId || "",
      status: data.status || "published",
      html: data.html || "",
      url: "/blog/" + slug + ".html",
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  }

  function sortByDateDesc(list) {
    return list.sort(function (a, b) {
      var da = new Date(a.date).getTime() || a.updatedAt || 0;
      var db = new Date(b.date).getTime() || b.updatedAt || 0;
      return db - da;
    });
  }

  var BlogDB = {
    isConfigured: isConfigured,
    ready: ready,

    onAuth: function (callback) {
      return ready().then(function (s) {
        return s.auth.onAuthStateChanged(callback);
      });
    },

    signIn: function (email, password) {
      return ready().then(function (s) {
        return s.auth.signInWithEmailAndPassword(email, password);
      });
    },

    signOut: function () {
      return ready().then(function (s) {
        return s.auth.signOut();
      });
    },

    getCurrentUser: function () {
      return services.auth ? services.auth.currentUser : null;
    },

    /** Ambil semua artikel. Default hanya yang published. */
    loadArticles: function (options) {
      options = options || {};
      return ready()
        .then(function (s) {
          var query = s.db.collection("articles");
          if (!options.includeDrafts) {
            query = query.where("status", "==", "published");
          }
          return query.get();
        })
        .then(function (snapshot) {
          var list = [];
          snapshot.forEach(function (doc) {
            var article = docToArticle(doc.id, doc.data());
            if (article.status === "published" || options.includeDrafts) {
              list.push(article);
            }
          });
          return sortByDateDesc(list);
        });
    },

    /** Ambil satu artikel berdasarkan slug (id dokumen = slug). */
    loadArticle: function (slug) {
      if (!slug) return Promise.reject(new Error("Slug artikel kosong."));
      return ready()
        .then(function (s) {
          return s.db.collection("articles").doc(String(slug)).get();
        })
        .then(function (doc) {
          if (!doc.exists) return null;
          return docToArticle(doc.id, doc.data());
        });
    },

    /** Simpan / update artikel. Mengembalikan slug. */
    publishArticle: function (article) {
      if (!article || !article.slug) {
        return Promise.reject(new Error("Artikel harus punya slug."));
      }
      return ready().then(function (s) {
        var payload = {
          slug: article.slug,
          title: article.title || "",
          date: article.date || "",
          keywords: article.keywords || "",
          excerpt: article.excerpt || "",
          image: article.image || "",
          category: article.category || "",
          author: article.author || "Dialogika",
          authorId: article.authorId || "",
          metaDescription: article.metaDescription || "",
          metaKeywords: article.metaKeywords || "",
          cheatsheetUrl: article.cheatsheetUrl || "",
          status: article.status === "draft" ? "draft" : "published",
          html: article.html || "",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        if (!article.createdAt) {
          payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        return s.db
          .collection("articles")
          .doc(article.slug)
          .set(payload, { merge: true })
          .then(function () {
            return article.slug;
          });
      });
    },

    updateArticleStatus: function (slug, status) {
      return ready().then(function (s) {
        return s.db.collection("articles").doc(String(slug)).set(
          {
            status: status === "draft" ? "draft" : "published",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      });
    },

    deleteArticle: function (slug) {
      return ready().then(function (s) {
        return s.db.collection("articles").doc(String(slug)).delete();
      });
    },

    /** Daftar penulis dari koleksi `authors`. */
    loadAuthors: function () {
      return ready()
        .then(function (s) {
          return s.db.collection("authors").get();
        })
        .then(function (snapshot) {
          var list = [];
          snapshot.forEach(function (doc) {
            var data = doc.data() || {};
            list.push({
              id: doc.id,
              name: data.name || "",
              email: data.email || "",
              role: data.role || "Penulis",
              bio: data.bio || "",
              photoURL: data.photoURL || "",
              active: data.active !== false,
            });
          });
          return list.sort(function (a, b) {
            return a.name.localeCompare(b.name);
          });
        });
    },

    saveAuthor: function (author) {
      var name = String((author && author.name) || "").trim();
      if (!name) return Promise.reject(new Error("Nama penulis wajib diisi."));
      var id =
        (author && author.id) ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") ||
        "penulis-" + Date.now();
      return ready().then(function (s) {
        return s.db
          .collection("authors")
          .doc(id)
          .set(
            {
              name: name,
              email: (author.email || "").trim(),
              role: (author.role || "Penulis").trim(),
              bio: (author.bio || "").trim(),
              photoURL: (author.photoURL || "").trim(),
              active: author.active !== false,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          )
          .then(function () {
            return id;
          });
      });
    },

    deleteAuthor: function (id) {
      return ready().then(function (s) {
        return s.db.collection("authors").doc(String(id)).delete();
      });
    },

    /**
     * Upload file ke Firebase Storage lalu kembalikan download URL.
     * path contoh: "articles/images/cara-menulis/123-gambar.jpg"
     */
    uploadFile: function (file, path) {
      if (!file) return Promise.reject(new Error("File kosong."));
      return ready().then(function (s) {
        var ref = s.storage.ref(path || "uploads/" + Date.now() + "-" + file.name);
        return ref.put(file).then(function () {
          return ref.getDownloadURL();
        });
      });
    },
  };

  window.BlogDB = BlogDB;
})();
