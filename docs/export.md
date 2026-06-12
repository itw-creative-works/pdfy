# Export Pipeline

`exportPDF(html, outputPath, { hasCharts, timeout })` in `lib/export.js` turns a complete HTML document string into a PDF using Playwright's headless Chromium. `Ebook.save()` calls it with `hasCharts` set automatically.

## Pipeline

1. **Launch** headless Chromium (`chromium.launch()`), open a page with an 816×1056 viewport (approximates Letter at 96 DPI).
2. **Load** the HTML via `page.setContent(html, { waitUntil: "networkidle" })`.
3. **Wait for charts** (only when `hasCharts: true`): polls for `window.__chartsRendered === true` — set by the chart init script that `Ebook.toHTML()` emits — up to `timeout` ms (default 15000), then waits a further 500 ms buffer. On timeout it logs a warning and proceeds with the export rather than failing.
4. **Print** with `page.pdf()`:

   | Setting | Value |
   |---|---|
   | `format` | `Letter` |
   | `printBackground` | `true` |
   | `margin` | `0.85in` top, `1in` bottom/left/right |
   | `displayHeaderFooter` | `false` (footers come from CSS `@page` rules, not Chromium's header/footer feature) |
   | `preferCSSPageSize` | `true` |

5. **Close** the browser.

## Named-page model

Pagination and footers are driven by CSS `@page` rules generated in `lib/styles.js`, not by Playwright options:

- `@page` (base): Letter size, margins matching the print call, no footer.
- `@page content`: bottom-center footer rendering `"<theme._footerText> <page counter>"` (or `"Page N"` when `_footerText` is unset) in 8pt slate.
- `@page cover`, `@page toc`, `@page part-opener`: footer explicitly suppressed.

Each structural block sets its named page (`.cover-page { page: cover }`, etc.). **All content-level elements** (`h3`, `p`, lists, callouts, tips, figures, sources, wrap-ups) **share `page: content`** — this matters because Chromium inserts a forced page break whenever adjacent elements belong to *different* named pages. Keeping every flow element on the same named page is what prevents spurious one-element pages.

Page breaks are then controlled explicitly:

- `.cover-page`, `.toc-page`, `.part-opener` → `page-break-after: always`
- `.chapter-header` → `page-break-before: always`
- Figures, callouts, tips → `page-break-inside: avoid`
- `.pageBreak()` builder method → inline `page-break-before: always` div

## Chart rendering

`Ebook.toHTML()` only includes chart machinery when at least one `.chart()` call was made:

- The Chart.js UMD bundle is **inlined** from `node_modules/chart.js/dist/chart.umd.js` so the document is self-contained and works offline; if that file is missing it falls back to the jsDelivr CDN (`chart.js@4`), which then requires network access during export.
- Each queued chart becomes a `new Chart(canvas, config)` call on `DOMContentLoaded`, with `responsive: false` and `animation: false` forced for deterministic sizing in print.
- After all charts initialize, the script sets `window.__chartsRendered = true` — the signal step 3 above waits on.

## Requirements & troubleshooting

- **Chromium binary**: the package `postinstall` runs `npx playwright install chromium`. If `save()` fails with *"Executable doesn't exist at …ms-playwright…"*, run that command manually.
- **"Chart rendering may not have completed" warning**: the chart wait timed out (heavy charts or a slow machine). The PDF still exports; raise `timeout` via `exportPDF` if charts come out blank.
- **Debugging layout**: pass `saveHTML: true` to `Ebook.save()` to write the intermediate HTML next to the PDF, then open it in a browser and use print preview.
