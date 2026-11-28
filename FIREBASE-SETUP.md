# Setup Firebase — Blog Dialogika

Dokumen ini menjelaskan cara memindahkan artikel blog ke Firebase project **dialogika-co**,
menyimpan data penulis di database, dan publish artikel langsung dari halaman admin.

## Arsitektur singkat

| Bagian | Teknologi | Fungsi |
| --- | --- | --- |
| `admin/index.html` | Firebase Auth + Firestore + Storage | Login, tulis artikel, upload gambar, publish langsung |
| `admin/authors.html` | Firestore | CRUD data penulis |
| `admin/articles.html` | Firestore | Lihat, ubah status, hapus artikel |
| `blog/article.html` | Firestore | Menampilkan artikel baru dari database |
| `assets/js/articles-source.js` | Firestore + fallback JSON | Sumber data untuk homepage, kategori, dan halaman blog |
| `assets/data/articles.json` | File statis | Tetap dipakai sebagai fallback kalau Firebase mati/belum diisi |

URL artikel baru tetap rapi: `/blog/nama-artikel.html`.
Firebase Hosting mengarahkan URL itu ke `blog/article.html`, lalu halaman tersebut
mengambil artikel dari Firestore berdasarkan nama file. Artikel statis lama tetap
dilayani sebagai file biasa (file statis selalu menang atas rewrite).

---

## 1. Aktifkan layanan di Firebase Console

Buka <https://console.firebase.google.com> → pilih / buat project **dialogika-co**.

1. **Authentication**
   - Get started → Sign-in method → aktifkan **Email/Password**.
   - Tab Users → **Add user** → buat akun admin (mis. `admin@dialogika.co`).
     Hanya akun ini yang bisa login dan publish.

2. **Firestore Database**
   - Create database → pilih **Production mode** → pilih region (mis. `asia-southeast2`).
   - Rules tidak perlu diisi manual, nanti di-deploy dari `firestore.rules`.

3. **Storage**
   - Get started → pilih region yang sama.
   - Rules di-deploy dari `storage.rules`.

---

## 2. Hubungkan web app ke project

Di Firebase Console → **Project Settings (gerigi)** → **General** → bagian **Your apps**
→ klik ikon web `</>` → daftarkan app → salin nilai `firebaseConfig`.

Tempel ke `assets/js/firebase-config.js`:

```js
window.DIALOGIKA_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "dialogika-co.firebaseapp.com",
  projectId: "dialogika-co",
  storageBucket: "dialogika-co.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};
```

> `apiKey` memang boleh terlihat publik. Yang menjaga data adalah Firestore Rules
> dan Storage Rules, bukan penyembunyian config.

Kalau file ini masih berisi `PASTE_...`, website otomatis memakai `articles.json`
dan tombol publish dimatikan (mode lokal).

---

## 3. Install & deploy

Butuh Node.js 18+.

```bash
npm install
npx firebase login
```

Deploy aturan keamanan:

```bash
npm run deploy:rules
```

Deploy website (termasuk admin):

```bash
npm run deploy:hosting
```

Atau sekaligus:

```bash
npm run deploy
```

Setelah deploy, buka:
- Website: `https://dialogika-co.web.app/`
- Admin: `https://dialogika-co.web.app/admin/index.html`

---

## 4. Import artikel lama ke Firestore

Ini opsional, tapi disarankan supaya semua artikel ada di database dan muncul
di halaman **Kelola Artikel**.

1. Firebase Console → Project Settings → **Service accounts** →
   **Generate new private key** → simpan sebagai `scripts/serviceAccountKey.json`.
   File ini **jangan di-commit** (sudah masuk `.gitignore`).
2. Cek dulu tanpa menulis:

```bash
npm run import:articles:dry
```

3. Import sungguhan:

```bash
npm run import:articles
```

Script membaca `assets/data/articles.json` + seluruh file di `blog/`,
lalu menulis dokumen ke koleksi `articles` (ID = slug). Script juga membuat
penulis default `Dialogika` di koleksi `authors`.

Opsi lain:

```bash
node scripts/import-to-firestore.js --limit=5
node scripts/import-to-firestore.js --only=cara-mengatur-intonasi-saat-presentasi-yuk-mulai-atur-intonasimu-teori-intonasi
```

