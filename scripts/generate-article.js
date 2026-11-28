#!/usr/bin/env node
/**
 * generate-article.js — Generator artikel versi CLI
 * ---------------------------------------------------------------------------
 * Membuat artikel baru dengan tampilan TERBARU (admin/template/blog-template.html)
 * dan langsung mendaftarkannya ke assets/data/articles.json, sehingga artikel
 * otomatis muncul di beranda, halaman arsip, halaman kategori & "Artikel Terkait".
 *
 * Memakai modul yang SAMA dengan generator admin (admin/js/*.js), jadi hasilnya
 * identik dengan tombol "Generate HTML" di admin/index.html.
 *
 * Pemakaian (dari root repo):
 *   node scripts/generate-article.js --contoh                 -> buat contoh input
 *   node scripts/generate-article.js artikel-baru.json        -> generate + update JSON
 *   node scripts/generate-article.js artikel-baru.json --dry-run
 *   node scripts/generate-article.js artikel-baru.json --force    (timpa file yang ada)
 *   node scripts/generate-article.js artikel-baru.json --no-json  (tanpa update JSON)
 *
 * Isi file input (lihat hasil --contoh):
 *   title, metaDescription, keywords, category, date (YYYY-MM-DD), author,
 *   featuredImage, ogImage, ogTitle, ogDescription, cheatsheetPdf,
 *   contentHtml ATAU contentFile (path ke file .html berisi isi artikel),
 *   tags[], takeaways[], faqs[{question, answer}], sources[{url, title, thumbnail}]
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ADMIN_JS = path.join(ROOT, "admin", "js");
const TEMPLATE_PATH = path.join(ROOT, "admin", "template", "blog-template.html");
const BLOG_DIR = path.join(ROOT, "blog");
const JSON_PATH = path.join(ROOT, "assets", "data", "articles.json");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const inputArg = args.find((a) => !a.startsWith("--"));

/* ---------- Muat modul generator admin ke Node ---------- */
function loadGenerator() {
  global.window = global;
  ["config.js", "utils.js", "schema-generator.js", "content-renderer.js", "article-builder.js", "template-processor.js"].forEach(
    (file) => {
      const full = path.join(ADMIN_JS, file);
      vm.runInThisContext(fs.readFileSync(full, "utf8"), { filename: full });
    }
  );
  return global.BlogGenerator;
}

function writeExample() {
  const target = path.join(process.cwd(), "artikel-baru.json");
  if (fs.existsSync(target) && !flags.has("--force")) {
    console.error("File sudah ada: " + target + " (pakai --force untuk menimpa)");
    process.exit(1);
  }
  const example = {
    title: "Cara Tetap Tenang Saat Presentasi - Teknik Pernapasan 4-7-8",
    metaDescription:
      "Gugup sebelum presentasi? Pelajari teknik pernapasan 4-7-8 untuk menenangkan diri dan tampil percaya diri di depan audiens.",
    keywords: "presentasi, gugup, teknik pernapasan",
    category: "Public Speaking",
    date: new Date().toISOString().slice(0, 10),
    author: "Dialogika",
    featuredImage: "https://contoh.com/gambar-utama.jpg",
    cheatsheetPdf: "",
    contentHtml:
      "<p>Paragraf pembuka artikel...</p>\n<h2>Apa itu Teknik 4-7-8?</h2>\n<p>Penjelasan...</p>",
    tags: ["Public Speaking", "Presentasi"],
    takeaways: ["Tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik.", "Latih 3 kali sebelum naik panggung."],
    faqs: [{ question: "Berapa lama tekniknya terasa?", answer: "Biasanya dalam 1-2 menit." }],
    sources: [{ url: "https://contoh.com/referensi", title: "Judul referensi" }],
  };
  fs.writeFileSync(target, JSON.stringify(example, null, 2) + "\n");
  console.log("Contoh input dibuat: " + target);
  console.log("Edit isinya, lalu jalankan: node scripts/generate-article.js " + path.relative(process.cwd(), target));
}

function fail(msg) {
  console.error("GAGAL: " + msg);
  process.exit(1);
}

function main() {
  if (flags.has("--contoh")) return writeExample();
  if (!inputArg || flags.has("--help")) {
    console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(2, 24).map((l) => l.replace(/^ \* ?/, "")).join("\n"));
    return;
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(inputPath)) fail("file input tidak ditemukan: " + inputPath);

  let input;
  try {
    input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  } catch (e) {
    fail("file input bukan JSON yang valid: " + e.message);
  }
  if (!input.contentHtml && input.contentFile) {
    const contentPath = path.resolve(path.dirname(inputPath), input.contentFile);
    if (!fs.existsSync(contentPath)) fail("contentFile tidak ditemukan: " + contentPath);
    input.contentHtml = fs.readFileSync(contentPath, "utf8");
  }

  const G = loadGenerator();
  const error = G.ArticleBuilder.validate(input);
  if (error) fail(error);

  const { slug, data, entry } = G.ArticleBuilder.build(input);
  const html = G.TemplateProcessor.process(fs.readFileSync(TEMPLATE_PATH, "utf8"), data);
  const outFile = path.join(BLOG_DIR, slug + ".html");
  const exists = fs.existsSync(outFile);

  if (exists && !flags.has("--force") && !flags.has("--dry-run")) {
    fail("blog/" + slug + ".html sudah ada. Pakai --force untuk menimpa.");
  }

  let index = null;
  if (!flags.has("--no-json")) {
    const current = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
    index = G.ArticleBuilder.upsertIndex(current, entry);
  }

  console.log("Artikel   : " + entry.title);
  console.log("Kategori  : " + entry.category + " | Tanggal: " + entry.date);
  console.log("File HTML : blog/" + slug + ".html" + (exists ? " (ditimpa)" : " (baru)"));
  if (index) {
    console.log(
      "articles.json: entri " + (index.replaced ? "diperbarui" : "ditambahkan") + " (total " + index.list.length + " artikel)"
    );
  }

  if (flags.has("--dry-run")) {
    console.log("\n--dry-run: tidak ada file yang ditulis.");
    return;
  }

  fs.writeFileSync(outFile, html, "utf8");
  if (index) fs.writeFileSync(JSON_PATH, G.ArticleBuilder.stringifyIndex(index.list), "utf8");
  console.log("\nSelesai. Cek hasilnya, lalu commit blog/" + slug + ".html" + (index ? " dan assets/data/articles.json." : "."));
}

main();
