/**
 * BlogGenerator.Schema — JSON-LD Structured Data Generator
 * =========================================================
 */
(function () {
  "use strict";

  var esc = BlogGenerator.Utils.escapeJson;

  BlogGenerator.Schema = {
    /**
     * Generate Article JSON-LD.
     * @param {Object} data — { title, description, image, author, publishedDate, modifiedDate, canonicalUrl }
     * @returns {string} — JSON-LD string ready for <script> tag
     */
    generateArticleSchema: function (data) {
      var obj = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "image": data.image,
        "author": {
          "@type": "Organization",
          "name": "Dialogika",
          "url": "https://dialogika.co"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Dialogika",
          "logo": {
            "@type": "ImageObject",
            "url": "https://dialogika.co/assets/images/dialogikalogo.png"
          }
        },
        "datePublished": data.publishedDateIso,
        "dateModified": data.modifiedDateIso || data.publishedDateIso,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": data.canonicalUrl
        }
      };
      return JSON.stringify(obj, null, 2);
    },

    /**
     * Generate FAQPage JSON-LD.
     * @param {Array} faqs — [{ question, answer }]
     * @returns {string} — JSON-LD string
     */
    generateFaqSchema: function (faqs) {
      if (!faqs || faqs.length === 0) return "";

      var obj = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(function (faq) {
          return {
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          };
        })
      };
      return JSON.stringify(obj, null, 2);
    },

    /**
     * Generate BreadcrumbList JSON-LD.
     * @param {string} category — e.g. "Public Speaking"
     * @param {string} title — article title
     * @returns {string} — JSON-LD string
     */
    generateBreadcrumbSchema: function (category, title) {
      var catSlug = BlogGenerator.Utils.slugify(category);
      var obj = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://dialogika.co"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category,
            "item": "https://dialogika.co/kategori/" + catSlug
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title
          }
        ]
      };
      return JSON.stringify(obj, null, 2);
    },
  };
})();
