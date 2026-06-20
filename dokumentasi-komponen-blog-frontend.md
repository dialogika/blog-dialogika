# Dokumentasi Komponen HTML/CSS — Halaman Blog Artikel (Frontend)

Dokumen ini menjelaskan seluruh class CSS custom dan komponen interaktif yang dipakai pada halaman detail artikel blog (`blog-details`). Berbeda dari dokumentasi sebelumnya (untuk admin editor), dokumen ini membahas komponen yang **sudah tampil di halaman publik**, termasuk animasi, JavaScript pendukung, dan SEO/Schema.

---

## 1. Reading Progress Bar

```html
<div id="reading-progress-bar"></div>
```

**Style:**
- Posisi `fixed` di paling atas halaman (`top: 0`), tinggi 4px, lebar dinamis (0–100%)
- Warna gradient dari biru navy ke kuning (`linear-gradient(90deg, #1a3266, #f0a500)`)
- `z-index: 9999` agar selalu di atas elemen lain

**JS terkait:** lebar elemen ini diupdate via event `scroll`, dihitung dari posisi scroll dibanding tinggi halaman (lihat script bagian "READING PROGRESS BAR").

**Kegunaan:** menunjukkan kepada pembaca seberapa jauh mereka sudah membaca artikel.

---

## 2. Read Time Badge

```html
<span id="read-time-text">Menghitung...</span>
```

**Style (`.read-time-badge`):**
- Background biru muda (`#f0f4ff`), teks biru navy
- Bentuk pill (`border-radius: 20px`), border tipis `#d0daff`

**JS terkait:** menghitung jumlah kata di `#article-body`, lalu membaginya dengan 250 kata/menit untuk estimasi waktu baca.

**Kegunaan:** memberi estimasi durasi membaca, meningkatkan engagement pembaca.

---

## 3. Watermark Container (Featured Image)

```html
<div class="watermark-container">
  <img src="..." alt="..." />
  <a class="whatsapp-watermark" href="https://wa.me/...">...</a>
</div>
```

**Style:**
- `.watermark-container::after` — menyisipkan logo transparan (watermark) di pojok kiri atas gambar via `background-image`, posisi absolute.
- Gambar di dalamnya diberi `pointer-events: none` dan `-webkit-user-drag: none` agar **tidak bisa di-drag atau di-drag-save** dengan mudah.
- Klik kanan pada container ini juga diblokir lewat JavaScript (`contextmenu` → `preventDefault()`).

**Kegunaan:** melindungi gambar featured dari pencurian/reupload sederhana, sekaligus branding otomatis di setiap gambar artikel.

### 3a. WhatsApp Watermark Badge

```html
<a class="whatsapp-watermark" href="https://wa.me/+62...">
  <div class="wa-icon-wrap"><img src="whatsapp-icon.png" /></div>
  <span class="wa-number">+62 851 6299 2597</span>
</a>
```

**Style:**
- Posisi absolute di pojok kanan-bawah gambar
- Bentuk pill hijau WhatsApp (`#25d366`) dengan animasi "bubble pop" tiap 3.2 detik (`wa-bubble-pop`)
- Ada "ekor" chat bubble lewat `::after` (kotak diputar 45°)
- Saat hover: warna lebih gelap, naik sedikit (`translateY(-4px)`), animasi berhenti sementara

**Kegunaan:** CTA WhatsApp langsung di atas gambar artikel agar pembaca mudah menghubungi admin.

---

## 4. H2 Watermark / H2 Image Container

Ada dua varian watermark untuk gambar di dalam body artikel (bukan featured image):

### a. `.h2-watermark-container` (watermark di teks/inline)
```html
<span class="h2-watermark-container">Judul Section</span>
```
Logo transparan muncul di pojok kiri-atas teks (opacity 0.55), **tanpa** badge WhatsApp (`display: none !important` pada `.whatsapp-watermark` di dalamnya).

### b. `.h2-image-container` (watermark di gambar section)
```html
<div class="h2-image-container">
  <img class="h2-section-img" src="..." alt="..." />
</div>
```
- Gambar diberi tinggi fix `200px` (mobile: `150px`), `object-fit: cover`
- Logo watermark muncul di pojok kiri-atas (`::after`), tanpa badge WhatsApp

**Kegunaan:** menyisipkan gambar ilustrasi di bawah setiap `<h2>` dengan watermark brand otomatis.

---

## 5. Highlight & Badge (Inline Konten)

| Class | Style | Kegunaan |
|---|---|---|
| `.highlight` | Background kuning (`#fff3cd`), teks bold biru navy | Menyorot statistik/fakta penting di tengah paragraf |
| `.badge-disruptor` | Background biru navy, teks kuning, uppercase, huruf kecil (10px), max-width 110px dengan `text-overflow: ellipsis` | Label kecil seperti "Kritis", "Waspada" yang disisipkan di tengah kalimat |

