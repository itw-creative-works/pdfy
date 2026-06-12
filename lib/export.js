/**
 * export.js — Playwright-based PDF export.
 *
 * Renders HTML in a headless Chromium browser, waits for Chart.js
 * to finish rendering, then exports as a PDF with proper @page rules.
 */

const { chromium } = require("playwright");

/**
 * exportPDF — Render HTML string to PDF file.
 *
 * @param {string} html - Complete HTML document string
 * @param {string} outputPath - Where to save the PDF
 * @param {object} options
 * @param {boolean} options.hasCharts - If true, wait for charts to render
 * @param {number} options.timeout - Max wait time in ms (default: 15000)
 */
async function exportPDF(
  html,
  outputPath,
  { hasCharts = false, timeout = 15000 } = {}
) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to approximate letter-size rendering
  await page.setViewportSize({ width: 816, height: 1056 });

  // Load the HTML
  await page.setContent(html, { waitUntil: "networkidle" });

  // Wait for Chart.js to finish rendering if needed
  if (hasCharts) {
    try {
      await page.waitForFunction(() => window.__chartsRendered === true, {
        timeout,
      });
      // Small extra buffer for chart animations to complete
      await page.waitForTimeout(500);
    } catch (e) {
      console.warn(
        "Warning: Chart rendering may not have completed. Proceeding with export."
      );
    }
  }

  // Export PDF
  await page.pdf({
    path: outputPath,
    format: "Letter",
    printBackground: true,
    margin: {
      top: "0.85in",
      bottom: "1in",
      left: "1in",
      right: "1in",
    },
    displayHeaderFooter: false,
    preferCSSPageSize: true,
  });

  await browser.close();
}

module.exports = { exportPDF };
