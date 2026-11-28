#!/usr/bin/env node
/**
 * apply-new-template.js
 * ---------------------------------------------------------------------------
 * Mengubah semua artikel lama di /blog ke tampilan baru (Tailwind) memakai
 * admin/template/blog-template.html — tanpa mengubah isi artikel & SEO.
 *
 * Yang diambil dari artikel lama:
 *   - seluruh <head> bagian SEO (title, meta, canonical, OG, Twitter, JSON-LD)
 *   - judul H1, kategori, penulis, tanggal, gambar featured
 *   - isi artikel (#article-body), tags, key takeaways, FAQ, sources
 *
 * Pemakaian (dari root repo):
 *   node scripts/apply-new-template.js              -> ubah semua artikel lama
 *   node scripts/apply-new-template.js --dry-run    -> hanya tampilkan daftar
 *   node scripts/apply-new-template.js nama-file.html [file2.html ...]
 *
 * Artikel yang sudah memakai tampilan baru otomatis dilewati.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const TEMPLATE_PATH = path.join(ROOT, "admin", "template", "blog-template.html");
const BODY_MARKER = "    <!-- =============================================\n         TAMPILAN BARU";

const DRY_RUN = process.argv.includes("--dry-run");
const onlyFiles = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
const markerIdx = template.indexOf(BODY_MARKER);
if (markerIdx < 0) throw new Error("Penanda TAMPILAN BARU tidak ditemukan di template.");
const templateBody = template.slice(markerIdx);

/* ----------------------------- helpers ----------------------------- */
function match(re, s, group = 1) {
  const m = s.match(re);
  return m ? m[group] : "";
}
function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renderer FAQ — sama dengan admin/js/content-renderer.js (input sudah di-escape). */
function renderFaq(faqs) {
  if (!faqs.length) return "";
  let html =
    '<section class="faq-section bg-surface-card p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-sm" id="faq">\n' +
    '                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">quiz</span><span>Pertanyaan yang Sering Diajukan</span></h2>\n' +
    '                <div class="flex flex-col gap-2">\n';
  faqs.forEach((f) => {
    html +=
      '                  <details class="faq-item group rounded-xl bg-surface-container-low">\n' +
      '                    <summary class="faq-question flex items-center justify-between gap-3 p-space-md cursor-pointer font-headline-sm text-headline-sm font-semibold text-on-surface hover:text-primary">\n' +
      "                      <span>" + f.question + "</span>\n" +
      '                      <span class="faq-icon material-symbols-outlined text-primary transition-transform">add</span>\n' +
      "                    </summary>\n" +
      '                    <div class="faq-answer px-space-md pb-space-md font-body-default text-body-default text-on-surface-variant">\n' +
      "                      <p>" + f.answer + "</p>\n" +
      "                    </div>\n" +
      "                  </details>\n";
  });
  return html + "                </div>\n              </section>";
}

/** Renderer Sources — sama dengan admin/js/content-renderer.js (input sudah di-escape). */
function renderSources(sources) {
  if (!sources.length) return "";
  let html =
    '<section class="sources-area bg-surface-card p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-sm" id="referensi">\n' +
    '                <h2 class="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">menu_book</span><span>Sumber &amp; Referensi</span></h2>\n' +
    '                <ol class="sources-list-wrap flex flex-col gap-2 font-body-small text-body-small text-on-surface-variant">\n';
  sources.forEach((src, i) => {
    const title = src.title || src.url;
    const num = (i + 1 < 10 ? "0" : "") + (i + 1) + ".";
    html +=
      '                  <li><a class="source-card-item flex items-start gap-3 p-2.5 rounded-lg hover:bg-royal-blue-subtle hover:text-primary transition-colors" href="' +
      src.url + '" target="_blank" rel="noopener noreferrer">';
    html += src.thumbnail
      ? '<img src="' + src.thumbnail + '" alt="' + title + '" loading="lazy" class="w-12 h-12 rounded-lg object-cover shrink-0" />'
      : '<span class="text-outline-variant font-mono shrink-0">' + num + "</span>";
    html += '<span class="source-info flex flex-col min-w-0"><span class="font-semibold text-on-surface break-words">' + title + "</span>";
    if (title !== src.url) html += '<span class="text-navy-muted text-[12px] break-all">' + src.url + "</span>";
    html += '</span><span class="material-symbols-outlined text-[16px] ml-auto shrink-0">open_in_new</span></a></li>\n';
  });
  return html + "                </ol>\n              </section>";
}

