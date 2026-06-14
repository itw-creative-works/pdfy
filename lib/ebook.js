/**
 * ebook.js — Chainable ebook builder.
 * Accumulates HTML fragments and queued charts; document assembly,
 * theming, and PDF export live in their own modules.
 */

const path = require('path');
const jetpack = require('fs-jetpack');
const { resolveTheme, resolveColor, palette } = require('./theme');
const { buildChart } = require('./charts');
const { assembleHTML } = require('./document');
const { exportPDF } = require('./export');

/**
 * Render a row of colored swatch spans (cover bars, TOC dots,
 * part/chapter bars — every decorative color strip in the system)
 */
function swatches(colors, { width, height, radius }) {
  return colors
    .map((color) => `<span style="background:${color};width:${width};height:${height};${radius ? `border-radius:${radius};` : ''}display:inline-block;"></span>`)
    .join('');
}

class Ebook {
  /**
   * @param {object} options
   * @param {string} [options.title] - Book title (cover, {title} footer token)
   * @param {object} [options.theme] - Theme overrides, deep-merged over defaults
   * @param {object} [options.output] - { dir = process.cwd(), html = false }
   */
  constructor(options = {}) {
    this.title = options.title || 'Ebook';
    this.theme = resolveTheme(options.theme);
    this.output = {
      dir: options.output?.dir || process.cwd(),
      html: options.output?.html || false,
    };

    // Substitute the {title} footer token once, up front
    this.theme.footer = {
      ...this.theme.footer,
      text: this.theme.footer.text.replace(/\{title\}/g, this.title),
    };

    this._parts = [];
    this._charts = [];
    this._chartCounter = 0;
  }

  // ═══════════════════════════════════════════
  // THEME ACCESS
  // ═══════════════════════════════════════════

  get colors() {
    return this.theme.colors;
  }

  /**
   * First n palette colors (cycling); full palette when n is omitted
   */
  palette(n) {
    return palette(this.theme, n);
  }

  // ═══════════════════════════════════════════
  // FRONT MATTER
  // ═══════════════════════════════════════════

  cover({ title, subtitle, edition } = {}) {
    const bar = swatches(this.palette(6), { width: '60px', height: '8px' });
    const accent = `background:linear-gradient(90deg, ${this.palette(6).join(', ')})`;

    this._parts.push(`
      <div class="cover-page">
        <div class="cover-bar">${bar}</div>
        <div class="cover-title-block">
          <div class="cover-accent" style="${accent}"></div>
          <div class="cover-title">${(title || this.title).toUpperCase()}</div>
          ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ''}
          ${edition ? `<div class="cover-edition">${edition}</div>` : ''}
        </div>
        <div class="cover-bar">${bar}</div>
      </div>
    `);
    return this;
  }

  /**
   * Table of contents page.
   * sections: array of { type: "part"|"chapter"|"spacer", num, title, color }.
   * Chapter colors accept theme color names; when omitted they auto-cycle
   * the palette, restarting at every part.
   */
  toc(sections) {
    const dots = swatches(this.palette(5), { width: '20px', height: '6px', radius: '3px' });
    const cycle = this.palette();
    let cycleIndex = 0;

    const entries = sections
      .map((section) => {
        if (section.type === 'part') {
          cycleIndex = 0;
          return `<div class="toc-part"><strong>PART ${section.num}: ${section.title}</strong></div>`;
        }
        if (section.type === 'chapter') {
          const color = resolveColor(this.colors, section.color)
            || cycle[cycleIndex++ % cycle.length];
          return `<div class="toc-chapter"><span class="toc-dot" style="color:${color}">&#9679;</span> <strong>Chapter ${section.num}</strong> &mdash; ${section.title}</div>`;
        }
        if (section.type === 'spacer') {
          return '<div style="height:10px;"></div>';
        }
        return '';
      })
      .join('\n');

    this._parts.push(`
      <div class="toc-page">
        <h2 class="toc-title">TABLE OF CONTENTS</h2>
        <div class="toc-dots">${dots}</div>
        <div class="toc-entries">${entries}</div>
        <div class="toc-dots" style="margin-top:28px;">${dots}</div>
      </div>
    `);
    return this;
  }

  // ═══════════════════════════════════════════
  // STRUCTURE
  // ═══════════════════════════════════════════

