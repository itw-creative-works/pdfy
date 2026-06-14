/**
 * pdfy — HTML-to-PDF ebook framework.
 *
 * const { createProject } = require('pdfy');
 * const project = createProject({ title: 'My Book', theme: {...} });
 * const book = project.book();
 */

const { createProject } = require('./project');
const { Ebook } = require('./ebook');
const { exportPDF } = require('./export');
const { generateCSS } = require('./styles');
const { DEFAULT_THEME } = require('./theme');

module.exports = {
  createProject,
  Ebook,
  exportPDF,
  generateCSS,
  DEFAULT_THEME,
};
