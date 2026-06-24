/**
 * project.js — Project factory: define a book's title, theme, and output
 * once, then mint pre-configured Ebook instances per build script.
 *
 * Optional `parts` array enables build() / buildAll() orchestration:
 *   parts: [{ name: 'Intro', build: require('./parts/intro') }, ...]
 */

const { Ebook } = require('./ebook');
const { resolveTheme, palette } = require('./theme');

/**
 * Derive a filesystem-safe filename from a part name.
 * "The Landscape" → "The_Landscape"
 * @param {string} name
 * @returns {string}
 */
function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Create a book project shared across build scripts.
 * @param {object} options
 * @param {string} [options.title] - Book title (cover, {title} footer token)
 * @param {object} [options.theme] - Theme overrides, deep-merged over defaults
 * @param {object} [options.output] - { dir = process.cwd(), html = false }
 * @param {Array<{name: string, build: function}>} [options.parts] - Ordered part definitions
 * @param {string[]} [options.render] - What buildAll() produces: ['parts', 'combined'] (default both)
 * @returns {object} { book, title, theme, colors, palette, parts, render, build, buildAll, buildCombined }
 */
function createProject(options = {}) {
  const { title = 'Ebook', theme = {}, output = {}, parts = [], render = ['parts', 'combined'] } = options;
  const resolved = resolveTheme(theme);

  const project = {
    title,
    theme: resolved,
    colors: resolved.colors,
    palette: (n) => palette(resolved, n),
    parts,
    render,
    book: () => new Ebook({ title, theme: resolved, output }),

    /**
     * Build a single part by name (case-insensitive, matches name or sanitized filename).
     * @param {string} name
     * @returns {Promise<string>} Absolute path of the written PDF
     */
    async build(name) {
      const match = name.toLowerCase();
      const part = parts.find((p) =>
        p.name.toLowerCase() === match
        || sanitizeFilename(p.name).toLowerCase() === match
      );
      if (!part) {
        const valid = parts.map((p) => p.name).join(', ');
        throw new Error(`Unknown part '${name}'. Valid parts: ${valid}`);
      }
      const book = project.book();
      await part.build(book);
      return book.save(`${sanitizeFilename(part.name)}.pdf`);
    },

    /**
     * Build according to the project's `render` config.
     * @param {string[]} [renderOverride] - Override the project's render setting
     * @returns {Promise<string[]>} Absolute paths of every written PDF
     */
    async buildAll(renderOverride) {
      const targets = renderOverride || render;
      const results = [];

      if (targets.includes('parts')) {
        const total = parts.length;
        for (let i = 0; i < total; i++) {
          const part = parts[i];
          console.log(`[${i + 1}/${total}] Building: ${part.name}`);
          const book = project.book();
          await part.build(book);
          results.push(await book.save(`${sanitizeFilename(part.name)}.pdf`));
        }
      }

      if (targets.includes('combined')) {
        results.push(await project.buildCombined());
      }

      return results;
    },

    /**
     * Build a single combined PDF from all parts.
     * @returns {Promise<string>} Absolute path of the combined PDF
     */
    async buildCombined() {
      console.log('Combining all parts...');
      const book = project.book();
      for (const part of parts) {
        await part.build(book);
      }
      return book.save(`${sanitizeFilename(title)}.pdf`);
    },
  };

  return project;
}

module.exports = { createProject };
