/**
 * Buat akun login + data penulis sekaligus.
 * ==========================================
 * Butuh scripts/serviceAccountKey.json (lihat FIREBASE-SETUP.md).
 *
 * Contoh:
 *   node scripts/create-author-account.js --email=penulis@dialogika.co --password=Rahasia123 --name="Nama Penulis" --role="Content Writer"
 *
 * Akun Firebase Authentication dan dokumen di koleksi `authors` memakai email
 * yang sama, sehingga saat login di admin nama penulis otomatis terpilih.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SERVICE_ACCOUNT = path.join(__dirname, "serviceAccountKey.json");

function arg(name) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : "";
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const admin = require("firebase-admin");
  const email = arg("email");
  const password = arg("password");
  const name = arg("name") || email.split("@")[0];
  const role = arg("role") || "Penulis";

  if (!email || !password) {
    console.error(
      'Pemakaian: node scripts/create-author-account.js --email=... --password=... --name="..." --role="..."'
    );
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password Firebase minimal 6 karakter.");
    process.exit(1);
  }

  const credentialPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    (fs.existsSync(SERVICE_ACCOUNT) ? SERVICE_ACCOUNT : "");
  if (!credentialPath) {
    console.error("scripts/serviceAccountKey.json tidak ditemukan.");
    process.exit(1);
  }

  const serviceAccount = require(path.resolve(credentialPath));
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || "dialogika-co",
    });
  }

  let user;
  try {
    user = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });
    console.log(`Akun login dibuat: ${user.uid}`);
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      user = await admin.auth().getUserByEmail(email);
      console.log(`Akun sudah ada, memakai UID: ${user.uid}`);
    } else {
      throw error;
    }
  }

  const authorId = slugify(name) || user.uid;
  await admin
    .firestore()
    .collection("authors")
    .doc(authorId)
    .set(
      {
        name,
        email,
        role,
        bio: "",
        photoURL: user.photoURL || "",
        active: true,
        uid: user.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  console.log(`Data penulis disimpan di authors/${authorId}.`);
  console.log("Penulis sudah bisa login di admin/index.html.");
}

main().catch((error) => {
  console.error("Gagal:", error.message);
  process.exit(1);
});
