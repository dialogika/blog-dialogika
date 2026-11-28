/*
 * Konfigurasi Tailwind bersama untuk tampilan baru (UI v2).
 * Dimuat SETELAH script CDN Tailwind di setiap halaman yang memakai UI v2,
 * jadi warna/font/spacing cukup diubah di satu file ini.
 *
 * Halaman lama (artikel & kategori yang masih memakai Bootstrap + style.css) memuat file ini
 * dengan atribut data-scope=".dlg". Dalam mode itu Tailwind hanya berlaku di dalam header
 * bersama (.dlg) dan "preflight" global dimatikan, sehingga isi artikel tidak berubah.
 */
window.tailwind = window.tailwind || {};
(function () {
var script = document.currentScript;
var scope = script && script.getAttribute("data-scope");
tailwind.config = {
  // "collapse" dipakai Bootstrap di footer bawaan; jangan dibuat ulang oleh Tailwind
  blocklist: ["collapse"],
  // ".container" milik Bootstrap (footer & halaman lama); komponen container Tailwind tidak dipakai
  corePlugins: { container: false },
  theme: {
    extend: {
      colors: {
        surface: "#f7f9fb",
        "surface-card": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#434655",
        outline: "#747686",
        "outline-variant": "#c4c5d7",
        "border-subtle": "#e2e8f0",
        primary: "#0037b0",
        // alias "brand" = primary; dipakai header agar tidak bentrok dengan .text-primary/.bg-primary Bootstrap
        brand: "#0037b0",
        "primary-container": "#1d4ed8",
        "on-primary": "#ffffff",
        "on-primary-container": "#cad3ff",
        "inverse-primary": "#b7c4ff",
        "royal-blue-hover": "#0a58ca",
        "royal-blue-subtle": "#eff6ff",
        "navy-light": "#1e293b",
        "navy-muted": "#64748b",
        "accent-yellow": "#ffc107",
        error: "#ba1a1a",
        whatsapp: "#25d366",
        "badge-speaking": "#dbeafe",
        "badge-speaking-text": "#1e40af",
        "badge-comm": "#fef3c7",
        "badge-comm-text": "#92400e",
        "badge-mind": "#ede9fe",
        "badge-mind-text": "#5b21b6",
      },
      spacing: {
        gutter: "1.25rem",
        "gutter-desktop": "1.75rem",
        margin: "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "space-2xl": "5rem",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
        // alias sesuai nama di file desain (dipakai renderer FAQ/sumber & template)
        "body-default": ["Inter", "sans-serif"],
        "body-small": ["Inter", "sans-serif"],
        "body-lead": ["Inter", "sans-serif"],
        "label-meta": ["Inter", "sans-serif"],
        "label-pill": ["Plus Jakarta Sans", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
      },
      fontSize: {
        "body-small": ["13px", { lineHeight: "20px" }],
        "body-default": ["15px", { lineHeight: "24px" }],
        "body-lead": ["18px", { lineHeight: "28px" }],
        "label-meta": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-pill": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "700" }],
        "headline-sm": ["16px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-xl-mobile": ["26px", { lineHeight: "34px", letterSpacing: "-0.015em", fontWeight: "700" }],
      },
    },
  },
};
if (scope) {
  tailwind.config.important = scope;
  tailwind.config.corePlugins.preflight = false;
}
})();