/* ---------------------------- extractor ---------------------------- */
function extract(html, file) {
  const headEnd = html.indexOf("<!-- CSS Libraries -->");
  if (headEnd < 0) throw new Error("penanda <!-- CSS Libraries --> tidak ada");
  let head = html.slice(0, html.lastIndexOf("\n", headEnd) + 1).replace(/\s+$/, "\n");

  const featured = match(/class="watermark-container">\s*<img([^>]*)>/, html);
  const featuredUrl = match(/src="([^"]*)"/, featured);
  const featuredAlt = match(/alt="([^"]*)"/, featured);

  // og:image / twitter:image yang kosong diisi gambar featured
  if (featuredUrl) {
    head = head.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")("\s*\/?>)/g, `$1${featuredUrl}$2`);
  }

  const catBlock = match(/<div class="trending-blog-post-category">\s*<a href="([^"]*)">([^<]*)<\/a>/, html, 0);
  const categoryUrl = match(/href="([^"]*)"/, catBlock) || "index.html";
  const category = match(/>([^<]*)<\/a>/, catBlock).trim() || "Blog";

  const author = match(/following-blog-post-author">\s*By <a[^>]*>([^<]*)<\/a>/, html).trim() || "Dialogika";
  const dateIso = match(/<time datetime="([^"]*)"/, html);
  const dateDisplay = stripTags(match(/<time datetime="[^"]*"\s*>([\s\S]*?)<\/time\s*>/, html));
  const h1 = match(/<h1 class="article-h1">([\s\S]*?)<\/h1>/, html).trim();
  const metaDesc = match(/<meta name="description" content="([^"]*)"/, html);
  const slug = match(/var CURRENT_SLUG = "([^"]*)"/, html) || path.basename(file, ".html");

  const bodyStart = html.indexOf('id="article-body">');
  const tagsMarker = html.indexOf("<!-- Tags -->", bodyStart);
  if (bodyStart < 0 || tagsMarker < 0) throw new Error("isi artikel tidak ditemukan");
  const content = html.slice(bodyStart + 'id="article-body">'.length, tagsMarker).trim();

  const tags = match(/<div class="post-tags-area">([\s\S]*?)<\/div>/, html.slice(tagsMarker)).trim();

  const ktStart = html.indexOf('class="key-takeaways-section"');
  const ktBlock = ktStart < 0 ? "" : html.slice(ktStart, html.indexOf("</ul>", ktStart));
  const takeaways = (ktBlock.match(/<li>[\s\S]*?<\/li>/g) || []).join("\n                        ");

  const faqs = [];
  const faqRe = /<div class="faq-item">[\s\S]*?<button[^>]*>\s*<span>([\s\S]*?)<\/span>[\s\S]*?<div class="faq-answer">\s*<p>([\s\S]*?)<\/p>/g;
  let fm;
  while ((fm = faqRe.exec(html))) faqs.push({ question: fm[1].trim(), answer: fm[2].trim() });

  const sources = [];
  const srcRe = /<a href="([^"]*)"[^>]*class="source-card-item">([\s\S]*?)<\/a>/g;
  let sm;
  while ((sm = srcRe.exec(html))) {
    sources.push({
      url: sm[1],
      thumbnail: match(/<img src="([^"]*)"/, sm[2]),
      title: match(/<h6>([\s\S]*?)<\/h6>/, sm[2]).trim(),
    });
  }

  return {
    head,
    data: {
      SLUG: slug,
      CATEGORY: category,
      BREADCRUMB_CATEGORY: category,
      CATEGORY_URL: categoryUrl,
      ARTICLE_H1: h1,
      META_DESCRIPTION: metaDesc,
      AUTHOR: author,
      PUBLISHED_DATE_ISO: dateIso,
      PUBLISHED_DATE_DISPLAY: dateDisplay,
      FEATURED_IMAGE_URL: featuredUrl,
      FEATURED_IMAGE_ALT: featuredAlt || escapeHtml(stripTags(h1)),
      KEY_TAKEAWAYS_HTML: takeaways,
      ARTICLE_CONTENT: content,
      TAGS_HTML: tags,
      FAQ_HTML: renderFaq(faqs),
      SOURCES_HTML: renderSources(sources),
    },
    stats: { takeaways: (takeaways.match(/<li>/g) || []).length, faqs: faqs.length, sources: sources.length },
  };
}

function fill(tpl, data) {
  let out = tpl;
  Object.keys(data).forEach((k) => {
    out = out.split("{{" + k + "}}").join(data[k] == null ? "" : String(data[k]));
  });
  return out.replace(/\{\{[A-Z0-9_]+\}\}/g, "");
}

/* ------------------------------ main ------------------------------- */
const files = (onlyFiles.length ? onlyFiles.map((f) => path.basename(f)) : fs.readdirSync(BLOG_DIR))
  .filter((f) => f.endsWith(".html") && f !== "index.html");

let done = 0, skipped = 0, failed = 0;
files.forEach((f) => {
  const full = path.join(BLOG_DIR, f);
  if (!fs.existsSync(full)) { console.log("✗ tidak ada  ", f); failed++; return; }
  const html = fs.readFileSync(full, "utf8");
  if (html.includes("data-article-slug=") || html.includes('id="dialogika-reading-progress"') || !html.includes("post-tags-area")) {
    console.log("• lewati     ", f, "(sudah tampilan baru / bukan format lama)");
    skipped++;
    return;
  }
  try {
    const { head, data, stats } = extract(html, f);
    const out = head + "\n" + fill(templateBody, data);
    if (!DRY_RUN) fs.writeFileSync(full, out);
    console.log((DRY_RUN ? "○ akan ubah  " : "✓ diubah     ") + f, `(takeaways:${stats.takeaways} faq:${stats.faqs} sources:${stats.sources})`);
    done++;
  } catch (e) {
    console.log("✗ gagal      ", f, "-", e.message);
    failed++;
  }
});
console.log(`\nSelesai: ${done} ${DRY_RUN ? "akan diubah" : "diubah"}, ${skipped} dilewati, ${failed} gagal.`);
if (failed) process.exitCode = 1;
