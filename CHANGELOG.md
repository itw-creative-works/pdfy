# CHANGELOG

## Changelog Categories
- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

## [2.1.0] - 2026-06-23
### Added
- `parts` option on `createProject({ parts: [{ name, build }] })` — define an ordered set of parts once and orchestrate the whole book from a single `project.js`.
- `project.build(name)` builds one part to its own PDF, matching the name case-insensitively against both the part name and its sanitized filename (throws listing valid parts on a miss).
- `project.buildAll(renderOverride)` and `render` config (defaults to `['parts', 'combined']`) — builds each part to its own PDF and/or one combined PDF of all parts in order.
- `project.buildCombined()` — build a single combined PDF from every part.
- `npx pdfy` CLI (`bin/pdfy.js`, exposed via the package `bin` field): auto-discovers `project.js` and builds all parts; `npx pdfy <name>` builds one part.

### Changed
- `.gitignore` now excludes macOS `.DS_Store` metadata files.

## [2.0.0] - 2026-06-14
### BREAKING
- Theme reshaped into structured tokens: `colors` (role names `text`/`muted`/`heading`/`link` replace `navy`/`slate`/`headingColor`), `palette`, `tints` (replaces flat tint keys + `calloutText`), `fonts`, `sizes`, `spacing`, `page`, `footer`.
- `_footerText` removed — footers are now a `theme.footer.text` template with `{title}` and `{page}` tokens.
- Chart factory exports (`barChart`, `lineChart`, `doughnutChart`, `groupedBarChart`, `radarChart`, `areaChart`) removed — `book.chart(type, options)` is the only chart surface; `caption`/`narrow` moved into the options object; `horizontalBar` type dropped (`horizontal: true` on `bar`); `groupedBar` and `area` are now first-class types.
- `Ebook.save(filename, { outputDir, saveHTML })` → `save(filename, { dir, html })`, defaulting from the constructor's `output` option.

### Added
- `createProject({ title, theme, output })` — define a book once, mint pre-configured builders via `project.book()` in every part script; exposes `theme`/`colors`/`palette(n)`.
- Theme color names accepted anywhere a color is (charts, TOC dots, tints) — resolved against `theme.colors`.
- Palette inheritance: charts and TOC chapter dots auto-color from `theme.palette` when colors are omitted (TOC cycling restarts at each part).
- `.note(text)` content method (replaces the raw-HTML `.toc-note` workaround).
- `.cover({ title })` display override for a shorter cover title.
- Theme access on instances: `book.colors`, `book.palette(n)`.
- Raw Chart.js escape hatch: `options.options` deep-merges onto generated chart configs.
- Self-correcting errors: unknown chart types and tint styles throw listing valid values.
- `save()` auto-creates missing output directories (fs-jetpack).
- `npm test` smoke test: defaults-only end-to-end build of every method and chart type.
- Content components: `.stats()` big-number stat cards, `.quote()` pull quotes, `.table()` comparison tables with zebra striping, `.checklist()` checkmark-badged action lists, `.steps()` numbered step sequences — all palette-aware with per-item color overrides.
- `.group(build)` keep-together wrapper for runs of blocks (heading + lead-in + table, etc.).
- Cover redesign: palette gradient accent bar, edition pill with CSS letter-spacing, tighter modern typography.
- `colors.surface` token (stat card backgrounds, table zebra rows).

### Fixed
- `theme.fonts.import` is now actually injected as a `<link>` (the documented v1 gotcha) and export waits on `document.fonts.ready`.
- Page format/margins now have a single home (`theme.page`) feeding both CSS `@page` and Playwright's print call — previously duplicated and able to drift.
- Cover and part-opener pages now truly fill and vertically center on the physical page (printable height computed from `theme.page`); previously they sat in the top half with a blank bottom.
- Sources blocks no longer split across pages, stranding orphan links.
- TOC chapter entries wrap with a proper hanging indent.

## 1.0.0
### Added
- `Ebook` chainable builder: `cover`, `toc`, `partOpener`, `chapter`, `h3`, `p`, `html`, `figure`, `callout`, `tip`, `bullets`, `sources`, `wrapup`, `pageBreak`, `spacer`, `hr`, `chart`, `toHTML`, `save`.
- Chart.js helpers with design-system defaults: `barChart`, `lineChart`, `doughnutChart`, `groupedBarChart`, `radarChart`, `areaChart`.
- Themeable design system (`generateCSS`): primary/extended palettes, neutrals, five callout/tip tint variants (`lavender`, `blush`, `sky`, `cream`, `mint`), typography, and configurable content-page footer via `theme._footerText`.
- Playwright-based PDF export (`exportPDF`): headless Chromium render, chart-completion wait (`window.__chartsRendered`), Letter format with named CSS `@page` rules for cover/TOC/part-opener/content pagination.
- Chart.js UMD bundle inlined into generated HTML for self-contained offline export (CDN fallback).
- `postinstall` hook to download the Playwright Chromium binary.
- `exports` field exposing the package root (`.`) and `./package.json`; also enables Node self-reference so local scripts inside the repo can `require('pdfy')` directly.
- Documentation: `README.md`, `CLAUDE.md`, `docs/api.md`, `docs/theming.md`, `docs/export.md`.
