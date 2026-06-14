/**
 * charts.js — Chart.js config builders with theme-aware defaults.
 * Consumed by Ebook#chart(); not part of the public API.
 */

const { merge, resolveColor, palette } = require('./theme');

const BAR_DEFAULTS = {
  borderRadius: 6,
  borderWidth: 0,
  maxBarThickness: 50,
};

// pdfy chart type → underlying Chart.js type
const CHART_JS_TYPES = {
  bar: 'bar',
  line: 'line',
  area: 'line',
  doughnut: 'doughnut',
  groupedBar: 'bar',
  radar: 'radar',
};

/**
 * Title plugin config shared by every chart type
 */
function titlePlugin(title) {
  if (!title) {
    return { display: false };
  }
  return { display: true, text: title, font: { size: 16, weight: 'bold' } };
}

/**
 * Axis scale config shared by every cartesian chart type
 */
function axisScale(label, grid, { beginAtZero = false } = {}) {
  return {
    title: label
      ? { display: true, text: label, font: { size: 11 } }
      : { display: false },
    grid,
    ...(beginAtZero ? { beginAtZero: true } : {}),
  };
}

/**
 * Resolve a series of colors (names or hex), falling back to the theme palette
 */
function seriesColors(theme, colors, count) {
  if (!colors) {
    return palette(theme, count);
  }
  return colors.map((color) => resolveColor(theme.colors, color));
}

/**
 * Resolve per-dataset colors, falling back to palette order
 */
function datasetColor(theme, dataset, index, fallback) {
  return resolveColor(theme.colors, dataset.color) || fallback[index];
}

/**
 * Chart builders — one per supported type.
 * Each receives (options, theme, grid) and returns a Chart.js config
 * ({ data, options }); shared render flags are applied at document level.
 */
const BUILDERS = {
  bar(options, theme, grid) {
    const { labels, data, colors, title, xLabel, yLabel, horizontal } = options;

    return {
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: seriesColors(theme, colors, data.length),
          ...BAR_DEFAULTS,
        }],
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        plugins: { title: titlePlugin(title), legend: { display: false } },
        scales: {
          x: axisScale(xLabel, { color: grid.faint, drawBorder: false }),
          y: axisScale(yLabel, { color: grid.soft }, { beginAtZero: true }),
        },
      },
    };
  },

  line(options, theme, grid) {
    const { labels, datasets, title, xLabel, yLabel } = options;
    const fallback = palette(theme, datasets.length);

    return {
      data: {
        labels,
        datasets: datasets.map((dataset, i) => {
          const color = datasetColor(theme, dataset, i, fallback);
          return {
            label: dataset.label,
            data: dataset.data,
            borderColor: color,
            backgroundColor: `${color}22`,
            fill: dataset.fill !== undefined ? dataset.fill : true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: color,
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            borderWidth: 3,
          };
        }),
      },
      options: {
        plugins: {
          title: titlePlugin(title),
          legend: { display: datasets.length > 1, position: 'top' },
        },
        scales: {
          x: axisScale(xLabel, { color: grid.faint }),
          y: axisScale(yLabel, { color: grid.soft }, { beginAtZero: true }),
        },
      },
    };
  },

  area(options, theme, grid) {
    const { labels, data, color, title, xLabel, yLabel } = options;

    return BUILDERS.line({
      labels,
      datasets: [{ label: title || '', data, color, fill: true }],
      title,
      xLabel,
      yLabel,
    }, theme, grid);
  },

  doughnut(options, theme) {
    const { labels, data, colors, title } = options;

    return {
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: seriesColors(theme, colors, data.length),
          borderColor: 'white',
          borderWidth: 3,
        }],
      },
      options: {
        cutout: '50%',
        plugins: {
          title: titlePlugin(title),
          legend: { display: true, position: 'right' },
        },
      },
    };
  },

  groupedBar(options, theme, grid) {
    const { labels, datasets, title, xLabel, yLabel } = options;
    const fallback = palette(theme, datasets.length);

    return {
      data: {
        labels,
        datasets: datasets.map((dataset, i) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: datasetColor(theme, dataset, i, fallback),
          ...BAR_DEFAULTS,
        })),
      },
      options: {
        plugins: {
          title: titlePlugin(title),
          legend: { display: true, position: 'top' },
        },
        scales: {
          x: axisScale(xLabel, { display: false }),
          y: axisScale(yLabel, { color: grid.soft }, { beginAtZero: true }),
        },
      },
    };
  },

  radar(options, theme, grid) {
    const { labels, datasets, title } = options;
    const fallback = palette(theme, datasets.length);

    return {
      data: {
        labels,
        datasets: datasets.map((dataset, i) => {
          const color = datasetColor(theme, dataset, i, fallback);
          return {
            label: dataset.label,
            data: dataset.data,
            borderColor: color,
            backgroundColor: `${color}33`,
            pointBackgroundColor: color,
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            borderWidth: 2,
          };
        }),
      },
      options: {
        plugins: {
          title: titlePlugin(title),
          legend: { display: datasets.length > 1 },
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: { color: grid.strong },
            ticks: { display: false },
          },
        },
      },
    };
  },
};

/**
 * Build a Chart.js config for a chart type, applying theme colors and the
 * design-system defaults. Unknown types throw with the list of valid types.
 * @param {string} type - One of: bar, line, area, doughnut, groupedBar, radar
 * @param {object} options - Type-specific options (labels, data/datasets,
 *   colors/color, title, xLabel, yLabel, horizontal, options escape hatch)
 * @param {object} theme - Resolved theme
 * @returns {object} { type, data, options } ready for the chart init script
 */
function buildChart(type, options, theme) {
  const builder = BUILDERS[type];
  if (!builder) {
    throw new Error(
      `Unknown chart type '${type}'. Valid types: ${Object.keys(BUILDERS).join(', ')}`
    );
  }

  // Grid line shades derived from the theme border color
  const grid = {
    faint: `${theme.colors.border}22`,
    soft: `${theme.colors.border}44`,
    strong: `${theme.colors.border}66`,
  };

  const config = builder(options, theme, grid);

  // Escape hatch: deep-merge raw Chart.js options on top of the generated ones
  if (options.options) {
    config.options = merge(config.options, options.options);
  }

  return {
    type: CHART_JS_TYPES[type],
    data: config.data,
    options: config.options,
  };
}

module.exports = { buildChart };
