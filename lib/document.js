/**
 * document.js — Assemble the complete standalone HTML document
 * from a resolved theme, accumulated parts, and queued charts.
 */

const path = require('path');
const jetpack = require('fs-jetpack');
const { generateCSS } = require('./styles');

const CHART_UMD_PATH = path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist', 'chart.umd.js');
const CHART_CDN_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4';

/**
 * Inline the Chart.js UMD bundle so the document is self-contained,
 * falling back to the CDN when node_modules isn't available.
 */
function chartLibrary() {
  const bundle = jetpack.read(CHART_UMD_PATH);
  if (!bundle) {
    return `<script src="${CHART_CDN_URL}"></script>`;
  }
  return `<script>${bundle}</script>`;
}

/**
 * Build the chart init script: applies theme typography to Chart.js
 * defaults, instantiates every queued chart with print-safe flags, and
 * signals completion for the export wait.
 */
function chartScript(theme, charts) {
  const inits = charts
    .map((chart) => {
      const config = JSON.stringify({
        type: chart.type,
        data: chart.data,
        options: { ...chart.options, responsive: false, animation: false },
      });
      return `new Chart(document.getElementById('${chart.id}'), ${config});`;
    })
    .join('\n');

  return `<script>
document.addEventListener('DOMContentLoaded', function() {
  Chart.defaults.font.family = "${theme.fonts.family}";
  Chart.defaults.color = "${theme.colors.text}";
  ${inits}
  // Signal that charts are rendered
  window.__chartsRendered = true;
});
</script>`;
}

/**
 * Assemble the complete HTML document
 * @param {object} input
 * @param {object} input.theme - Resolved theme
 * @param {string[]} input.parts - Accumulated HTML fragments
 * @param {object[]} input.charts - Queued charts ({ id, type, data, options })
 * @returns {string} Standalone HTML document
 */
function assembleHTML({ theme, parts, charts }) {
  const fontLink = theme.fonts.import
    ? `<link rel="stylesheet" href="${theme.fonts.import}">`
    : '';
  const hasCharts = charts.length > 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
${fontLink}
<style>${generateCSS(theme)}</style>
${hasCharts ? chartLibrary() : ''}
</head>
<body>
${parts.join('\n')}
${hasCharts ? chartScript(theme, charts) : ''}
</body>
</html>`;
}

module.exports = { assembleHTML };
