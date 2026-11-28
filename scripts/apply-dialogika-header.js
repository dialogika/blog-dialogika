#!/usr/bin/env node
/**
 * apply-dialogika-header.js
 * ---------------------------------------------------------------------------
 * Menyamakan header di SEMUA halaman dengan header di blog/index.html (arsip):
 *
 *   <!--======== header area =========-->
 *   <dialogika-header active="artikel"></dialogika-header>
 *   <script src="../assets/js/dialogika-header.js"></script>
 *   <!--======== End of header area =========-->
 *
 * plus font & assets/css/dialogika-header.css di <head>.
 *
 * Header lama yang dikenali dan diganti:
 *   1. Blok di antara <!--======== header area =========--> dan <!--======== End of header area =========-->
 *   2. <site-header ...></site-header>          (header bersama versi Tailwind)
 *   3. <header class="header ...">...</header>   (header Bootstrap lama)
 *   4. Halaman TANPA header sama sekali -> <dialogika-header> disisipkan tepat sebelum <main>
 * Menu mobile lama ikut dihapus (#mobile-menu-overlay, .mobile-panel, .page-scrim),
 * karena menu mobile sudah ada di dalam <dialogika-header>.
 * Script header lama (site-header.js) dan Tailwind yang KHUSUS untuk header lama
 * (tailwind-config.js data-scope=".dlg") juga dilepas.
 *
 * Isi halaman, SEO, footer (<main-footer>), dan script lain TIDAK diubah.
 * Halaman yang sudah memakai <dialogika-header> dilewati (aman dijalankan berulang).
 * Salinan halaman asli disimpan di .header-backup/<waktu>/ sebelum ditimpa.
 *
 * Di akhir, script melaporkan file lokal (CSS/JS/gambar di assets/) yang dirujuk halaman
 * tetapi tidak ada di repo — penyebab umum tampilan/fitur yang tidak jalan.
 *
 * Pemakaian (dari root repo):
 *   node scripts/apply-dialogika-header.js              -> ubah semua halaman
 *   node scripts/apply-dialogika-header.js --dry-run    -> hanya tampilkan daftar
 *   node scripts/apply-dialogika-header.js index.html blog/nama-artikel.html
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DRY_RUN = process.argv.includes("--dry-run");
const onlyFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const BACKUP_DIR = path.join(ROOT, ".header-backup", new Date().toISOString().replace(/[:.]/g, "-"));

/* Halaman yang diproses */
const CATEGORY_DIRS = ["public-speaking", "communication", "self-development", "mental-health"];
function listPages() {
  const pages = ["index.html"];
  fs.readdirSync(path.join(ROOT, "blog"))
    .filter((f) => f.endsWith(".html") && f !== "data.html")
    .forEach((f) => pages.push("blog/" + f));
  CATEGORY_DIRS.forEach((d) => pages.push(d + "/index.html"));
  pages.push("admin/template/blog-template.html");
  return pages.filter((p) => fs.existsSync(path.join(ROOT, p)));
}

/* Menu yang disorot di header: beranda blog = "home", selainnya = "artikel" */
function activeFor(rel) {
  return rel === "index.html" ? "home" : "artikel";
}

/* ----------------------------- markup baru ----------------------------- */
const FONT_TEXT =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" />';
const FONT_ICON =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names=arrow_forward,article,calendar_month,call,chat,chevron_left,chevron_right,close,event_available,expand_more,groups,handshake,help,home,location_on,mail,menu,menu_book,notifications,person,refresh,search,sort,storefront,wb_sunny&display=block" />';

function headerBlock(prefix, active) {
  return (
    "<!--======== header area =========-->\n" +
    '    <dialogika-header active="' + active + '"></dialogika-header>\n' +
    '    <script src="' + prefix + 'assets/js/dialogika-header.js"></script>\n' +
    "    <!--======== End of header area =========-->"
  );
}

function headAssets(html, prefix) {
  const lines = ["<!-- Header bersama: dialogika-header -->"];
  if (!/fonts\.googleapis\.com\/css2\?family=[^"']*Plus\+Jakarta\+Sans/.test(html)) {
    if (!html.includes("fonts.gstatic.com")) {
      lines.push('<link rel="preconnect" href="https://fonts.googleapis.com" />');
      lines.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />');
    }
    lines.push(FONT_TEXT);
  }
  if (!html.includes("Material+Symbols+Outlined")) lines.push(FONT_ICON);
  if (!html.includes("dialogika-header.css")) lines.push('<link rel="stylesheet" href="' + prefix + 'assets/css/dialogika-header.css" />');
  return lines.length > 1 ? "    " + lines.join("\n    ") + "\n  " : "";
}

/* ------------------------------- helpers ------------------------------- */
/* Akhir elemen <tag ...> yang dimulai di `start`, dengan menghitung tag bersarang. */
function findElementEnd(html, start, tag) {
  const re = new RegExp("<" + tag + "\\b|</" + tag + "\\s*>", "gi");
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] !== "/") depth++;
    else if (--depth === 0) return m.index + m[0].length;
  }
  return -1;
}

