#!/usr/bin/env node
/**
 * rollback-tampilan-baru.js — Fallback ke tampilan artikel LAMA
 * ---------------------------------------------------------------------------
 * Mengembalikan file yang diubah oleh redesign tampilan artikel (Tailwind)
 * ke versi sebelum redesign, memakai riwayat git:
 *
 *   - blog/*.html                        -> versi lama (Bootstrap)
 *   - admin/template/blog-template.html  -> template lama
 *   - admin/js/content-renderer.js       -> renderer FAQ/Sources lama
 *   - file baru redesign (article-new.css, article-new.js,
 *     tailwind-config.js, apply-new-template.js) -> dihapus
 *
 * Aman: TIDAK mengubah riwayat git (tanpa reset / force push). Hasilnya
 * berupa perubahan biasa di working tree yang bisa dicek lalu di-commit.
 * Halaman utama (index.html), articles.json, dan file lain tidak disentuh.
 *
 * Pemakaian (dari root repo):
 *   node scripts/rollback-tampilan-baru.js --dry-run       -> lihat dulu apa yang berubah
 *   node scripts/rollback-tampilan-baru.js                 -> jalankan fallback penuh
 *   node scripts/rollback-tampilan-baru.js --articles-only -> hanya artikel di /blog,
 *                                                            template admin tetap baru
 *   node scripts/rollback-tampilan-baru.js --ref <commit>  -> kembali ke commit tertentu
 *   node scripts/rollback-tampilan-baru.js --force         -> timpa walau ada perubahan
 *                                                            yang belum di-commit
 *
 * Membatalkan fallback (kembali ke tampilan baru) sebelum di-commit:
 *   git checkout HEAD -- blog admin assets scripts
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const ARTICLES_ONLY = args.includes("--articles-only");
const refIdx = args.indexOf("--ref");
const REF_ARG = refIdx >= 0 ? args[refIdx + 1] : "";

// Commit pertama redesign; versi "lama" = commit sebelum ini.
const FIRST_REDESIGN_MESSAGE = "feat(blog): redesign artikel tempo bicara sesuai UI baru";

// File/folder yang disentuh redesign.
const SCOPE = ARTICLES_ONLY
  ? ["blog"]
  : [
      "blog",
      "admin/template/blog-template.html",
      "admin/js/content-renderer.js",
      "assets/css/article-new.css",
      "assets/js/article-new.js",
      "assets/js/tailwind-config.js",
      "scripts/apply-new-template.js",
    ];

function git(argv, opts = {}) {
  return execFileSync("git", argv, { cwd: ROOT, encoding: opts.encoding === null ? null : "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
}
function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

/* 1. Pastikan ini repo git */
try {
  git(["rev-parse", "--is-inside-work-tree"]);
} catch (e) {
  fail("Folder ini bukan repo git. Jalankan dari dalam repo blog-dialogika.");
}

/* 2. Tentukan commit versi lama */
let baseRef = REF_ARG;
if (!baseRef) {
  const found = git(["log", "--format=%H", "--fixed-strings", "--grep", FIRST_REDESIGN_MESSAGE, "HEAD"]).trim().split("\n").filter(Boolean);
  if (!found.length) {
    fail('Commit redesign tidak ditemukan di riwayat branch ini.\n  Tentukan manual, contoh: node scripts/rollback-tampilan-baru.js --ref 7c6dade');
  }
  baseRef = found[found.length - 1] + "^"; // parent dari commit redesign paling awal
}
let baseHash;
try {
  baseHash = git(["rev-parse", "--verify", baseRef + "^{commit}"]).trim();
} catch (e) {
  fail("Commit tidak valid: " + baseRef);
}
const baseInfo = git(["log", "-1", "--format=%h %s (%ad)", "--date=short", baseHash]).trim();
console.log("Versi lama diambil dari commit: " + baseInfo + "\n");

/* 4. Daftar file yang berbeda antara versi lama dan sekarang (termasuk yang belum di-commit) */
const changed = git(["diff", "--name-status", "--no-renames", baseHash, "--", ...SCOPE]).trim().split("\n").filter(Boolean);
const untracked = git(["ls-files", "--others", "--exclude-standard", "--", ...SCOPE]).trim().split("\n").filter(Boolean);

const actions = [];
changed.forEach((line) => {
  const [status, file] = line.split("\t");
  if (status === "A") actions.push({ type: "delete", file }); // file baru hasil redesign
  else actions.push({ type: "restore", file }); // M (diubah) atau D (terhapus) -> kembalikan
});
untracked.forEach((file) => {
  const existsInBase = (() => {
    try { git(["cat-file", "-e", baseHash + ":" + file]); return true; } catch (e) { return false; }
  })();
  if (!actions.some((a) => a.file === file)) actions.push({ type: existsInBase ? "restore" : "delete", file });
});

if (!actions.length) {
  console.log("Tidak ada yang perlu dikembalikan — file sudah sama dengan versi lama.");
  process.exit(0);
}

/* 4b. Cek perubahan yang belum di-commit di area yang akan ditimpa */
const dirty = git(["status", "--porcelain", "--", ...SCOPE]).trim();
if (dirty && !FORCE && !DRY_RUN) {
  console.log(dirty + "\n");
  fail("Ada perubahan yang belum di-commit di file di atas. Commit/stash dulu, atau pakai --force untuk menimpa.");
}

/* 5. Jalankan */
let restored = 0, deleted = 0;
actions.sort((a, b) => a.file.localeCompare(b.file)).forEach(({ type, file }) => {
  const full = path.join(ROOT, file);
  if (type === "restore") {
    if (!DRY_RUN) {
      const content = git(["show", baseHash + ":" + file], { encoding: null });
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content);
    }
    console.log((DRY_RUN ? "○ akan kembalikan " : "✓ dikembalikan    ") + file);
    restored++;
  } else {
    if (!DRY_RUN && fs.existsSync(full)) fs.unlinkSync(full);
    console.log((DRY_RUN ? "○ akan hapus      " : "✓ dihapus         ") + file);
    deleted++;
  }
});

console.log(
  `\n${DRY_RUN ? "Dry-run" : "Selesai"}: ${restored} file ${DRY_RUN ? "akan " : ""}dikembalikan, ${deleted} file ${DRY_RUN ? "akan " : ""}dihapus.`
);
if (!DRY_RUN) {
  console.log("\nLangkah berikutnya:");
  console.log("  1. Cek di browser (mis. scripts\\preview-lokal.ps1) dan git status --short");
  console.log('  2. git add -A blog admin assets scripts && git commit -m "revert: kembali ke tampilan artikel lama"');
  console.log("  3. git push origin <nama-branch>");
  console.log("\nBatal sebelum commit: git checkout HEAD -- blog admin assets scripts  (lalu hapus file untracked bila ada)");
}
