# API Reference

All exports come from the package root:

```js
const {
  Ebook,
  barChart, lineChart, doughnutChart, groupedBarChart, radarChart, areaChart,
  exportPDF,
  generateCSS,
} = require('pdfy');
```

## `new Ebook(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | `"Ebook"` | Book title, used by `.cover()` (uppercased) |
| `theme` | object | `{}` | Theme overrides, shallow-merged over the default theme (`calloutText` is deep-merged). See [theming.md](theming.md). |

All builder methods return `this` for chaining unless noted.

### Front matter

#### `.cover({ subtitle, edition })`
Full-page cover: decorative color bars, navy title block with the uppercased book title, optional subtitle and edition line (e.g. `"2026 EDITION"`).

#### `.toc(sections)`
Table of contents page. `sections` is an array of:
- `{ type: "part", num, title }` — bold part heading
- `{ type: "chapter", num, title, color }` — indented chapter entry with a colored dot (`color` defaults to `theme.primary`)
- `{ type: "spacer" }` — 10px vertical gap

### Structure

#### `.partOpener(num, title, subtitle = "")`
Full-page part divider — centered part number, large title, optional italic subtitle.

#### `.chapter(num, title)`
Chapter header — color bar, `CHAPTER N` eyebrow, large title, rule. Forces a page break before it.

### Content blocks

| Method | Renders |
|---|---|
| `.h3(text)` | Section heading (colored with `theme.headingColor`) |
| `.p(text)` | Justified paragraph |
| `.html(raw)` | Raw HTML, inserted verbatim |
| `.bullets(items)` | `<ul>` from an array of strings |
| `.figure(src, caption, { narrow })` | Image figure with optional caption; `narrow: true` caps width at 65% |
| `.callout(text, { style, label })` | Tinted callout box. `style` defaults to `"lavender"`, `label` to `"KEY INSIGHT"` |
| `.tip(text, { style })` | "PRO TIP" box. `style` defaults to `"mint"` |
| `.sources(links)` | Sources block; `links` is an array of `[label, url]` pairs or `{ label, url }` objects |
| `.wrapup(title, text)` | End-of-chapter wrap-up section with top rule |
| `.pageBreak()` | Forced page break |
| `.spacer(height = "20px")` | Vertical gap |
| `.hr()` | Horizontal rule |

Callout/tip `style` accepts any of the five tint variants: `lavender`, `blush`, `sky`, `cream`, `mint` ([theming.md](theming.md#callout--tip-variants)).

Text arguments are interpolated as raw HTML — inline markup like `<strong>` works, and input is trusted (not escaped).

### Charts

#### `.chart(type, config, { caption, narrow })`
Inserts a `<canvas>` placeholder (750×450) and queues the chart for render at export time.

- `type`: `"bar" | "line" | "doughnut" | "pie" | "radar" | "polarArea" | "horizontalBar"` (`horizontalBar` is translated to a bar chart with `indexAxis: "y"`)
- `config`: a Chart.js config object — usually produced by one of the helpers below
- `caption` / `narrow`: same as `.figure()`

Charts are forced to `responsive: false` and `animation: false` for deterministic print rendering.

### Build & save

#### `.toHTML()` → `string`
Assembles the complete standalone HTML document: generated CSS, the accumulated parts, and — if any charts were queued — the Chart.js UMD bundle inlined from `node_modules` (falling back to the jsDelivr CDN) plus an init script. The init script sets `window.__chartsRendered = true` when done, which the exporter waits on.

#### `await .save(filename, { outputDir, saveHTML })` → `string` (PDF path)
Renders and writes the PDF.

| Option | Default | Description |
|---|---|---|
| `outputDir` | `process.cwd()` | Output directory |
| `saveHTML` | `false` | Also write the intermediate `.html` next to the PDF (same basename) |

## Chart helpers (`charts.js`)

Each helper returns a Chart.js config object to pass to `.chart()`. All apply design-system defaults (rounded bars, subtle grids, no clutter). `title`, `xLabel`, `yLabel` are optional throughout.

| Helper | Signature | Notes |
|---|---|---|
| `barChart` | `({ labels, data, colors, title, xLabel, yLabel, horizontal })` | `horizontal: true` flips the axis; `colors` defaults to blue |
| `lineChart` | `({ labels, datasets, title, xLabel, yLabel })` | `datasets`: `[{ label, data, color, fill? }]`; area fill on by default |
| `doughnutChart` | `({ labels, data, colors, title })` | 50% cutout, legend on the right |
| `groupedBarChart` | `({ labels, datasets, title, xLabel, yLabel })` | `datasets`: `[{ label, data, color }]`, legend on top |
| `radarChart` | `({ labels, datasets, title })` | `datasets`: `[{ label, data, color }]` |
| `areaChart` | `({ labels, data, color, title, xLabel, yLabel })` | Sugar for a single filled `lineChart` |

```js
book.chart('bar', barChart({
  labels: ['TikTok', 'Instagram', 'YouTube'],
  data: [2.0, 2.4, 2.7],
  colors: ['#A78BFA', '#F472B6', '#FF6B6B'],
  title: 'Platform MAU (Billions)',
}));
```

## `exportPDF(html, outputPath, options)`

Standalone HTML-string-to-PDF export (used internally by `.save()`, usable directly). See [export.md](export.md) for the full pipeline and PDF settings.

| Option | Default | Description |
|---|---|---|
| `hasCharts` | `false` | Wait for `window.__chartsRendered === true` before printing |
| `timeout` | `15000` | Max chart-wait in ms; on timeout a warning is logged and export proceeds |

## `generateCSS(theme)`

Returns the complete design-system stylesheet for a (fully populated) theme object. `Ebook` calls this internally with its merged theme; call it directly only if you're assembling HTML yourself. Theme shape: [theming.md](theming.md).