/* Hapus elemen pertama yang tag pembukanya cocok dengan `openRe` (beserta indentasi & baris kosong). */
function removeElement(html, openRe, tag) {
  const m = openRe.exec(html);
  if (!m) return { html, removed: false };
  const end = findElementEnd(html, m.index, tag);
  if (end < 0) throw new Error("tag penutup </" + tag + "> tidak ditemukan untuk " + openRe);
  let start = m.index;
  while (start > 0 && /[ \t]/.test(html[start - 1])) start--;
  return { html: html.slice(0, start) + html.slice(end).replace(/^[ \t]*\r?\n/, ""), removed: true };
}

/* Cari letak header lama: [start, end) */
function findHeader(html) {
  const START_CMT = "<!--======== header area =========-->";
  const END_CMT = "<!--======== End of header area =========-->";

  // 3. header Bootstrap lama (class "header" atau "header dialogika-header")
  const oldHeader = /<header class="header(?:\s[^"]*)?"[^>]*>/i.exec(html);
  // 2. <site-header>
  const siteHeader = /<site-header\b[^>]*>\s*<\/site-header>/i.exec(html);

  // 1. blok komentar yang membungkus salah satu header di atas
  const cs = html.indexOf(START_CMT);
  if (cs >= 0) {
    const ce = html.indexOf(END_CMT, cs);
    const inner = ce > cs ? html.slice(cs, ce) : "";
    if (ce > cs && /<header class="header|<site-header/i.test(inner)) {
      return { start: cs, end: ce + END_CMT.length, kind: "blok header area" };
    }
  }
  if (siteHeader) {
    let start = siteHeader.index;
    let end = start + siteHeader[0].length;
    // ikut ganti komentar penanda tepat di atasnya
    const before = html.slice(0, start);
    const cmt = before.match(/<!-- Header \+ navigasi \+ menu mobile bersama: assets\/js\/site-header\.js -->\s*$/);
    if (cmt) start -= cmt[0].length;
    return { start, end, kind: "<site-header>" };
  }
  if (oldHeader) {
    const end = findElementEnd(html, oldHeader.index, "header");
    if (end < 0) throw new Error("</header> tidak ditemukan");
    let start = oldHeader.index;
    let stop = end;
    if (cs >= 0 && cs < start && html.slice(cs + START_CMT.length, start).trim() === "") start = cs;
    const after = html.slice(stop).match(/^\s*<!--======== End of header area =========-->/);
    if (after) stop += after[0].length;
    return { start, end: stop, kind: "<header class=\"header\">" };
  }
  return null;
}

/* Lepas aset yang hanya dipakai header lama */
function removeOldHeaderAssets(html) {
  const removed = [];
  // Blok aset header v2 yang ditambahkan scripts/migrate-header-v2.js (Tailwind khusus header)
  const blockRe = /[ \t]*<!-- Header bersama \(UI v2\): Tailwind hanya aktif di dalam header \(\.dlg\) -->[\s\S]*?<link rel="stylesheet" href="[^"]*ui-v2\.css" \/>[ \t]*\r?\n?/;
  if (blockRe.test(html)) {
    html = html.replace(blockRe, "");
    removed.push("Tailwind khusus header");
  }
  // Tailwind dengan data-scope=".dlg" (hanya dipakai header lama) — jika masih tersisa
  if (/tailwind-config\.js" data-scope="\.dlg"/.test(html)) {
    html = html.replace(/[ \t]*<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>[ \t]*\r?\n?/, "");
    html = html.replace(/[ \t]*<script src="[^"]*tailwind-config\.js" data-scope="\.dlg"><\/script>[ \t]*\r?\n?/, "");
    removed.push("Tailwind khusus header");
  }
  const siteJs = /[ \t]*<script src="[^"]*site-header\.js"><\/script>[ \t]*\r?\n?/g;
  if (siteJs.test(html)) {
    html = html.replace(siteJs, "");
    removed.push("site-header.js");
  }
  return { html, removed };
}

