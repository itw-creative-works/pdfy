# pdfy — CLAUDE.md

> **Note for contributors and Claude:** this file is a short architectural overview only. Deep references — full API surface, theme keys, export behavior — live in `docs/*.md`. Add new long-form documentation there, not here.

## What this is

pdfy is an HTML-to-PDF ebook framework. A chainable `Ebook` builder accumulates HTML fragments and queued Chart.js charts, `generateCSS()` turns a theme object into a complete print design system, and `exportPDF()` renders the assembled document in headless Chromium (Playwright) and prints it to a Letter-format PDF.

## Architecture

```
lib/
  index.js    — public exports (Ebook, chart helpers, exportPDF, generateCSS)
  ebook.js    — Ebook class: builder methods push HTML strings into _parts,
                charts queue into _charts; toHTML() assembles the document
  charts.js   — Chart.js config factories with design-system defaults
  styles.js   — generateCSS(theme): theme object → full stylesheet,
                including @page rules and named pages
  export.js   — exportPDF(html, path, opts): Playwright Chromium render,
                waits for window.__chartsRendered, prints to PDF
```

Local sample/consumer projects live under `.samples/` (gitignored — not part of the repo).

## Key conventions

- **Builder methods return `this`** (chainable) and push raw HTML strings into `this._parts`. Only `save()` is async.
- **Charts render at export time.** `.chart()` inserts a `<canvas>` placeholder and queues the config; `toHTML()` inlines the Chart.js UMD bundle from `node_modules` (CDN fallback) plus an init script that sets `window.__chartsRendered = true`, which `exportPDF()` waits on.
- **Pagination is controlled by named CSS pages** (`cover`, `toc`, `part-opener`, `content`). All content-level elements share the `content` named page so Chromium doesn't insert spurious page breaks; only `content` pages show the footer/page counter. See [docs/export.md](docs/export.md).
- **Theme merging:** constructor options shallow-merge over `DEFAULT_THEME` in `ebook.js`, with a deep merge for `calloutText`. Theme reference: [docs/theming.md](docs/theming.md).
- **CommonJS** throughout (`require`/`module.exports`).

## Docs map

| File | Contents |
|---|---|
| [docs/api.md](docs/api.md) | Full `Ebook` method reference, chart helper signatures, `exportPDF`/`generateCSS` |
| [docs/theming.md](docs/theming.md) | Every theme key, defaults table, callout/tip style variants, fonts, footer text |
| [docs/export.md](docs/export.md) | Playwright pipeline, named-page model, chart wait/timeout behavior, PDF settings |

## Gotchas

- `playwright` downloads Chromium via the package `postinstall`; a fresh clone without it will fail at `save()` with "Executable doesn't exist".
- Builder methods do **not** escape HTML — text arguments are interpolated raw, which is what allows inline markup (`<strong>`, etc.) but means input is trusted.
- `theme.fontImport` exists in `DEFAULT_THEME` but is not currently injected into the document — the font stack falls back to locally installed fonts.
