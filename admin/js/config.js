/**
 * BlogGenerator — Global Namespace & Configuration
 * =================================================
 * Single source of truth for constants used across all generator modules.
 */
(function () {
  "use strict";

  window.BlogGenerator = window.BlogGenerator || {};

  BlogGenerator.Config = {
    /* Base URL used for canonical links and JSON-LD */
    baseUrl: "https://dialogika.co/blog/",

    /* Badge types available in the editor toolbar */
    badges: ["Kritis", "Waspada"],

    /* Default categories shown in the category dropdown */
    categories: [
      "Public Speaking",
      "Stand Up Comedy",
      "Communication",
      "Self-Development",
      "Business",
      "Technology",
      "Travel",
      "Food",
    ],

    /* Social media links used in the generated template (static) */
    social: {
      twitter: "https://x.com/dialogika_co",
      facebook: "https://www.facebook.com/dialogika.co",
      instagram: "https://www.instagram.com/dialogika.co",
      linkedin: "https://www.linkedin.com/company/dialogika",
      youtube: "https://youtube.com/@dialogika_co",
      whatsapp: "https://wa.me/+6285162992597",
    },

    /* Template path (relative to admin/index.html) */
    templatePath: "template/blog-template.html",

    /* Default author */
    defaultAuthor: "Dialogika",
  };
})();
