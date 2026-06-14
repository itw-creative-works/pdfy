/**
 * project.js — Project factory: define a book's title, theme, and output
 * once, then mint pre-configured Ebook instances per build script.
 */

const { Ebook } = require('./ebook');
const { resolveTheme, palette } = require('./theme');

/**
 * Create a book project shared across build scripts
 * @param {object} options
 * @param {string} [options.title] - Book title (cover, {title} footer token)
 * @param {object} [options.theme] - Theme overrides, deep-merged over defaults
 * @param {object} [options.output] - { dir = process.cwd(), html = false }
 * @returns {object} { book, title, theme, colors, palette }
 */
function createProject(options = {}) {
  const { title = 'Ebook', theme = {}, output = {} } = options;
  const resolved = resolveTheme(theme);

  return {
    title,
    theme: resolved,
    colors: resolved.colors,
    palette: (n) => palette(resolved, n),
    book: () => new Ebook({ title, theme: resolved, output }),
  };
}

module.exports = { createProject };
