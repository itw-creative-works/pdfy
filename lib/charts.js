/**
 * charts.js — Chart.js config helpers.
 *
 * These return Chart.js config objects you pass to book.chart().
 * They apply the ebook design system defaults (clean, playful, no grid clutter).
 *
 * Usage:
 *   const { barChart, lineChart, doughnutChart } = require('./ebook-kit/charts');
 *
 *   book.chart("bar", barChart({
 *     labels: ["TikTok", "Instagram", "YouTube"],
 *     data: [2.0, 2.4, 2.7],
 *     colors: ["#A78BFA", "#F472B6", "#FF6B6B"],
 *     title: "Platform MAU (Billions)"
 *   }));
 */

const DEFAULTS = {
  borderRadius: 6,
  borderWidth: 0,
  maxBarThickness: 50,
};

/**
 * barChart — Vertical or horizontal bar chart.
 */
function barChart({
  labels,
  data,
  colors,
  title,
  xLabel,
  yLabel,
  horizontal = false,
}) {
  return {
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors || data.map(() => "#60A5FA"),
          borderRadius: DEFAULTS.borderRadius,
          borderWidth: DEFAULTS.borderWidth,
          maxBarThickness: DEFAULTS.maxBarThickness,
        },
      ],
    },
    options: {
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" },
            }
          : { display: false },
        legend: { display: false },
      },
      scales: {
        x: {
          title: xLabel
            ? { display: true, text: xLabel, font: { size: 11 } }
            : { display: false },
          grid: { color: "#e2e8f022", drawBorder: false },
        },
        y: {
          title: yLabel
            ? { display: true, text: yLabel, font: { size: 11 } }
            : { display: false },
          grid: { color: "#e2e8f044" },
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * lineChart — Single or multi-line chart with area fill.
 */
function lineChart({ labels, datasets, title, xLabel, yLabel }) {
  /**
   * datasets: array of { label, data, color, fill? }
   */
  return {
    data: {
      labels,
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color,
        backgroundColor: ds.color + "22",
        fill: ds.fill !== undefined ? ds.fill : true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: ds.color,
        pointBorderColor: "white",
        pointBorderWidth: 2,
        borderWidth: 3,
      })),
    },
    options: {
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" },
            }
          : { display: false },
        legend: { display: datasets.length > 1, position: "top" },
      },
      scales: {
        x: {
          title: xLabel
            ? { display: true, text: xLabel, font: { size: 11 } }
            : { display: false },
          grid: { color: "#e2e8f022" },
        },
        y: {
          title: yLabel
            ? { display: true, text: yLabel, font: { size: 11 } }
            : { display: false },
          grid: { color: "#e2e8f044" },
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * doughnutChart — Donut/pie chart.
 */
function doughnutChart({ labels, data, colors, title, centerText }) {
  return {
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: "white",
          borderWidth: 3,
        },
      ],
    },
    options: {
      cutout: "50%",
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" },
            }
          : { display: false },
        legend: { display: true, position: "right" },
      },
    },
  };
}

/**
 * groupedBarChart — Multiple datasets side by side.
 */
function groupedBarChart({ labels, datasets, title, xLabel, yLabel }) {
  /**
   * datasets: array of { label, data, color }
   */
  return {
    data: {
      labels,
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ds.color,
        borderRadius: DEFAULTS.borderRadius,
        borderWidth: DEFAULTS.borderWidth,
        maxBarThickness: DEFAULTS.maxBarThickness,
      })),
    },
    options: {
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" },
            }
          : { display: false },
        legend: { display: true, position: "top" },
      },
      scales: {
        x: {
          title: xLabel
            ? { display: true, text: xLabel, font: { size: 11 } }
            : { display: false },
          grid: { display: false },
        },
        y: {
          title: yLabel
            ? { display: true, text: yLabel, font: { size: 11 } }
            : { display: false },
          grid: { color: "#e2e8f044" },
          beginAtZero: true,
        },
      },
    },
  };
}

/**
 * radarChart — Radar/spider chart.
 */
function radarChart({ labels, datasets, title }) {
  return {
    data: {
      labels,
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color,
        backgroundColor: ds.color + "33",
        pointBackgroundColor: ds.color,
        pointBorderColor: "white",
        pointBorderWidth: 2,
        borderWidth: 2,
      })),
    },
    options: {
      plugins: {
        title: title
          ? {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" },
            }
          : { display: false },
        legend: { display: datasets.length > 1 },
      },
      scales: {
        r: {
          beginAtZero: true,
          grid: { color: "#e2e8f066" },
          ticks: { display: false },
        },
      },
    },
  };
}

/**
 * areaChart — Filled area chart (just a line chart with fill).
 */
function areaChart({ labels, data, color, title, xLabel, yLabel }) {
  return lineChart({
    labels,
    datasets: [{ label: title || "", data, color, fill: true }],
    title,
    xLabel,
    yLabel,
  });
}

module.exports = {
  barChart,
  lineChart,
  doughnutChart,
  groupedBarChart,
  radarChart,
  areaChart,
};
