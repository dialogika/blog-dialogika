/**
 * BlogGenerator.TemplateProcessor — Template Loader & Placeholder Replacer
 * ==========================================================================
 * Loads the blog template HTML and replaces {{PLACEHOLDER}} tokens
 * with actual data from the form.
 */
(function () {
  "use strict";

  var cachedTemplate = null;

  BlogGenerator.TemplateProcessor = {
    /**
     * Load the template HTML file via fetch.
     * Caches after first load for performance.
     * @returns {Promise<string>}
     */
    load: function () {
      if (cachedTemplate) {
        return Promise.resolve(cachedTemplate);
      }

      var path = BlogGenerator.Config.templatePath;
      return fetch(path)
        .then(function (response) {
          if (!response.ok) throw new Error("Failed to load template: " + path);
          return response.text();
        })
        .then(function (html) {
          cachedTemplate = html;
          return html;
        });
    },

    /**
     * Replace all {{PLACEHOLDER}} tokens in the template with data values.
     * @param {string} template — raw template HTML
     * @param {Object} data — key-value map of placeholder replacements
     * @returns {string} — final HTML
     */
    process: function (template, data) {
      var result = template;

      /* Replace each key in data that matches a {{KEY}} pattern */
      Object.keys(data).forEach(function (key) {
        var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "g");
        var value = data[key] !== undefined && data[key] !== null ? data[key] : "";
        result = result.replace(pattern, value);
      });

      /* Clean up any remaining unreplaced placeholders */
      result = result.replace(/\{\{[A-Z_]+\}\}/g, "");

      return result;
    },

    /**
     * Force reload template from disk (bypass cache).
     */
    clearCache: function () {
      cachedTemplate = null;
    },
  };
})();
