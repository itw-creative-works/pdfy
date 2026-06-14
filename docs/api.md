# API Reference

All exports come from the package root:

```js
const { createProject, Ebook, exportPDF, generateCSS, DEFAULT_THEME } = require('pdfy');
```

For multi-part books, the intended pattern is one shared `project.js` per book plus one build script per part.

## `createProject(options)`

Define a book project once; every build script imports it.

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | string | `'Ebook'` | Book title — used by `.cover()` and the `{title}` footer token |
| `theme` | object | `{}` | Theme overrides, deep-merged over `DEFAULT_THEME` ([theming.md](theming.md)) |
| `output` | object | `{}` | `{ dir = process.cwd(), html = false }` — default save location and whether to write the HTML sidecar |

Returns:

| Property | Description |
|---|---|
| `book()` | A fresh, fully configured `Ebook` instance |
| `title` | The project title |
| `theme` | The resolved theme (all color names resolved to hex) |
| `colors` | `theme.colors` — for the rare raw-HTML escape hatch |
| `palette(n)` | First `n` palette colors (cycling) |

```js
// project.js
module.exports = createProject({
  title: 'Social Media Marketing Mastery in 2026',
  theme: { footer: { text: '{title}  |  Page {page}' } },
  output: { dir: `${__dirname}/output`, html: true },
});

// build_part1.js
const project = require('./project');
const book = project.book();
```

## `new Ebook(options)`

Same options as `createProject` (`title`, `theme`, `output`) — use directly for single-script books. All builder methods return `this` for chaining unless noted.

### Theme access

- `book.colors` → resolved `theme.colors` (e.g. `book.colors.primary`)
- `book.palette(n)` → first `n` palette colors, cycling

### Front matter

#### `.cover({ title, subtitle, edition })`
Full-page cover: palette swatch bars, dark title block, optional subtitle and edition line. `title` overrides the project title for display (e.g. a shorter cover variant).

#### `.toc(sections)`
Table of contents page. `sections` is an array of:
- `{ type: 'part', num, title }` — bold part heading
- `{ type: 'chapter', num, title, color? }` — chapter entry with a colored dot. `color` accepts a theme color name or hex; **when omitted, dots auto-cycle the palette, restarting at every part**
- `{ type: 'spacer' }` — vertical gap

### Structure

#### `.partOpener(num, title, subtitle = '')`
Full-page part divider — palette bars, part number, large title, optional italic subtitle.

#### `.chapter(num, title)`
Chapter header — palette bar, `CHAPTER N` eyebrow, large title, rule. Forces a page break before it.

### Content blocks

| Method | Renders |
|---|---|
| `.h3(text)` | Section heading (`theme.colors.heading`) |
| `.p(text)` | Justified paragraph |
| `.note(text)` | Small italic centered note (e.g. after the TOC) |
| `.html(raw)` | Raw HTML, inserted verbatim |
| `.bullets(items)` | `<ul>` from an array of strings |
| `.figure(src, caption, { narrow })` | Image figure with optional caption; `narrow: true` caps width at 65% |
| `.callout(text, { style, label })` | Tinted callout box. `style` defaults to `'lavender'`, `label` to `'KEY INSIGHT'` |
| `.tip(text, { style })` | "PRO TIP" box. `style` defaults to `'mint'` |
| `.stats(items)` | Row of big-number stat cards; `items` is `[{ value, label, color? }]`, colors cycle the palette |
| `.quote(text, { attribution })` | Centered pull quote with oversized quote mark |
| `.table(headers, rows)` | Comparison table — uppercase header row, zebra striping, bold first column |
| `.checklist(items, { color })` | Checkmark-badged action list (badge defaults to `'green'`) |
| `.steps(items)` | Numbered step sequence; `items` is `[{ title?, text, color? }]`, numbers cycle the palette |
| `.group(build)` | Keep-together wrapper — everything pushed inside `build(book)` stays on one page |
| `.sources(links)` | Sources block; `links` is an array of `[label, url]` pairs or `{ label, url }` objects |
| `.wrapup(title, text)` | End-of-part wrap-up section with top rule |
| `.pageBreak()` / `.spacer(height)` / `.hr()` | Forced break, vertical gap, horizontal rule |

