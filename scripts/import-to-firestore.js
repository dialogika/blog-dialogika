/**
 * Import artikel statis (folder blog/ + assets/data/articles.json) ke Firestore.
 * =============================================================================
 * Pemakaian:
 *   1. npm install
 *   2. Taruh service account Firebase di scripts/serviceAccountKey.json
 *      (Firebase Console → Project Settings → Service accounts → Generate new private key)
 *      atau set env GOOGLE_APPLICATION_CREDENTIALS ke path file tersebut.
 *   3. npm run import:articles:dry   ← cek dulu tanpa menulis
 *   4. npm run import:articles
 *
 * Opsi:
 *   --dry-run     hanya menampilkan apa yang akan ditulis
 *   --limit=N     batasi jumlah artikel (untuk uji coba)
 *   --only=slug   import satu artikel saja
 *
 * Dokumen ditulis ke koleksi `articles` dengan ID = slug.
 * Isi field `html` adalah seluruh halaman HTML artikel, sehingga bisa
 * ditampilkan langsung oleh blog/article.html?slug=...
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const ARTICLES_JSON = path.join(ROOT, "assets", "data", "articles.json");
const SERVICE_ACCOUNT = path.join(__dirname, "serviceAccountKey.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = (() => {
  const arg = args.find((a) => a.startsWith("--limit="));
  return arg ? parseInt(arg.split("=")[1], 10) : 0;
})();
const ONLY = (() => {
  const arg = args.find((a) => a.startsWith("--only="));
  return arg ? arg.split("=")[1] : "";
})();

function initFirebase() {
  const admin = require("firebase-admin");
  if (admin.apps.length) return admin.app();

  const credentialPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    (fs.existsSync(SERVICE_ACCOUNT) ? SERVICE_ACCOUNT : "");

  if (credentialPath) {
    const serviceAccount = require(path.resolve(credentialPath));
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || "dialogika-co",
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || "dialogika-co",
  });
}

function readArticleIndex() {
  if (!fs.existsSync(ARTICLES_JSON)) return {};
  const list = JSON.parse(fs.readFileSync(ARTICLES_JSON, "utf-8"));
  const map = {};
  list.forEach((item) => {
    if (item && item.slug) map[item.slug] = item;
  });
  return map;
}

function extractMeta(html) {
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const description = (
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
    []
  )[1] || "";
  const keywords = (
    html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)["']/i) || []
  )[1] || "";
  const image = (html.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1] || "";
  return { title, description, keywords, image };
}

function buildArticles() {
  const index = readArticleIndex();
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".html"))
    .filter((file) => !["index.html", "article.html"].includes(file));

  const articles = [];
  for (const file of files) {
    const slug = file.replace(/\.html$/i, "");
    if (ONLY && slug !== ONLY) continue;

    const filePath = path.join(BLOG_DIR, file);
    const html = fs.readFileSync(filePath, "utf-8");
    const meta = extractMeta(html);
    const entry = index[slug] || {};

    const bytes = Buffer.byteLength(html, "utf-8");
    articles.push({
      slug,
      title: entry.title || meta.title || slug,
      date: entry.date || "",
      keywords: entry.keywords || meta.keywords || "",
      excerpt: entry.excerpt || meta.description || "",
      image: entry.image || meta.image || "",
      category: entry.category || "Communication",
      author: "Dialogika",
      authorId: "",
      status: "published",
      html,
      _bytes: bytes,
    });

    if (LIMIT && articles.length >= LIMIT) break;
  }
  return articles;
}

async function main() {
  console.log("=== Import artikel ke Firestore ===");

  const articles = buildArticles();
  const totalBytes = articles.reduce((sum, a) => sum + a._bytes, 0);
  console.log(`Artikel ditemukan : ${articles.length}`);
  console.log(`Total ukuran HTML : ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  if (DRY_RUN) console.log("Mode              : DRY RUN (tidak menulis)");

  const tooBig = articles.filter((a) => a._bytes > 900 * 1024);
  tooBig.forEach((a) => {
    console.warn(
      `⚠ ${a.slug}: ${(a._bytes / 1024).toFixed(0)} KB — mendekati batas 1 MB Firestore.`
    );
  });

  if (DRY_RUN) {
    articles.forEach((a) => console.log(`  • ${a.slug} (${a.category})`));
    console.log("Selesai (dry run).");
    return;
  }

  const admin = require("firebase-admin");
  const app = initFirebase();
  const db = admin.firestore(app);
  const FieldValue = admin.firestore.FieldValue;
  const batchSize = 400;
  let written = 0;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = db.batch();
    const chunk = articles.slice(i, i + batchSize);
    chunk.forEach((article) => {
      const ref = db.collection("articles").doc(article.slug);
      const { _bytes, ...payload } = article;
      batch.set(
        ref,
        {
          ...payload,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
    written += chunk.length;
    console.log(`  → ${written}/${articles.length} artikel ditulis`);
  }

  // Penulis default supaya dropdown di admin tidak kosong.
  await db
    .collection("authors")
    .doc("dialogika")
    .set(
      {
        name: "Dialogika",
        email: "",
        role: "Tim Dialogika",
        bio: "Tim konten Dialogika.",
        photoURL: "",
        active: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  console.log(`\nSelesai: ${written} artikel + 1 penulis default.`);
  console.log("Buka Firebase Console → Firestore → koleksi `articles` untuk memeriksa.");
}

main().catch((error) => {
  console.error("\nGagal import:", error.message);
  if (/credential|default credentials/i.test(error.message)) {
    console.error(
      "Pastikan scripts/serviceAccountKey.json ada, atau set GOOGLE_APPLICATION_CREDENTIALS."
    );
  }
  process.exit(1);
});