/* -------------------------------- main --------------------------------- */
function migrate(rel) {
  const full = path.join(ROOT, rel);
  const raw = fs.readFileSync(full, "utf8");
  const crlf = raw.includes("\r\n");
  let html = raw.replace(/\r\n/g, "\n");

  if (html.includes("<dialogika-header")) return { status: "skip" };

  // Template admin menghasilkan artikel di blog/, jadi path-nya mengikuti blog/ ("../")
  const isTemplate = rel.replace(/\\/g, "/") === "admin/template/blog-template.html";
  const depth = isTemplate ? 1 : path.dirname(rel) === "." ? 0 : path.dirname(rel).split(/[\\/]/).length;
  const prefix = "../".repeat(depth);
  const notes = [];

  // 1. Ganti header
  const found = findHeader(html);
  if (found) {
    html = html.slice(0, found.start) + headerBlock(prefix, activeFor(rel)) + html.slice(found.end);
    notes.push("ganti " + found.kind);
  } else {
    // Tidak ada header: sisipkan tepat sebelum <main ...>
    const main = /^([ \t]*)<main\b/m.exec(html);
    if (!main) throw new Error("header tidak ditemukan dan tidak ada <main> sebagai patokan");
    html = html.slice(0, main.index) + "    " + headerBlock(prefix, activeFor(rel)) + "\n\n" + html.slice(main.index);
    notes.push("sisipkan header (sebelumnya tidak ada)");
  }

  // 2. Hapus menu mobile lama
  [
    [/<div class="mobile-menu-overlay"[^>]*>/i, "#mobile-menu-overlay"],
    [/<div class="mobile-panel(?:\s[^"]*)?"[^>]*>/i, ".mobile-panel"],
    [/<div class="page-scrim(?:\s[^"]*)?"[^>]*>/i, ".page-scrim"],
  ].forEach(([re, label]) => {
    const r = removeElement(html, re, "div");
    if (r.removed) {
      html = r.html;
      notes.push("hapus " + label);
    }
  });

  // 3. Lepas aset header lama
  const a = removeOldHeaderAssets(html);
  html = a.html;
  if (a.removed.length) notes.push("lepas " + [...new Set(a.removed)].join(", "));

  // 4. Aset header baru di <head>
  if (!html.includes("</head>")) throw new Error("</head> tidak ditemukan");
  const assets = headAssets(html, prefix);
  if (assets) html = html.replace("</head>", assets.trimStart() + "</head>");

  if (!DRY_RUN) {
    const backup = path.join(BACKUP_DIR, rel);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.copyFileSync(full, backup);
    fs.writeFileSync(full, crlf ? html.replace(/\n/g, "\r\n") : html);
  }
  return { status: "done", notes };
}

/* Template header untuk artikel baru (scripts/build.js --wrap) */
function migrateTemplatePart() {
  const rel = "scripts/template-parts/header.html";
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return;
  const html = fs.readFileSync(full, "utf8");
  if (html.includes("<dialogika-header")) {
    console.log("• lewati      " + rel);
    return;
  }
  const out = headerBlock("../", "artikel").replace(/\n    /g, "\n") + "\n";
  if (!DRY_RUN) {
    const backup = path.join(BACKUP_DIR, rel);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.copyFileSync(full, backup);
    fs.writeFileSync(full, out);
  }
  console.log((DRY_RUN ? "○ akan ubah  " : "✓ diubah     ") + rel);
}

/* Kumpulkan rujukan file lokal yang tidak ada */
const missingAssets = new Map();
function checkAssets(rel) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const re = /(?:href|src)="([^"#?]+\.(?:css|js|png|jpe?g|webp|svg|gif|json))(?:[?#][^"]*)?"/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith("data:") || url.includes("{{")) continue;
    const target = url.startsWith("/")
      ? path.join(ROOT, url.replace(/^\/blog-dialogika\//, "/"))
      : path.join(ROOT, rel === "admin/template/blog-template.html" ? "blog" : path.dirname(rel), url);
    if (!target.startsWith(path.join(ROOT, "assets")) && !/\.(css|js)$/i.test(url)) continue;
    if (!fs.existsSync(target)) {
      const key = path.relative(ROOT, target).replace(/\\/g, "/");
      if (!missingAssets.has(key)) missingAssets.set(key, new Set());
      missingAssets.get(key).add(rel);
    }
  }
}

const pages = onlyFiles.length ? onlyFiles.map((f) => f.replace(/\\/g, "/").replace(/^\.\//, "")) : listPages();
let done = 0, skipped = 0, failed = 0;
pages.forEach((rel) => {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.log("✗ tidak ada   " + rel);
    failed++;
    return;
  }
  try {
    const r = migrate(rel);
    if (r.status === "skip") {
      console.log("• lewati      " + rel + " (sudah memakai <dialogika-header>)");
      skipped++;
    } else {
      console.log((DRY_RUN ? "○ akan ubah  " : "✓ diubah     ") + rel + " (" + r.notes.join("; ") + ")");
      done++;
    }
  } catch (e) {
    console.log("✗ gagal       " + rel + " - " + e.message);
    failed++;
  }
});
if (!onlyFiles.length) migrateTemplatePart();

pages.forEach((rel) => {
  if (fs.existsSync(path.join(ROOT, rel))) checkAssets(rel);
});
if (missingAssets.size) {
  console.log("\n⚠ File yang dirujuk halaman tetapi TIDAK ADA di repo:");
  [...missingAssets.keys()].sort().forEach((k) => {
    const users = [...missingAssets.get(k)];
    console.log("   - " + k + "  (dipakai " + users.length + " halaman, mis. " + users[0] + ")");
  });
  console.log("   Salin file-file ini ke repo, kalau tidak sebagian tampilan/fitur tidak akan jalan.");
}

console.log("\nSelesai: " + done + (DRY_RUN ? " akan diubah" : " diubah") + ", " + skipped + " dilewati, " + failed + " gagal.");
if (done && !DRY_RUN) console.log("Salinan asli: " + path.relative(ROOT, BACKUP_DIR));
if (failed) process.exitCode = 1;