  partOpener(num, title, subtitle = '') {
    const bar = swatches(this.palette(3), { width: '50px', height: '6px', radius: '3px' });

    this._parts.push(`
      <div class="part-opener">
        <div style="display:flex;gap:4px;">${bar}</div>
        <div class="part-num">PART ${num}</div>
        <div class="part-title">${title}</div>
        ${subtitle ? `<div class="part-sub">${subtitle}</div>` : ''}
        <div style="display:flex;gap:4px;margin-top:32px;">${bar}</div>
      </div>
    `);
    return this;
  }

  chapter(num, title) {
    const bar = swatches(this.palette(5), { width: '28px', height: '5px' });

    this._parts.push(`
      <div class="chapter-header">
        <div style="display:flex;gap:0;margin-bottom:12px;">${bar}</div>
        <div class="ch-num">CHAPTER ${num}</div>
        <div class="ch-title">${title}</div>
        <hr>
      </div>
    `);
    return this;
  }

  // ═══════════════════════════════════════════
  // CONTENT BLOCKS
  // ═══════════════════════════════════════════

  h3(text) {
    this._parts.push(`<h3>${text}</h3>`);
    return this;
  }

  p(text) {
    this._parts.push(`<p>${text}</p>`);
    return this;
  }

  /**
   * Insert raw HTML
   */
  html(raw) {
    this._parts.push(raw);
    return this;
  }

  /**
   * Small italic centered note (e.g. after the TOC)
   */
  note(text) {
    this._parts.push(`<p class="note">${text}</p>`);
    return this;
  }

  /**
   * Embed an image. src can be a path, data URI, or URL.
   */
  figure(src, caption, { narrow = false } = {}) {
    const cls = narrow ? 'figure narrow' : 'figure';
    const cap = caption ? `<figcaption>${caption}</figcaption>` : '';

    this._parts.push(`
      <figure class="${cls}">
        <img src="${src}" alt="${caption || ''}">
        ${cap}
      </figure>
    `);
    return this;
  }

  callout(text, { style = 'lavender', label = 'KEY INSIGHT' } = {}) {
    this._assertTint(style);
    this._parts.push(`
      <div class="callout ${style}">
        <div class="label">${label}</div>
        <div class="text">${text}</div>
      </div>
    `);
    return this;
  }

  tip(text, { style = 'mint' } = {}) {
    this._assertTint(style);
    this._parts.push(`
      <div class="pro-tip ${style}">
        <div class="tip-label">PRO TIP</div>
        <div>${text}</div>
      </div>
    `);
    return this;
  }

  bullets(items) {
    const li = items.map((item) => `<li>${item}</li>`).join('\n');
    this._parts.push(`<ul class="content-list">${li}</ul>`);
    return this;
  }

  /**
   * Row of big-number stat cards.
   * items: array of { value, label, color? } — colors cycle the palette
   * when omitted.
   */
  stats(items) {
    const cycle = this.palette();
    const cards = items
      .map((item, i) => {
        const color = resolveColor(this.colors, item.color) || cycle[i % cycle.length];
        return `
        <div class="stat" style="border-top-color:${color}">
          <div class="stat-value" style="color:${color}">${item.value}</div>
          <div class="stat-label">${item.label}</div>
        </div>`;
      })
      .join('');

    this._parts.push(`<div class="stats">${cards}</div>`);
    return this;
  }

  /**
   * Centered pull quote with oversized quote mark
   */
  quote(text, { attribution } = {}) {
    this._parts.push(`
      <div class="quote">
        <div class="quote-mark" style="color:${this.colors.primary}">&ldquo;</div>
        <div class="quote-text">${text}</div>
        ${attribution ? `<div class="quote-attribution">&mdash; ${attribution}</div>` : ''}
      </div>
    `);
    return this;
  }

  /**
   * Comparison table with uppercase header row and zebra striping.
   * @param {string[]} headers - Column headers
   * @param {string[][]} rows - Array of row cell arrays
   */
  table(headers, rows) {
    const head = headers.map((header) => `<th>${header}</th>`).join('');
    const body = rows
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('\n');

    this._parts.push(`
      <table class="table">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    `);
    return this;
  }

  /**
   * Checklist with colored checkmark badges
   */
  checklist(items, { color = 'green' } = {}) {
    const badge = resolveColor(this.colors, color);
    const li = items
      .map((item) => `<li><span class="check" style="background:${badge}">&#10003;</span><span>${item}</span></li>`)
      .join('\n');

    this._parts.push(`<ul class="checklist">${li}</ul>`);
    return this;
  }

