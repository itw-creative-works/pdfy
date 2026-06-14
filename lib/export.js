/**
 * export.js — Playwright-based PDF export.
 * Renders HTML in headless Chromium, waits for web fonts and Chart.js,
 * then prints with the theme's page settings.
 */

const { chromium } = require('playwright');
const { DEFAULT_THEME } = require('./theme');

/**
 * Render an HTML string to a PDF file
 * @param {string} html - Complete HTML document string
 * @param {string} outputPath - Where to save the PDF
 * @param {object} options
 * @param {object} [options.page] - Theme page settings ({ format, margins })
 * @param {boolean} [options.hasCharts] - Wait for charts to render
 * @param {number} [options.timeout] - Max chart wait in ms
 */
async function exportPDF(
  html,
  outputPath,
  { page = DEFAULT_THEME.page, hasCharts = false, timeout = 15000 } = {}
) {
  const browser = await chromium.launch();
  const browserPage = await browser.newPage();

  // Approximate letter-size rendering for layout
  await browserPage.setViewportSize({ width: 816, height: 1056 });

  await browserPage.setContent(html, { waitUntil: 'networkidle' });

  // Wait for Chart.js to finish rendering when charts are present
  if (hasCharts) {
    try {
      await browserPage.waitForFunction(() => window.__chartsRendered === true, { timeout });
      // Small extra buffer for canvas paints to settle
      await browserPage.waitForTimeout(500);
    } catch (e) {
      console.warn('Warning: Chart rendering may not have completed. Proceeding with export.');
    }
  }

  // Make sure web fonts are loaded before printing
  await browserPage.evaluate(() => document.fonts.ready);

  await browserPage.pdf({
    path: outputPath,
    format: page.format,
    printBackground: true,
    margin: page.margins,
    displayHeaderFooter: false,
    preferCSSPageSize: true,
  });

  await browser.close();
}

module.exports = { exportPDF };
