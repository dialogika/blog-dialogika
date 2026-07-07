const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const TEMPLATE_DIR = path.join(__dirname, 'template-parts');
const OUTPUT_JSON = path.join(DATA_DIR, 'articles.json');

const WRAP_ARTICLES = process.argv.includes('--wrap');
const SKIP_EXISTING = process.argv.includes('--skip-existing');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const title = (content.match(/<title>([^<]*)<\/title>/) || [])[1]?.trim() || '';
  const dateStr = (content.match(/<strong>Published:<\/strong>\s*([^<]*)/) || [])[1]?.trim() || '';
  let date = '';
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        date = d.toISOString();
      }
    } catch (e) {
      // Fallback if date parsing fails
    }
  }

  const keywords = (content.match(/<strong>Keywords:<\/strong>\s*([^<]*)/) || [])[1]?.trim() || '';

  let excerpt = '';
  const paragraphs = Array.from(content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
  for (const match of paragraphs) {
    const text = match[1]
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text || /^Published\s*:/i.test(text) || /^Keywords\s*:/i.test(text)) continue;
    excerpt = text.replace(/^[^a-zA-Z0-9]*/, '');
    if (excerpt.length > 220) excerpt = excerpt.substring(0, 220) + '...';
    break;
  }

  const image = (content.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '';
  const is_wrapped = content.includes('dialogika-header');
  const category = classifyArticle(title, keywords);
  return { content, title, date, keywords, excerpt, image, is_wrapped, category };
}

function classifyArticle(title, keywords) {
  const text = [title, keywords].join(" ").toLowerCase();
  function score(patterns) {
    let s = 0;
    for (const p of patterns) if (text.indexOf(p) !== -1) s++;
    return s;
  }
  const scores = [
    { n: "Communication", s: score(["komunikasi","interpersonal","obrolan","ngobrol","nyambung","basa-basi","small talk","konflik","relationship","miss komunikasi","komunikasi efektif","komunikasi asertif","komunikasi digital","cadel","gagap","membuka diri","emotional intelligence","parenting","distance parenting","menasihati anak","mengajar anak","guru hebat","relasi","komunikasi intrapersonal","peranan komunikasi","bicara tanpa drama","bercerita","sopan","kartini"]) },
    { n: "Public Speaking", s: score(["public speaking","presentasi","mc ","master of ceremony","pembicara","pidato","tampil","panggung","demam panggung","berbicara di depan","bicara di depan","takut bicara","gugup saat","presentasi kerja","pembukaan pidato","moderator","storytelling","body language","voice tone","voice control","intonasi","artikulasi","membawakan acara","tips mc","lupa di tengah presentasi","improvisasi","pola presentasi","presentasi seminar","pitching","presentasi daring"]) },
    { n: "Mental Health", s: score(["anxiety","overthinking","insecure","mental health","kesehatan mental","emosi","cemas","takut","grogi","stres","stress","self-esteem","rasa iri","validasi","krisis identitas","kelelahan digital","oversharing","mengelola emosi","mengatasi rasa gugup","bangun percaya diri","self-confidence","nge-blank"]) },
    { n: "Self Development", s: score(["personal branding","karir","karier","branding diri","kepercayaan diri","self confidence","kepemimpinan","pemimpin","produktivitas","softskill","sukses","skill","masa depan anak","pengembangan diri","raih karir","fokus","time management","gen z","brand","selektif","skill komunikasi","dunia kerja","kerja hybrid","tantangan","ekstrovert","introvert","jago kandang","cara ampuh","percaya diri"]) }
  ];
  scores.sort((a, b) => b.s - a.s);
  return scores[0].n;
}

function addTemplateToArticle(filePath, meta) {
  if (!meta.content.includes('dialogika-header')) {
    let html = meta.content;

    html = html.replace('</head>', `
<link rel="stylesheet" href="../assets/css/vendor/bootstrap.min.css" />
<link rel="stylesheet" href="../assets/fonts/gordita-fonts.css" />
<link rel="stylesheet" href="../assets/css/vendor/icofont.min.css" />
<link rel="stylesheet" href="../assets/css/vendor/bootstrap-icons/bootstrap-icons.css" />
<link rel="stylesheet" href="../assets/css/style.css" />
<link rel="stylesheet" href="../assets/css/homepage.css" />
</head>`);

    const headerTmpl = fs.readFileSync(path.join(TEMPLATE_DIR, 'header.html'), 'utf-8');
    const footerTmpl = fs.readFileSync(path.join(TEMPLATE_DIR, 'footer.html'), 'utf-8');

    html = html.replace('<body>', '<body>\n' + headerTmpl + '\n<main id="main-content">\n<article class="blog-article">\n');

    html = html.replace('</body>', '</article>\n</main>\n' + footerTmpl + '\n</body>');

    fs.writeFileSync(filePath, html, 'utf-8');
    return true;
  }
  return false;
}

ensureDir(DATA_DIR);

const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.html') && f !== 'data.html');

const articles = [];
let wrapped = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const meta = extractMetadata(filePath);

  const article = {
    slug: file.replace('.html', ''),
    title: meta.title,
    date: meta.date,
    keywords: meta.keywords,
    excerpt: meta.excerpt,
    image: meta.image,
    url: 'blog/' + file,
    category: meta.category
  };
  articles.push(article);

  if (WRAP_ARTICLES) {
    const didWrap = addTemplateToArticle(filePath, meta);
    if (didWrap) {
      wrapped++;
    } else if (meta.is_wrapped) {
      skipped++;
    }
  }
}

articles.sort((a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(b.date) - new Date(a.date);
});

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(articles, null, 2), 'utf-8');

console.log('=== Build Complete ===');
console.log('Articles indexed: ' + articles.length);
console.log('JSON output: ' + OUTPUT_JSON);
if (WRAP_ARTICLES) {
  console.log('Wrapped with template: ' + wrapped);
  if (SKIP_EXISTING) console.log('Skipped (already wrapped): ' + skipped);
}
