/**
 * Migrasi artikel blog lama (D:\Magang\blog) ke blog-dialogika.
 *
 * Pemakaian:
 *   node scripts/migrate-old-articles.js                # dry-run, tulis preview ke %TEMP%\migrasi-preview
 *   node scripts/migrate-old-articles.js --apply        # tulis artikel + update articles.json
 *   node scripts/migrate-old-articles.js --apply --only=nama-file.html
 *
 * Tidak melakukan git commit. Sebelum menulis, snapshot articles.json disimpan di
 * .migration-undo/ dan daftar file baru dicatat untuk dibalik lewat scripts/undo-migrasi.ps1.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OLD_DIR = process.env.OLD_BLOG_DIR || 'D:/Magang/blog';
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const UNDO_DIR = path.join(ROOT, '.migration-undo');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'admin/template/blog-template.html'), 'utf8');

const APPLY = process.argv.includes('--apply');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
const PREVIEW_DIR = path.join(process.env.TEMP || 'C:/Users/Windows/AppData/Local/Temp', 'migrasi-preview');

const CATEGORY_URLS = {
  'Public Speaking': '../public-speaking/index.html',
  'Self Development': '../self-development/index.html',
  'Mental Health': '../mental-health/index.html',
  'Communication': '../communication/index.html',
};
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// Terima ISO ("2025-03-22T08:00:00+07:00") maupun tampilan lama
// ("22 Nov 2026" / "22 Maret 2025"). Date.parse saja gagal untuk nama bulan Indonesia.
function parseDateValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return NaN;
  const iso = Date.parse(raw);
  if (!isNaN(iso)) return iso;
  const m = raw.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return NaN;
  const month = MONTHS.findIndex(x => x.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return NaN;
  return new Date(+m[3], month, +m[1]).getTime();
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function escapeAttr(s) { return escapeHtml(s); }
function decodeEntities(s) {
  return String(s == null ? '' : s)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/[\u00a0\u200b]/g, ' ');
}
function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function slugify(text) {
  return String(text || '').toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

// Cari indeks akhir (setelah tag penutup) elemen yang mulai di `start`.
function findMatchingTagEnd(html, start, tagName) {
  const re = new RegExp('</?' + tagName + '\\b[^>]*>', 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    const isClose = m[0][1] === '/';
    const selfClosing = /\/>$/.test(m[0]);
    if (isClose) {
      depth--;
      if (depth === 0) return re.lastIndex;
    } else if (!selfClosing) {
      depth++;
    }
  }
  return -1;
}
function divOpenRegex(classPart) {
  return new RegExp('<div\\b[^>]*class="[^"]*\\b' + classPart + '\\b[^"]*"[^>]*>', 'i');
}
function removeDivByClass(html, classPart) {
  let guard = 0;
  while (guard++ < 30) {
    const re = divOpenRegex(classPart);
    const m = re.exec(html);
    if (!m) break;
    const end = findMatchingTagEnd(html, m.index, 'div');
    if (end < 0) break;
    html = html.slice(0, m.index) + html.slice(end);
  }
  return html;
}
function unwrapDivByClass(html, classPart) {
  const re = divOpenRegex(classPart);
  const m = re.exec(html);
  if (!m) return html;
  const end = findMatchingTagEnd(html, m.index, 'div');
  if (end < 0) return html;
  const inner = html.slice(m.index + m[0].length, end - '</div>'.length);
  return html.slice(0, m.index) + inner + html.slice(end);
}

function extractKeyTakeaways(body) {
  const re = divOpenRegex('key-take');
  const m = re.exec(body);
  if (!m) return [];
  const end = findMatchingTagEnd(body, m.index, 'div');
  if (end < 0) return [];
  const card = body.slice(m.index, end);
  const items = [...card.matchAll(/<li[^>]*class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(x => stripTags(x[1]))
    .filter(Boolean);
  if (items.length && /^key takeaways$/i.test(items[0])) items.shift();
  return [...new Set(items)];
}

function convertLinkCards(html) {
  const re = /<div\b[^>]*class="[^"]*link-content[^"]*"[^>]*>[\s\S]*?<\/a>\s*<\/div>/gi;
  return html.replace(re, (block) => {
    const a = block.match(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!a) return '';
    let href = decodeEntities(a[1]).trim();
    let text = stripTags(a[2]).replace(/^baca juga\s*:?\s*/i, '').trim();
    // Lewati kartu link placeholder/rusak dari template lama.
    if (!text || /^inbound links?$/i.test(text)) return '';
    if (!/^https?:\/\//i.test(href) || /\s/.test(href)) return '';
    if (/r\.search\.yahoo|doubleclick|googleadservices/i.test(href)) return '';
    if ((href.match(/https?:\/\//gi) || []).length > 1) return '';
    text = text.replace(/\s*\|\s*Dialogika(?: Blog)?\s*$/i, '').trim();
    return `<p class="internal-link-paragraph">Baca Juga: <a href="${escapeAttr(href)}" class="internal-link">${escapeHtml(text)}</a></p>`;
  });
}

function cleanBlockquotes(html) {
  return html.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, inner) => {
    const cite = (inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) || [])[1] || '';
    const text = stripTags(inner.replace(/<figcaption[\s\S]*?<\/figcaption>/gi, ''));
    if (!text) return '';
    return `<blockquote class="blockquote-box"><p class="blockquote-text">${escapeHtml(text)}</p>` +
      (cite ? `<cite>— ${escapeHtml(stripTags(cite))}</cite>` : '') + '</blockquote>';
  });
}