  /**
   * Numbered step sequence (processes, frameworks, phases).
   * items: array of { title?, text, color? } — numbers cycle the palette
   * when colors are omitted.
   */
  steps(items) {
    const cycle = this.palette();
    const rows = items
      .map((step, i) => {
        const color = resolveColor(this.colors, step.color) || cycle[i % cycle.length];
        return `
        <div class="step">
          <div class="step-num" style="background:${color}">${i + 1}</div>
          <div class="step-body">
            ${step.title ? `<div class="step-title">${step.title}</div>` : ''}
            <div class="step-text">${step.text}</div>
          </div>
        </div>`;
      })
      .join('\n');

    this._parts.push(`<div class="steps">${rows}</div>`);
    return this;
  }

  /**
   * Sources block. links: array of [label, url] pairs or { label, url } objects.
   */
  sources(links) {
    const anchors = links
      .map((link) => {
        const [label, url] = Array.isArray(link) ? link : [link.label, link.url];
        return `<a href="${url}">${label}</a>`;
      })
      .join('\n');

    this._parts.push(`
      <div class="sources">
        <h4>SOURCES</h4>
        ${anchors}
      </div>
    `);
    return this;
  }

  wrapup(title, text) {
    this._parts.push(`
      <div class="wrapup">
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    `);
    return this;
  }

  /**
   * Keep a run of blocks together on one page (e.g. a heading, its
   * lead-in paragraph, and a table). The callback receives this book;
   * everything it pushes is wrapped in a no-break container.
   */
  group(build) {
    const parts = this._parts;
    this._parts = [];
    build(this);
    const grouped = this._parts.join('\n');
    this._parts = parts;

    this._parts.push(`<div class="group">${grouped}</div>`);
    return this;
  }

  pageBreak() {
    this._parts.push('<div style="page-break-before:always;"></div>');
    return this;
  }

  spacer(height = '20px') {
    this._parts.push(`<div style="height:${height};"></div>`);
    return this;
  }

  hr() {
    this._parts.push(
      `<hr style="border:none;border-top:1px solid ${this.colors.border};margin:16px 0;">`
    );
    return this;
  }

  // ═══════════════════════════════════════════
  // CHARTS
  // ═══════════════════════════════════════════

  /**
   * Add a chart, rendered via Chart.js at export time.
   * @param {string} type - bar | line | area | doughnut | groupedBar | radar
   * @param {object} options - Chart data/options plus presentation extras:
   *   labels, data or datasets, colors/color (names or hex; defaults to the
   *   theme palette), title, xLabel, yLabel, horizontal (bar only),
   *   caption, narrow, options (raw Chart.js escape hatch)
   */
  chart(type, options = {}) {
    const { caption, narrow, ...chartOptions } = options;
    const config = buildChart(type, chartOptions, this.theme);

    const id = `chart-${this._chartCounter++}`;
    const cls = narrow ? 'figure narrow' : 'figure';
    const cap = caption ? `<figcaption>${caption}</figcaption>` : '';

    this._parts.push(`
      <figure class="${cls}">
        <canvas id="${id}" width="750" height="450" style="max-width:100%;"></canvas>
        ${cap}
      </figure>
    `);

    this._charts.push({ id, ...config });
    return this;
  }

  // ═══════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════

  toHTML() {
    return assembleHTML({
      theme: this.theme,
      parts: this._parts,
      charts: this._charts,
    });
  }

  /**
   * Render and write the PDF (and optionally the intermediate HTML).
   * @param {string} filename - PDF filename
   * @param {object} [overrides] - { dir, html } overriding the book's output config
   * @returns {Promise<string>} Absolute path of the written PDF
   */
  async save(filename, overrides = {}) {
    const dir = overrides.dir || this.output.dir;
    const writeHTML = overrides.html !== undefined ? overrides.html : this.output.html;
    const html = this.toHTML();

    jetpack.dir(dir);

    if (writeHTML) {
      const htmlPath = path.join(dir, filename.replace(/\.pdf$/i, '.html'));
      jetpack.write(htmlPath, html);
      console.log(`HTML: ${htmlPath}`);
    }

    const pdfPath = path.join(dir, filename);
    await exportPDF(html, pdfPath, {
      page: this.theme.page,
      hasCharts: this._charts.length > 0,
    });
    console.log(`PDF: ${pdfPath}`);
    return pdfPath;
  }

  /**
   * Throw early (with the valid list) when a tint variant doesn't exist
   */
  _assertTint(style) {
    if (this.theme.tints[style]) {
      return;
    }
    throw new Error(
      `Unknown tint '${style}'. Valid tints: ${Object.keys(this.theme.tints).join(', ')}`
    );
  }
}

module.exports = { Ebook };
