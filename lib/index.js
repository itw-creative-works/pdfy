/**
 * pdfy — HTML-to-PDF ebook framework.
 *
 * const { Ebook, barChart, lineChart, doughnutChart } = require('pdfy');
 */

const { Ebook } = require("./ebook");
const {
  barChart,
  lineChart,
  doughnutChart,
  groupedBarChart,
  radarChart,
  areaChart,
} = require("./charts");
const { exportPDF } = require("./export");
const { generateCSS } = require("./styles");

module.exports = {
  Ebook,
  barChart,
  lineChart,
  doughnutChart,
  groupedBarChart,
  radarChart,
  areaChart,
  exportPDF,
  generateCSS,
};