---

## 5. Alur kerja penulis

1. Buka `admin/authors.html` → login → **Tambah Penulis**.
   Data tersimpan di koleksi `authors`.
2. Buka `admin/index.html` → login.
3. Isi metadata, pilih **Author** dari dropdown (otomatis dari database).
4. Upload thumbnail lewat input file (masuk ke Firebase Storage) atau isi URL manual.
5. Tulis artikel di editor → **Generate HTML**.
6. Pilih **Langsung Publish** atau **Simpan sebagai Draft** → **Publish ke Firebase**.
7. Artikel langsung bisa dibuka di `/blog/{slug}.html`.
8. Di `admin/articles.html` bisa lihat semua artikel, ubah draft ↔ publish, atau hapus.

### Akun login untuk tiap penulis

Setiap penulis butuh akun Firebase Authentication agar bisa login dan upload sendiri.
Cara termudah lewat terminal (butuh service account):

```bash
node scripts/create-author-account.js \
  --email=penulis@dialogika.co \
  --password=Rahasia123 \
  --name="Nama Penulis" \
  --role="Content Writer"
```

Perintah ini membuat akun login **dan** dokumen di koleksi `authors` sekaligus.
Saat penulis login dengan email yang sama, dropdown Author otomatis memilih namanya.

Tombol **Download HTML** tetap ada. Pakai kalau ingin menyimpan versi statis
(diperlukan untuk SEO/prerender, lihat catatan di bawah).

---

## 6. Struktur data

### Koleksi `articles`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `slug` | string | ID dokumen, juga nama file URL |
| `title` | string | Judul artikel |
| `date` | string | Tanggal publish (ISO atau teks) |
| `keywords` | string | Meta keywords |
| `excerpt` | string | Ringkasan untuk kartu artikel |
| `image` | string | URL thumbnail |
| `category` | string | Public Speaking / Self Development / Mental Health / Communication |
| `author` | string | Nama penulis |
| `authorId` | string | ID dokumen di koleksi `authors` |
| `status` | string | `published` atau `draft` |
| `html` | string | Seluruh halaman HTML hasil generator |
| `createdAt` / `updatedAt` | timestamp | Otomatis |

### Koleksi `authors`

| Field | Tipe |
| --- | --- |
| `name` | string |
| `email` | string |
| `role` | string |
| `bio` | string |
| `photoURL` | string |
| `active` | boolean |

---

## 7. Catatan SEO

Artikel dari Firestore dirender di browser oleh `blog/article.html`. Google bisa
menjalankan JavaScript, tapi hasil terbaik tetap dari HTML statis.

Kalau SEO prioritas:
- Setelah publish, klik **Download HTML** lalu simpan file ke folder `blog/`
  dengan nama `{slug}.html`, kemudian deploy ulang. File statis akan otomatis
  menggantikan versi dinamis untuk URL tersebut.
- Ke depannya bisa ditambah Cloud Function untuk prerender/commit otomatis.

---

## 8. Troubleshooting

| Masalah | Penyebab umum |
| --- | --- |
| Tombol publish tetap abu-abu | Belum login, Firebase config belum diisi, atau HTML belum di-generate |
| `Missing or insufficient permissions` | Rules belum di-deploy (`npm run deploy:rules`) atau user belum login |
| `auth/invalid-credential` | Email/password salah atau provider Email/Password belum aktif |
| Artikel baru 404 | Hosting belum di-deploy ulang setelah `firebase.json` berubah |
| Semua halaman jatuh ke artikel statis | `firebase-config.js` masih placeholder atau Firestore kosong/gagal dibaca |
| Upload gambar gagal | Storage belum diaktifkan atau Storage Rules belum di-deploy |

---

## 9. File yang perlu di-commit

- `firebase.json`, `.firebaserc`
- `firestore.rules`, `storage.rules`, `firestore.indexes.json`
- `assets/js/firebase-config.js`, `firebase-client.js`, `articles-source.js`
- `admin/js/admin-publish.js`, `admin/authors.html`, `admin/articles.html`
- `blog/article.html`, `scripts/import-to-firestore.js`, `package.json`

**Jangan commit:** `scripts/serviceAccountKey.json`, `node_modules/`.