**Contoh:**
```html
<span class="highlight">73% orang dewasa mengalami ketakutan berbicara di depan umum.</span>
<span class="badge-disruptor">Waspada</span>
```

> Catatan: `.badge-disruptor` di sini punya tambahan `max-width`, `white-space: nowrap`, dan `text-overflow: ellipsis` dibanding versi di editor admin — supaya teks panjang tetap rapi terpotong dengan elipsis.

---

## 6. Blockquote dengan Citation

```html
<blockquote class="blockquote-box">
  <p class="blockquote-text">"Isi kutipan..."</p>
  <cite>— Nama Tokoh, Keterangan</cite>
</blockquote>
```

**Style tambahan (`cite`):**
- Font kecil (13px), warna abu (`#888`), `font-style: normal` (menghilangkan italic default `<cite>`)
- Ditampilkan sebagai block dengan margin atas 8px

**Kegunaan:** kutipan ahli/tokoh lengkap dengan sumber yang rapi secara visual.

---

## 7. Tags & Social Share Area

```html
<div class="post-tags-area">
  <a href="#" class="tags-color">Public Speaking</a>
</div>
<ul class="social-share-area">
  <li><a href="..."><i class="icofont-twitter"></i></a></li>
</ul>
```

| Class | Fungsi |
|---|---|
| `.tags-color` | Tag artikel berbentuk pill biru tua (`#0b2b6a`), padding `6px 18px` |
| `.social-share-area a` | Icon sosial media berbentuk lingkaran 44×44px |

---

## 8. Key Takeaways Section

```html
<div class="key-takeaways-section">
  <div class="kt-title">Key Takeaways</div>
  <ul>
    <li>Poin pertama...</li>
  </ul>
</div>
```

**Style:**
- Background gradient lembut biru (`linear-gradient(135deg, #f0f4ff, #e8f0fe)`)
- Border kiri tebal 5px biru navy, sudut kanan membulat (`border-radius: 0 12px 12px 0`)
- Setiap `<li>` punya bullet custom berupa tanda panah `→` (lewat `::before`), dipisah garis putus-putus

**Kegunaan:** ringkasan poin-poin kunci artikel, biasanya ditampilkan setelah body utama agar pembaca cepat menangkap inti artikel.

---

## 9. Download Cheatsheet

```html
<div class="download-cheatsheet-wrap">
  <button class="blue-dialogika-btn" download>
    <span class="dl-icon">⬇</span> Download Cheatsheet PDF Gratis
  </button>
  <span class="download-cheatsheet-label">Format PDF · Gratis · Tidak perlu daftar</span>
</div>
```

**Kegunaan:** CTA untuk lead magnet (PDF gratis) terkait topik artikel.

> Catatan teknis: elemen `<button>` di sini memakai atribut `href`/`download`, padahal atribut tersebut **tidak valid pada tag `<button>`** — seharusnya memakai tag `<a>` agar fitur download benar-benar berfungsi.

---

## 10. Engagement Bar (Clap & Share)

```html
<div class="engagement-bar">
  <span class="engagement-label">Artikel ini bermanfaat? Beri tepukan!</span>
  <button id="clapBtn" onclick="handleClap()">
    <span class="clap-emoji">👏</span>
    <span class="clap-count" id="clapCount">0</span>
  </button>
  <button onclick="handleShare()">Salin Link</button>
</div>
```

**Fitur JS:**
- `handleClap()` — menambah hitungan clap (maksimal 50×), memperbesar emoji sesaat (`scale(1.5)`), menambahkan class `.clapped`
- `handleShare()` — copy URL halaman ke clipboard, lalu memunculkan `.copy-toast`

**Style `.btn-clap` / tombol share:**
- Bentuk pill, border tipis
- `.btn-clap.clapped` → background biru navy, teks kuning (menandakan sudah di-klik)

---

## 11. Copy Toast (Notifikasi)

```html
<div class="copy-toast" id="copyToast">🔗 Link berhasil disalin!</div>
```

**Style:**
- Default `display: none`, muncul saat class `.show` ditambahkan
- Posisi `fixed`, di tengah bawah layar (`bottom: 30px; left: 50%`)
- Animasi masuk `fadeInUp` (0.3s)
- Hilang otomatis setelah 2.5 detik (diatur lewat `setTimeout` di JS)

**Kegunaan:** feedback visual singkat setelah pengguna menyalin link artikel.

---

## 12. FAQ Section (Accordion)

```html
<div class="faq-section">
  <div class="faq-title">Pertanyaan yang Sering Diajukan</div>
  <div class="faq-item">
    <button class="faq-question" onclick="toggleFaq(this)">
      <span>Pertanyaan...</span>
      <span class="faq-icon">+</span>
    </button>
    <div class="faq-answer">
      <p>Jawaban...</p>
    </div>
  </div>
</div>
```

**Style & Animasi:**
- `.faq-answer` default `max-height: 0` dan `opacity: 0` (tersembunyi)
- Saat class `.open` ditambahkan: `max-height: 420px`, `opacity: 1`, transisi halus dengan `cubic-bezier`
- Icon `+` berubah jadi `×` secara visual lewat `rotate(45deg)` saat state `.open`