function cleanContent(raw) {
  let html = raw;
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = removeDivByClass(html, 'img-control');
  html = removeDivByClass(html, 'call-to-action');
  html = convertLinkCards(html);
  html = removeDivByClass(html, 'key-take');
  html = removeDivByClass(html, 'col-lg-5');
  html = unwrapDivByClass(html, 'row');
  html = unwrapDivByClass(html, 'col-lg-7');
  html = unwrapDivByClass(html, 'container');
  html = cleanBlockquotes(html);
  // sisa branding template lama
  html = html.replace(/<img\b[^>]*class="[^"]*img-logo-image[^"]*"[^>]*>/gi, '');
  html = html.replace(/<span\b[^>]*class="[^"]*badge[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
  // highlight
  html = html.replace(/<mark\b[^>]*>/gi, '<span class="highlight">').replace(/<\/mark>/gi, '</span>');
  html = html.replace(/<span\b[^>]*class="[^"]*fw-lighter[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  html = html.replace(/<div\b[^>]*class="[^"]*glightbox[^"]*"[^>]*>/gi, '');
  html = decodeEntities(html);
  html = html.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return html;
}

function classifyArticle(title, keywords) {
  const text = [title, keywords].join(' ').toLowerCase();
  const score = (patterns) => patterns.reduce((s, p) => s + (text.includes(p) ? 1 : 0), 0);
  const scores = [
    { n: 'Communication', s: score(['komunikasi','interpersonal','obrolan','ngobrol','nyambung','basa-basi','small talk','konflik','relationship','relasi','keluarga','hubungan','menasihati','parenting','dosen','karyawan','rekan kerja','tempat kerja','negosiasi','menawar','pasar','boomer']) },
    { n: 'Public Speaking', s: score(['public speaking','presentasi','mc ','pembicara','pidato','panggung','demam panggung','berbicara di depan','bicara di depan','gugup','storytelling','intonasi','pantun','pembukaan presentasi','sidang skripsi','dosen penguji','orasi','pitching','pitch','investor','klien','bisnis']) },
    { n: 'Mental Health', s: score(['anxiety','overthinking','insecure','mental health','kesehatan mental','emosi','cemas','takut','grogi','stres','self-esteem','percaya diri','kepercayaan diri','minder']) },
    { n: 'Self Development', s: score(['personal branding','karir','karier','branding diri','kepemimpinan','produktivitas','softskill','sukses','skill','pengembangan diri','gen z','dunia kerja','uang','mahasiswa','cv','pekerjaan','hobi','pencitraan']) },
  ];
  scores.sort((a, b) => b.s - a.s);
  return scores[0].s > 0 ? scores[0].n : 'Self Development';
}

function parseOldDate(timeAttr, timeText) {
  let d, m, y;
  let mm = String(timeAttr || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mm) { d = +mm[1]; m = +mm[2]; y = +mm[3]; }
  if (!mm) {
    mm = String(timeAttr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (mm) { y = +mm[1]; m = +mm[2]; d = +mm[3]; }
  }
  if (!mm) {
    const text = stripTags(timeText || '').match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (text) {
      d = +text[1]; y = +text[3];
      const idx = MONTHS.findIndex(x => x.toLowerCase() === text[2].toLowerCase());
      m = idx >= 0 ? idx + 1 : 1;
    }
  }
  if (!d || !m || !y) return null;
  const pad = n => String(n).padStart(2, '0');
  return {
    iso: `${y}-${pad(m)}-${pad(d)}T08:00:00+07:00`,
    display: `${d} ${MONTHS[m - 1]} ${y}`,
  };
}

function firstParagraph(body) {
  const p = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(x => stripTags(x[1]))
    .find(t => t && !/^published\s*:/i.test(t) && t.length > 60);
  return p || '';
}

function extractArticle(file) {
  const c = fs.readFileSync(path.join(OLD_DIR, file), 'utf8');
  const get = (re) => { const m = c.match(re); return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : ''; };
  const title = get(/<h1 class="title">([\s\S]*?)<\/h1>/) || get(/<title>([^<]*)<\/title>/).replace(/\s*\|\s*Dialogika Blog$/, '');
  const desc = get(/<meta\s+content="([^"]*)"\s+name="description"/i) || get(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const keywords = get(/<meta\s+content="([^"]*)"\s+name="keywords"/i) || get(/<meta\s+name="keywords"\s+content="([^"]*)"/i);
  const ogimg = get(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const postimg = (c.match(/<div class="post-img"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"/i) || [])[1] || '';
  const image = (/^https?:\/\//i.test(ogimg) ? ogimg : (/^https?:\/\//i.test(postimg) ? postimg : ''));
  const timeAttr = get(/<time\s+datetime="([^"]*)"/i);
  const timeText = get(/<time[^>]*>([^<]*)<\/time>/i);
  const date = parseOldDate(timeAttr, timeText) || { iso: '', display: '' };
  const authors = [...c.matchAll(/<li class="d-flex align-items-center"><i class="bi bi-person"><\/i>\s*<a href="#">([^<]*)<\/a>/g)]
    .map(m => decodeEntities(m[1]).replace(/\s+/g, ' ').trim()).filter(Boolean);
  const start = c.indexOf('<div class="content">');
  const endMark = '</div><!-- End post content -->';
  const end = c.indexOf(endMark, start);
  const rawBody = start >= 0 && end > start ? c.slice(start + '<div class="content">'.length, end) : '';
  return { file, title, desc, keywords, image, date, authors, rawBody };
}

function buildTags(keywords, category) {
  const tags = String(keywords || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!tags.some(t => t.toLowerCase() === category.toLowerCase())) tags.push(category);
  return [...new Set(tags)].slice(0, 6);
}

function renderTags(tags, category, categoryUrl) {
  return tags.map(tag => {
    const href = categoryUrl && tag.toLowerCase() === category.toLowerCase() ? categoryUrl : '#';
    return `<a href="${escapeAttr(href)}" class="tags-color">${escapeHtml(tag)}</a>`;
  }).join('\n                          ');
}

function buildArticle(meta) {
  const takeaways = extractKeyTakeaways(meta.rawBody);
  const content = cleanContent(meta.rawBody);
  const intro = firstParagraph(meta.rawBody);
  let description = meta.desc;
  if (!description || description.length < 100) description = intro || description || meta.title;
  description = description.replace(/\s+/g, ' ').trim();
  const slug = slugify(meta.title);
  const category = classifyArticle(meta.title, meta.keywords);
  const categoryUrl = CATEGORY_URLS[category];
  const canonical = 'https://dialogika.co/blog/' + slug;
  const tags = buildTags(meta.keywords, category);
  const author = meta.authors[0] || 'Dialogika';

  const articleJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description,
    image: meta.image,
    author: { '@type': 'Organization', name: 'Dialogika', url: 'https://dialogika.co' },
    publisher: {
      '@type': 'Organization', name: 'Dialogika',
      logo: { '@type': 'ImageObject', url: 'https://dialogika.co/assets/images/dialogikalogo.png' },
    },
    datePublished: meta.date.iso,
    dateModified: meta.date.iso,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }, null, 2);

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://dialogika.co' },
      { '@type': 'ListItem', position: 2, name: category, item: 'https://dialogika.co/kategori/' + slugify(category) },
      { '@type': 'ListItem', position: 3, name: meta.title },
    ],
  }, null, 2);

  const data = {
    PAGE_TITLE: escapeHtml(meta.title),
    META_DESCRIPTION: escapeHtml(description),
    META_KEYWORDS: escapeHtml(meta.keywords),
    CANONICAL_URL: escapeAttr(canonical),
    OG_TITLE: escapeHtml(meta.title),
    OG_DESCRIPTION: escapeHtml(description),
    OG_URL: escapeAttr(canonical),
    OG_IMAGE: escapeAttr(meta.image),
    TWITTER_TITLE: escapeHtml(meta.title),
    TWITTER_DESCRIPTION: escapeHtml(description),
    TWITTER_IMAGE: escapeAttr(meta.image),
    PUBLISHED_DATE_ISO: meta.date.iso,
    MODIFIED_DATE_ISO: meta.date.iso,
    ARTICLE_JSON_LD: articleJsonLd,
    FAQ_JSON_LD_BLOCK: '',
    BREADCRUMB_JSON_LD: breadcrumbJsonLd,
    FEATURED_IMAGE_URL: escapeAttr(meta.image),
    FEATURED_IMAGE_ALT: escapeHtml(meta.title),
    CATEGORY: escapeHtml(category),
    AUTHOR: escapeHtml(author),
    PUBLISHED_DATE_DISPLAY: escapeHtml(meta.date.display),
    ARTICLE_H1: escapeHtml(meta.title),
    ARTICLE_CONTENT: content,
    TAGS_HTML: renderTags(tags, category, categoryUrl),
    KEY_TAKEAWAYS_HTML: takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('\n                        '),
    FAQ_HTML: '',
    SOURCES_HTML: '',
    CHEATSHEET_URL: '',
    BREADCRUMB_CATEGORY: escapeHtml(category),
    CATEGORY_URL: escapeAttr(categoryUrl),
    SLUG: slug,
  };

  let html = TEMPLATE;
  for (const [k, v] of Object.entries(data)) {
    html = html.split('{{' + k + '}}').join(v);
  }
  html = html.replace(/\{\{[A-Z_]+\}\}/g, '');

  const excerpt = description.length > 220 ? description.slice(0, 220) + '...' : description;
  const entry = {
    slug,
    title: meta.title,
    // Simpan ISO agar bisa diparse Date di browser (formatDate/sort).
    // Tanggal tampilan berbahasa Indonesia tetap dipakai di HTML artikel.
    date: meta.date.iso,
    keywords: meta.keywords,
    excerpt,
    image: meta.image,
    url: '/blog-dialogika/blog/' + slug + '.html',
    category,
  };
  return { slug, html, entry, category, takeaways, content, meta };
}

