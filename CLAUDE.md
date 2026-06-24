# pdfy — CLAUDE.md

> **Note for contributors and Claude:** this file is a short architectural overview only. Deep references — full API surface, theme schema, export behavior — live in `docs/*.md`. Add new long-form documentation there, not here.

## What this is

pdfy is an HTML-to-PDF ebook framework. `createProject()` defines a book's title, theme, and output once; `project.book()` mints chainable `Ebook` builders that accumulate HTML fragments and queued Chart.js charts; `assembleHTML()` builds a self-contained document from the resolved theme; `exportPDF()` renders it in headless Chromium (Playwright) and prints to PDF.

## Architecture

```
lib/
  index.js      — public exports: createProject, Ebook, exportPDF, generateCSS, DEFAULT_THEME
  theme.js      — DEFAULT_THEME + merge/resolveColor/resolveTheme/palette;
                  the SSOT for every visual decision (colors, palette, tints,
                  fonts, sizes, spacing, page, footer)
  project.js    — createProject() factory: shared config → pre-configured books;
                  optional parts[] with build(name) / buildAll() orchestration
  ebook.js      — Ebook builder: methods push HTML into _parts, charts queue
                  into _charts; one swatches() helper renders every color strip;
                  content components (stats/quote/table/checklist/steps/group)
  charts.js     — buildChart(type, options, theme): one entry point, shared
                  title/scale boilerplate, palette inheritance
  styles.js     — generateCSS(theme): tokens → full stylesheet incl. @page rules
  document.js   — assembleHTML(): HTML shell, web-font link, Chart.js UMD
                  inlining (CDN fallback), chart init script
  export.js     — exportPDF(html, path, { page, hasCharts, timeout }): Playwright
                  render, fonts.ready + chart waits, prints with theme page settings
test/
  smoke.js      — defaults-only end-to-end build (npm test)
```

Local sample/consumer projects live under `.samples/` (gitignored — not part of the repo). Sample scripts `require('pdfy')` via Node package self-reference (enabled by the `exports` field in `package.json`) — they have no `package.json` or `node_modules` of their own. Each book defines a `project.js` with a `parts` array; part modules live in `parts/` and export a `function(book)` that pushes content. `node project.js` builds all parts; `node project.js <name>` builds one.

## Key conventions

- **Theme is resolved once, then trusted.** `resolveTheme()` deep-merges overrides onto `DEFAULT_THEME` and resolves every color-name reference (palette entries, tint accent/text) to hex. It's **idempotent**, so project → Ebook double-resolution is safe. Downstream code never does name lookups except on user input (`resolveColor`).
- **Color names work anywhere a color is accepted** (chart `color`/`colors`, TOC `color`) — resolved against `theme.colors`, raw hex/rgb/hsl passes through.
- **Charts inherit the palette** when colors are omitted: series → `palette(theme, n)`, datasets → `palette(theme, datasets.length)[i]`. `book.chart(type, options)` is the only chart surface; unknown types/tints throw listing valid values.
- **Page settings have one home**: `theme.page` feeds both the CSS `@page` rules (styles.js) and Playwright's `page.pdf()` (export.js), with `preferCSSPageSize: true` keeping CSS authoritative.
- **Footer is a template**: `theme.footer.text` with `{title}` (substituted in the Ebook constructor) and `{page}` (CSS page counter) tokens.
- **Builder methods return `this`** and push raw HTML strings — text arguments are interpolated unescaped by design (trusted input; inline `<strong>` etc. works).
- **Pagination via named CSS pages** (`cover`, `toc`, `part-opener`, `content`); all content-level elements share `content` so Chromium doesn't insert spurious breaks. See [docs/export.md](docs/export.md).
- **CommonJS** throughout; **fs-jetpack** for file ops (`save()` auto-creates output dirs).

## Docs map

| File | Contents |
|---|---|
| [docs/api.md](docs/api.md) | `createProject`, full `Ebook` method reference, chart type/options matrix, `exportPDF`/`generateCSS` |
| [docs/theming.md](docs/theming.md) | Full theme schema with defaults, name-resolution rules, footer tokens, palette inheritance |
| [docs/export.md](docs/export.md) | Playwright pipeline, named-page model, font/chart waits, PDF settings |

## Gotchas

- `playwright` downloads Chromium via the package `postinstall`; a fresh clone without it fails at `save()` with "Executable doesn't exist".
- `theme.fonts.import` is injected as a `<link>` — exports need network access to load the web font (falls back to local fonts gracefully when offline).
- Custom `palette` arrays replace the default wholesale (arrays don't deep-merge).