**Fitur JS (`toggleFaq`):**
- Hanya **satu FAQ yang bisa terbuka** dalam satu waktu — saat item baru dibuka, semua item lain otomatis ditutup.

**Kegunaan:** menjawab pertanyaan umum pembaca tanpa membuat halaman terlalu panjang, sekaligus mendukung **FAQPage Schema** (lihat bagian SEO di bawah).

---

## 13. Article H1 & Meta

```html
<h1 class="article-h1">Judul Artikel</h1>
```

**Style:** font besar (28px, mobile 22px), bold (800), warna gelap (`#1a1a2e`).

**Meta info terkait** (kategori, author, tanggal, read time) menggunakan class bawaan template seperti `.trending-blog-post-category`, `.following-blog-post-author`, `.post-date`, dll — bukan custom CSS dari blog generator.

---

## 14. Sidebar — Brand Card (`.tgAbout-me`)

```html
<div class="tgAbout-me">
  <div class="tgAbout-thumb"><img src="logo.png" /></div>
  <div class="tgAbout-info">
    <p class="intro">Welcome to <b>Dialogika Blog</b></p>
    <span class="designation">Unleash Your Potential</span>
  </div>
  <div class="tgAbout-social">...</div>
</div>
```

**Style:**
- Card biru tua (`#0b2b6a`) dengan box-shadow ungu mencolok
- Logo bulat di tengah (`border-radius: 50%`)
- Icon sosial media berbentuk lingkaran putih dengan efek `box-shadow inset` yang berubah arah saat hover (efek "tombol tertekan")

**Kegunaan:** kartu profil brand di sidebar kanan halaman blog.

---

## 15. Header Inline Search

```html
<form class="header-inline-search">
  <input class="header-inline-search__input" placeholder="Cari artikel..." />
  <button class="header-inline-search__button">
    <img src="search-icon.png" />
  </button>
</form>
```

**Style:** input dan button sejajar (`flex`), lebar input menyesuaikan breakpoint (220px → 140px di tablet → 160px di mobile).

---

## 16. SEO & Structured Data (Bukan CSS, tapi penting)

Halaman ini juga menyisipkan beberapa **JSON-LD Schema** di `<head>`:

| Schema | Fungsi |
|---|---|
| `Article` | Memberi tahu Google judul, gambar, penulis, tanggal publish artikel |
| `FAQPage` | Membuat pertanyaan di section FAQ berpotensi tampil sebagai *rich snippet* di hasil pencarian Google |
| `BreadcrumbList` | Menampilkan breadcrumb (Home > Kategori > Judul) di hasil pencarian |

> Pastikan isi `FAQPage` schema **sama persis** dengan pertanyaan/jawaban yang tampil di section FAQ HTML, karena Google bisa menganggap konten tersembunyi/tidak sesuai sebagai spam jika berbeda.

---

## Ringkasan Class Utama

| Class | Lokasi | Fungsi |
|---|---|---|
| `#reading-progress-bar` | Top fixed bar | Progress baca |
| `.read-time-badge` / `#read-time-text` | Meta artikel | Estimasi waktu baca |
| `.watermark-container` | Featured image | Watermark logo + WhatsApp + anti drag/klik-kanan |
| `.h2-watermark-container` / `.h2-image-container` | Body artikel | Watermark untuk gambar/teks di tiap section |
| `.highlight` | Body artikel | Sorot teks penting |
| `.badge-disruptor` | Body artikel | Label kecil mencolok |
| `.blockquote-box` | Body artikel | Kutipan + sumber |
| `.tags-color` | Bawah artikel | Tag pill |
| `.key-takeaways-section` | Bawah artikel | Ringkasan poin kunci |
| `.download-cheatsheet-wrap` | Bawah artikel | CTA download PDF |
| `.engagement-bar` / `.btn-clap` | Bawah artikel | Tombol clap & share |
| `.copy-toast` | Floating | Notifikasi copy link |
| `.faq-section` / `.faq-item` | Bawah artikel | Accordion FAQ |
| `.tgAbout-me` | Sidebar | Kartu profil brand |
| `.header-inline-search` | Header | Search bar |

---

### Catatan Umum
- Warna tema konsisten dengan dokumentasi sebelumnya: `#1a3266` (biru navy/primary) dan `#f0a500` (kuning/accent).
- Beberapa class (`.highlight`, `.badge-disruptor`) **identik** dengan yang ada di HTML Blog Generator (editor admin) — artinya konten yang ditulis di editor admin akan otomatis tampil sesuai style ini saat dipublikasikan di halaman frontend.
- Semua animasi (FAQ, toast, clap, WhatsApp bubble) menggunakan CSS `transition`/`@keyframes` dan sedikit JavaScript vanilla — tidak ada dependency library animasi eksternal.
