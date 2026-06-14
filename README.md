# pdfy

> HTML-to-PDF ebook framework powered by Playwright and Chart.js

Build polished, print-ready ebook PDFs from JavaScript. Define your project — title, theme, output — once; every part script inherits it. A chainable `Ebook` builder gives you covers, tables of contents, part openers, chapters, callouts, pro tips, figures, and live Chart.js charts, all styled by a single themeable design system and exported through headless Chromium.

## Features

- **Project-level theming** — colors, fonts, sizes, spacing, page setup, and footer defined once in a shared `project.js`, applied to every part automatically
- **Color names everywhere** — `color: 'accent'`, `colors: ['primary', 'pink']`; charts, TOC dots, and swatch bars inherit the theme palette when colors are omitted
- **Chainable builder API** — `book.cover().toc().chapter().p().chart().save()`
- **Premium content components** — big-number stat cards, pull quotes, comparison tables, checklists, numbered step sequences, and keep-together groups, all palette-aware out of the box
- **Chart.js charts** — `bar`, `line`, `area`, `doughnut`, `groupedBar`, `radar` via one `book.chart(type, options)` call with design-system defaults
- **Print-correct pagination** — named CSS pages give covers/TOC/part openers footer-free layouts while content pages get templated footers with page numbers
- **Playwright export** — real headless Chromium, waits for web fonts and charts, prints Letter (or any theme-configured format) PDFs

## Installation

```bash
npm install pdfy
```

The `postinstall` script downloads the Playwright Chromium binary automatically (`npx playwright install chromium`).

## Quick start

```js
// project.js — define once per book
const { createProject } = require('pdfy');

module.exports = createProject({
  title: 'My Great Book',
  theme: {
    colors: { primary: '#0EA5E9' },
    footer: { text: '{title}  |  Page {page}' },
  },
  output: { dir: `${__dirname}/output`, html: true },
});
```

```js
// build.js — every part script
const project = require('./project');

async function main() {
  const book = project.book();

  book
    .cover({ subtitle: 'A practical guide', edition: '2026 EDITION' })
    .toc([
      { type: 'part', num: 1, title: 'The Basics' },
      { type: 'chapter', num: 1, title: 'Getting Started' },   // dot color auto-cycles the palette
    ])
    .partOpener(1, 'The Basics')
    .chapter(1, 'Getting Started')
    .h3('Why This Matters')
    .p('Body copy goes here.')
    .bullets(['First point', 'Second point'])
    .callout('The key insight of this chapter.')
    .tip('A practical shortcut worth knowing.')
    .chart('bar', {
      labels: ['A', 'B', 'C'],
      data: [1, 2, 3],                  // colors inherit the theme palette
      title: 'A Bar Chart',
      caption: 'Figure 1: Results',
    })
    .wrapup('Wrapping Up', 'What we covered and where to go next.');

  await book.save('my-great-book.pdf');
}

main().catch(console.error);
```

## API at a glance

| Export | What it does |
|---|---|
| `createProject({ title, theme, output })` | Define a book project once; `project.book()` mints pre-configured builders |
| `Ebook` | The chainable builder — structure, content blocks, charts, `toHTML()`, `save()` |
| `exportPDF(html, outputPath, options)` | Render any HTML string to PDF via headless Chromium |
| `generateCSS(theme)` | Produce the full design-system stylesheet for a resolved theme |
| `DEFAULT_THEME` | The default theme object (the reference for every token) |

Full reference: [docs/api.md](docs/api.md) · Theming: [docs/theming.md](docs/theming.md) · Export pipeline: [docs/export.md](docs/export.md)

## Testing

```bash
npm test
```

Runs a defaults-only end-to-end build (every builder method, every chart type) and asserts a valid PDF comes out.

## License

MIT © Ian Wiedenman