`style` accepts the five tint variants — `lavender`, `blush`, `sky`, `cream`, `mint` — and throws listing the valid ones on a typo. Text arguments are interpolated as raw HTML (trusted input; inline `<strong>` works).

```js
book.stats([
  { value: '2.7B', label: 'YouTube Monthly Users' },
  { value: '80%', label: 'Of Social Content Is Video' },
  { value: '$185B', label: 'Social Commerce by 2026', color: 'green' },
]);

book.steps([
  { title: 'Foundation — Days 1-30', text: 'Audit, define pillars, first batch.' },
  { title: 'Momentum — Days 31-60', text: 'Increase cadence, engage daily.' },
]);

book.group((b) => {
  b.h3('The Cheat Sheet');
  b.p('Heading, lead-in, and table stay on one page:');
  b.table(['Platform', 'Cadence'], [['TikTok', '1/day'], ['YouTube', '1/wk']]);
});
```

### Charts

#### `.chart(type, options)`

One call covers every chart type. `colors`/`color` accept theme color names or hex and **default to the theme palette** when omitted.

| Type | Data options | Extras |
|---|---|---|
| `'bar'` | `labels`, `data`, `colors?` | `horizontal?`, `xLabel?`, `yLabel?` |
| `'line'` | `labels`, `datasets` (`[{ label, data, color?, fill? }]`) | `xLabel?`, `yLabel?` |
| `'area'` | `labels`, `data`, `color?` | `xLabel?`, `yLabel?` |
| `'doughnut'` | `labels`, `data`, `colors?` | — |
| `'groupedBar'` | `labels`, `datasets` (`[{ label, data, color? }]`) | `xLabel?`, `yLabel?` |
| `'radar'` | `labels`, `datasets` (`[{ label, data, color? }]`) | — |

Shared options for all types: `title?`, `caption?` (figure caption), `narrow?` (65% width), and `options?` — a raw Chart.js options object deep-merged onto the generated config as an escape hatch.

Unknown types throw listing the valid ones. Charts render at export time with `responsive: false` / `animation: false` for deterministic print output.

```js
book.chart('bar', {
  labels: ['TikTok', 'Instagram', 'YouTube'],
  data: [2.0, 2.4, 2.7],                       // colors: palette defaults
  title: 'Platform MAU (Billions)',
  horizontal: true,
  caption: 'Figure 1.1 — Monthly active users.',
});

book.chart('line', {
  labels: ['2024', '2025', '2026'],
  datasets: [
    { label: 'Reach', data: [10, 8, 6], color: 'primary' },     // theme color name
    { label: 'Algorithmic', data: [40, 70, 90], color: 'secondary' },
  ],
});
```

### Build & save

#### `.toHTML()` → `string`
Assembles the complete standalone HTML document: web-font link, generated CSS, accumulated parts, and — when charts were queued — the inlined Chart.js UMD bundle plus init script.

#### `await .save(filename, overrides = {})` → `string` (PDF path)
Renders and writes the PDF using the book's `output` config. `overrides` (`{ dir, html }`) adjust a single save. The output directory is created automatically if missing.

## `exportPDF(html, outputPath, options)`

Standalone HTML-string-to-PDF export (used internally by `.save()`). See [export.md](export.md).

| Option | Default | Description |
|---|---|---|
| `page` | `DEFAULT_THEME.page` | `{ format, margins }` for the print call |
| `hasCharts` | `false` | Wait for `window.__chartsRendered === true` before printing |
| `timeout` | `15000` | Max chart-wait in ms; logs a warning and proceeds on timeout |

## `generateCSS(theme)`

Returns the complete design-system stylesheet for a **resolved** theme. `Ebook` calls this internally; call it directly only when assembling HTML yourself (resolve first via `DEFAULT_THEME` or a project's `theme`).
