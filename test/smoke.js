/**
 * smoke.js — Defaults-only end-to-end build.
 * Exercises every builder method and chart type with zero theme config,
 * validating the default-inheritance path from project to PDF.
 */

const os = require('os');
const path = require('path');
const jetpack = require('fs-jetpack');
const { createProject } = require('../lib');

const MIN_PDF_BYTES = 20000;

async function main() {
  const dir = path.join(os.tmpdir(), 'pdfy-smoke');
  jetpack.remove(dir);

  const project = createProject({
    title: 'Smoke Test',
    output: { dir, html: true },
  });

  const book = project.book();

  book
    .cover({ subtitle: 'Validating pdfy end-to-end', edition: 'TEST EDITION' })
    .toc([
      { type: 'part', num: 1, title: 'The Basics' },
      { type: 'chapter', num: 1, title: 'Getting Started' },
      { type: 'chapter', num: 2, title: 'Going Deeper' },
      { type: 'spacer' },
    ])
    .note('A note rendered after the table of contents.')
    .partOpener(1, 'The Basics', 'Everything starts somewhere')
    .chapter(1, 'Getting Started')
    .h3('A Section Heading')
    .p('This is a paragraph validating text rendering.')
    .bullets(['First item', 'Second item', 'Third item'])
    .callout('A key insight goes here.')
    .tip('A pro tip goes here.')
    .stats([
      { value: '42%', label: 'Stat with palette color' },
      { value: '1.5s', label: 'Second stat' },
      { value: '$9B', label: 'Stat with named color', color: 'green' },
    ])
    .quote('A pull quote to validate the quote component.', { attribution: 'Smoke Test' })
    .table(
      ['Column A', 'Column B'],
      [['Row 1A', 'Row 1B'], ['Row 2A', 'Row 2B']]
    )
    .checklist(['Checklist item one', 'Checklist item two'])
    .steps([
      { title: 'Step one', text: 'First step body.' },
      { title: 'Step two', text: 'Second step body.' },
    ])
    .group((b) => {
      b.h3('Grouped Heading');
      b.p('Grouped paragraph that stays with its heading.');
    })
    .chart('bar', {
      labels: ['A', 'B', 'C'],
      data: [1, 2, 3],
      title: 'Bar (palette defaults)',
      caption: 'Figure 1: bar chart',
    })
    .chart('line', {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        { label: 'One', data: [3, 1, 2] },
        { label: 'Two', data: [1, 2, 3] },
      ],
      title: 'Line (palette defaults)',
    })
    .chart('area', {
      labels: ['Q1', 'Q2', 'Q3'],
      data: [10, 20, 15],
      title: 'Area (palette default)',
    })
    .chart('doughnut', {
      labels: ['X', 'Y', 'Z'],
      data: [50, 30, 20],
      title: 'Doughnut (palette defaults)',
      narrow: true,
    })
    .chart('groupedBar', {
      labels: ['L1', 'L2'],
      datasets: [
        { label: 'One', data: [4, 6] },
        { label: 'Two', data: [5, 3] },
      ],
      title: 'Grouped bar (palette defaults)',
    })
    .chart('radar', {
      labels: ['R1', 'R2', 'R3', 'R4'],
      datasets: [{ label: 'One', data: [3, 4, 2, 5], color: 'accent' }],
      title: 'Radar (named color)',
    })
    .sources([['Example Source', 'https://example.com']])
    .wrapup('Wrapping Up', 'That covers the smoke test.');

  const pdfPath = await book.save('smoke.pdf');

  // Assert outputs exist and the PDF is non-trivial
  const pdfSize = jetpack.inspect(pdfPath)?.size || 0;
  const htmlExists = jetpack.exists(path.join(dir, 'smoke.html')) === 'file';

  if (!htmlExists) {
    throw new Error('HTML sidecar was not written');
  }
  if (pdfSize < MIN_PDF_BYTES) {
    throw new Error(`PDF suspiciously small (${pdfSize} bytes) — charts may not have rendered`);
  }

  console.log(`[1/1] ok — ${pdfPath} (${pdfSize} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
