# Export Pipeline

`exportPDF(html, outputPath, { page, hasCharts, timeout })` in `lib/export.js` turns a complete HTML document string into a PDF using Playwright's headless Chromium. `Ebook.save()` calls it with the theme's page settings and `hasCharts` set automatically.

## Pipeline

1. **Launch** headless Chromium, open a page with an 816×1056 viewport (approximates Letter at 96 DPI).
2. **Load** the HTML via `setContent(html, { waitUntil: 'networkidle' })` — this also fetches the web-font stylesheet when `theme.fonts.import` is set.
3. **Wait for charts** (only when `hasCharts: true`): polls for `window.__chartsRendered === true` — set by the chart init script that `assembleHTML()` emits — up to `timeout` ms (default 15000), then a 500 ms settle buffer. On timeout it logs a warning and proceeds rather than failing.
4. **Wait for fonts**: `document.fonts.ready`, so the injected web font actually renders in the print.
5. **Print** with `page.pdf()`:

   | Setting | Value |
   |---|---|
   | `format` | `page.format` (theme, default `Letter`) |
   | `margin` | `page.margins` (theme — same object that feeds the CSS `@page` rule) |
   | `printBackground` | `true` |
   | `displayHeaderFooter` | `false` (footers come from CSS `@page` rules) |
   | `preferCSSPageSize` | `true` (CSS stays authoritative) |

6. **Close** the browser.

`theme.page` is the single home for page geometry — `generateCSS()` writes it into `@page` and `exportPDF()` passes it to Playwright, so the two can't drift.

## Named-page model

Pagination and footers are driven by CSS `@page` rules generated in `lib/styles.js`:

- `@page` (base): theme size/margins, no footer.
- `@page content`: bottom-center footer rendered from the `theme.footer.text` template — `{page}` becomes `counter(page)`, `{title}` was substituted with the book title up front.
- `@page cover`, `@page toc`, `@page part-opener`: footer explicitly suppressed.

Each structural block sets its named page (`.cover-page { page: cover }`, etc.). **All content-level elements** (`h3`, `p`, lists, callouts, tips, figures, sources, wrap-ups, notes) **share `page: content`** — Chromium inserts a forced page break whenever adjacent elements belong to *different* named pages, so keeping every flow element on one named page is what prevents spurious one-element pages.

Page breaks are then controlled explicitly: cover/TOC/part-opener force `page-break-after`, chapter headers force `page-break-before`, and figures/callouts/tips/stats/quotes/tables/sources/wrap-ups avoid internal breaks. `book.group()` wraps arbitrary runs of blocks in a keep-together container.

Full-page sections (cover, part openers) are sized to the printable page height — computed from `theme.page` via a format-dimensions map (Letter, Legal, Tabloid, A3/A4/A5; 9in fallback for unknown formats or non-inch margins) — so their content centers vertically on the physical page.

## Chart rendering

`assembleHTML()` only includes chart machinery when at least one `.chart()` call was made:

- The Chart.js UMD bundle is **inlined** from `node_modules/chart.js/dist/chart.umd.js` so the document is self-contained; if missing it falls back to the jsDelivr CDN (requires network at export time).
- `Chart.defaults` get the theme's font family and text color, then each queued chart becomes a `new Chart(canvas, config)` call on `DOMContentLoaded` with `responsive: false` / `animation: false` forced for deterministic print sizing.
- After all charts initialize, the script sets `window.__chartsRendered = true` — the signal step 3 waits on.

## Requirements & troubleshooting

- **Chromium binary**: the package `postinstall` runs `npx playwright install chromium`. If `save()` fails with *"Executable doesn't exist at …ms-playwright…"*, run that command manually.
- **"Chart rendering may not have completed" warning**: the chart wait timed out (heavy charts or a slow machine). The PDF still exports; raise `timeout` if charts come out blank.
- **Web fonts offline**: with no network, the font `<link>` fails silently and the stack falls back to local fonts; the export still succeeds.
- **Debugging layout**: set `output: { html: true }` (or `save(file, { html: true })`) to write the intermediate HTML next to the PDF, then open it in a browser and use print preview.
