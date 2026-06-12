# pdfy

> HTML-to-PDF ebook framework powered by Playwright and Chart.js

Build polished, print-ready ebook PDFs from JavaScript. pdfy gives you a chainable `Ebook` builder with a complete design system — covers, tables of contents, part openers, chapters, callouts, pro tips, figures, and live Chart.js charts — and exports it all to PDF through headless Chromium.

## Features

- **Chainable builder API** — `book.cover().toc().chapter().p().chart().save()`
- **Built-in design system** — themeable colors, typography, callouts, tips, figures, sources, and wrap-ups out of the box
- **Chart.js charts** — bar, line, doughnut, grouped bar, radar, and area chart helpers rendered as crisp canvases inside the PDF
- **Print-correct pagination** — named CSS pages give covers/TOC/part openers footer-free layouts while content pages get automatic page numbers
- **Playwright export** — renders in real headless Chromium, waits for charts to finish, then prints to Letter-format PDF

## Installation

```bash
npm install pdfy
```

The `postinstall` script downloads the Playwright Chromium binary automatically (`npx playwright install chromium`).

## Quick start

```js
const { Ebook, barChart } = require('pdfy');

(async () => {
  const book = new Ebook({
    title: 'My Great Book',
    theme: { primary: '#FF6B6B', _footerText: 'My Great Book  |  Page' },
  });

  book
    .cover({ subtitle: 'A practical guide', edition: '2026 EDITION' })
    .toc([
      { type: 'part', num: 1, title: 'The Basics' },
      { type: 'chapter', num: 1, title: 'Getting Started' },
    ])
    .partOpener(1, 'The Basics')
    .chapter(1, 'Getting Started')
    .h3('Why This Matters')
    .p('Body copy goes here.')
    .bullets(['First point', 'Second point'])
    .callout('The key insight of this chapter.')
    .tip('A practical shortcut worth knowing.')
    .chart('bar', barChart({
      labels: ['A', 'B', 'C'],
      data: [1, 2, 3],
      colors: ['#FF6B6B', '#4ECDC4', '#A78BFA'],
      title: 'A Bar Chart',
    }), { caption: 'Figure 1: Results' })
    .wrapup('Wrapping Up', 'What we covered and where to go next.');

  await book.save('my-great-book.pdf', { saveHTML: true });
})();
```

## API at a glance

| Export | What it does |
|---|---|
| `Ebook` | Chainable ebook builder — structure, content blocks, charts, `toHTML()`, `save()` |
| `barChart` / `lineChart` / `doughnutChart` / `groupedBarChart` / `radarChart` / `areaChart` | Chart.js config helpers with design-system defaults |
| `exportPDF(html, outputPath, options)` | Render any HTML string to PDF via headless Chromium |
| `generateCSS(theme)` | Produce the full design-system stylesheet for a theme |

Full reference: [docs/api.md](docs/api.md) · Theming: [docs/theming.md](docs/theming.md) · Export pipeline: [docs/export.md](docs/export.md)

## License

MIT © Ian Wiedenman