function prepareUndo(jsonPath, createdFiles) {
  fs.mkdirSync(UNDO_DIR, { recursive: true });
  const bak = path.join(UNDO_DIR, 'articles.json.bak');
  if (!fs.existsSync(bak)) fs.copyFileSync(jsonPath, bak);

  const listPath = path.join(UNDO_DIR, 'created-files.txt');
  const old = fs.existsSync(listPath)
    ? fs.readFileSync(listPath, 'utf8').split(/\r?\n/).filter(Boolean)
    : [];
  const all = [...new Set(old.concat(createdFiles))];
  fs.writeFileSync(listPath, all.join('\n') + '\n', 'utf8');

  fs.writeFileSync(path.join(UNDO_DIR, 'README.txt'),
    'Snapshot dibuat otomatis oleh scripts/migrate-old-articles.js pada ' + new Date().toISOString() + '\n' +
    'Jalankan scripts/undo-migrasi.ps1 untuk membatalkan migrasi.\n', 'utf8');
}

function main() {
  let files = fs.readdirSync(OLD_DIR).filter(f => f.toLowerCase().endsWith('.html'));
  if (ONLY) files = files.filter(f => f === ONLY);
  if (!files.length) throw new Error('Tidak ada file HTML untuk diproses di ' + OLD_DIR);
  if (!APPLY) fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  const results = [];
  for (const file of files) {
    const meta = extractArticle(file);
    if (!meta.title || !meta.rawBody) {
      console.warn('SKIP (judul/body tidak ditemukan): ' + file);
      continue;
    }
    if (!meta.date.iso) console.warn('WARN tanggal tidak terbaca: ' + file);
    const built = buildArticle(meta);
    if (!built.takeaways.length) console.warn('WARN key takeaways kosong: ' + file);
    results.push({ file, ...built });

    if (APPLY) {
      const out = path.join(BLOG_DIR, built.slug + '.html');
      if (fs.existsSync(out)) { console.warn('SKIP sudah ada: ' + out); continue; }
      fs.writeFileSync(out, built.html, 'utf8');
    } else {
      fs.writeFileSync(path.join(PREVIEW_DIR, built.slug + '.html'), built.html, 'utf8');
    }
  }

  console.log(JSON.stringify(results.map(r => ({
    file: r.file, slug: r.slug, category: r.category, date: r.entry.date,
    title: r.meta.title, takeaways: r.takeaways.length, bodyLen: r.content.length,
  })), null, 2));

  if (APPLY) {
    const jsonPath = path.join(DATA_DIR, 'articles.json');
    prepareUndo(jsonPath, results.map(r => 'blog/' + r.slug + '.html'));
    const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const slugs = new Set(results.map(r => r.slug));
    const merged = existing.filter(e => !slugs.has(e.slug)).concat(results.map(r => r.entry));
    merged.sort((a, b) => {
      const da = parseDateValue(a.date), db = parseDateValue(b.date);
      if (isNaN(da) && isNaN(db)) return 0;
      if (isNaN(da)) return 1;
      if (isNaN(db)) return -1;
      return db - da;
    });
    fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log(`\nSelesai: ${results.length} artikel ditulis, articles.json kini berisi ${merged.length} entri.`);
    console.log('Undo: powershell -ExecutionPolicy Bypass -File scripts/undo-migrasi.ps1');
  } else {
    console.log(`\nPreview ditulis ke ${PREVIEW_DIR}`);
  }
}

main();
