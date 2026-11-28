/**
 * Dialogika — Konfigurasi Firebase Web
 * =====================================
 * Isi nilai di bawah dengan config dari Firebase Console:
 *   Project Settings (ikon gerigi) → General → Your apps → SDK setup and configuration
 *
 * Nilai apiKey memang aman ditaruh di frontend (bukan rahasia).
 * Keamanan data diatur lewat Firestore Rules & Storage Rules, bukan lewat file ini.
 *
 * Proyek yang dipakai: dialogika-co
 */
window.DIALOGIKA_FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY_DI_SINI",
  authDomain: "dialogika-co.firebaseapp.com",
  projectId: "dialogika-co",
  storageBucket: "dialogika-co.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID_DI_SINI",
  appId: "PASTE_APP_ID_DI_SINI",
};
