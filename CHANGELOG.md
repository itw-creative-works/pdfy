# CHANGELOG

## Changelog Categories
- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

## 1.0.0
### Added
- `Ebook` chainable builder: `cover`, `toc`, `partOpener`, `chapter`, `h3`, `p`, `html`, `figure`, `callout`, `tip`, `bullets`, `sources`, `wrapup`, `pageBreak`, `spacer`, `hr`, `chart`, `toHTML`, `save`.
- Chart.js helpers with design-system defaults: `barChart`, `lineChart`, `doughnutChart`, `groupedBarChart`, `radarChart`, `areaChart`.
- Themeable design system (`generateCSS`): primary/extended palettes, neutrals, five callout/tip tint variants (`lavender`, `blush`, `sky`, `cream`, `mint`), typography, and configurable content-page footer via `theme._footerText`.
- Playwright-based PDF export (`exportPDF`): headless Chromium render, chart-completion wait (`window.__chartsRendered`), Letter format with named CSS `@page` rules for cover/TOC/part-opener/content pagination.
- Chart.js UMD bundle inlined into generated HTML for self-contained offline export (CDN fallback).
- `postinstall` hook to download the Playwright Chromium binary.
- Documentation: `README.md`, `CLAUDE.md`, `docs/api.md`, `docs/theming.md`, `docs/export.md`.
