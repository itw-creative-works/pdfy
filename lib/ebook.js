/**
 * ebook.js — Core ebook builder.
 *
 * Usage:
 *   const { Ebook } = require('./ebook-kit/ebook');
 *   const book = new Ebook({ title: "My Book", theme: { primary: "#FF6B6B" } });
 *   book.cover({ subtitle: "A great book" });
 *   book.chapter(1, "First Chapter");
 *   book.p("Hello world.");
 *   await book.save("output.pdf");
 */

const fs = require("fs");
const path = require("path");
const { generateCSS } = require("./styles");
const { exportPDF } = require("./export");

const DEFAULT_THEME = {
  // Primary palette — override these per project
  primary: "#FF6B6B",
  secondary: "#4ECDC4",
  accent: "#A78BFA",

  // Extended palette
  blue: "#60A5FA",
  pink: "#F472B6",
  orange: "#FB923C",
  yellow: "#FBBF24",
  green: "#34D399",

  // Neutrals
  navy: "#1e293b",
  slate: "#64748b",
  border: "#e2e8f0",
  light: "#f8fafc",

  // Background tints (for callouts/tips)
  lavender: "#f5f3ff",
  blush: "#fff1f2",
  sky: "#f0f9ff",
  cream: "#fffbeb",
  mint: "#ecfdf5",

  // Callout text colors per style
  calloutText: {
    lavender: "#7c3aed",
    blush: "#FF6B6B",
    sky: "#60A5FA",
    cream: "#92400e",
    mint: "#065f46",
  },

  // Fonts
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  fontImport:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",

  // Heading color (for h3 section headings)
  headingColor: "#7c3aed",
};

class Ebook {
  constructor(options = {}) {
    this.title = options.title || "Ebook";
    this.theme = { ...DEFAULT_THEME, ...options.theme };

    // Merge calloutText if partially overridden
    if (options.theme?.calloutText) {
      this.theme.calloutText = {
        ...DEFAULT_THEME.calloutText,
        ...options.theme.calloutText,
      };
    }

    this._parts = []; // Array of HTML strings
    this._charts = []; // Chart render queue
    this._chartCounter = 0;
  }

  // ═══════════════════════════════════════════
  // FRONT MATTER
  // ═══════════════════════════════════════════

  cover({ subtitle, edition } = {}) {
    const t = this.theme;
    const colors = [t.primary, t.pink, t.accent, t.secondary, t.blue, t.orange];
    const barSpans = colors
      .map((c) => `<span style="background:${c}"></span>`)
      .join("");

    this._parts.push(`
      <div class="cover-page">
        <div class="cover-bar">${barSpans}</div>
        <div class="cover-title-block">
          <div class="cover-title">${this.title.toUpperCase()}</div>
          ${subtitle ? `<div class="cover-subtitle">${subtitle}</div>` : ""}
          ${edition ? `<div class="cover-edition">${edition}</div>` : ""}
        </div>
        <div class="cover-bar">${barSpans}</div>
      </div>
    `);
    return this;
  }

  toc(sections) {
    /**
     * sections: array of { type: "part"|"chapter", num, title, color }
     * or use the helper methods tocPart / tocChapter
     */
    const dots = [
      this.theme.primary,
      this.theme.pink,
      this.theme.accent,
      this.theme.secondary,
      this.theme.blue,
    ]
      .map(
        (c) =>
          `<span style="background:${c};width:20px;height:6px;border-radius:3px;display:inline-block;"></span>`
      )
      .join("");

    const entries = sections
      .map((s) => {
        if (s.type === "part") {
          return `<div class="toc-part"><strong>PART ${s.num}: ${s.title}</strong></div>`;
        } else if (s.type === "chapter") {
          return `<div class="toc-chapter"><span class="toc-dot" style="color:${s.color || this.theme.primary}">&#9679;</span> <strong>Chapter ${s.num}</strong> &mdash; ${s.title}</div>`;
        } else if (s.type === "spacer") {
          return '<div style="height:10px;"></div>';
        }
        return "";
      })
      .join("\n");

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

  partOpener(num, title, subtitle = "") {
    const t = this.theme;
    const bar = [t.primary, t.accent, t.secondary]
      .map(
        (c) =>
          `<span style="background:${c};width:50px;height:6px;border-radius:3px;display:inline-block;"></span>`
      )
      .join("");

    this._parts.push(`
      <div class="part-opener">
        <div style="display:flex;gap:4px;">${bar}</div>
        <div class="part-num">PART ${num}</div>
        <div class="part-title">${title}</div>
        ${subtitle ? `<div class="part-sub">${subtitle}</div>` : ""}
        <div style="display:flex;gap:4px;margin-top:32px;">${bar}</div>
      </div>
    `);
    return this;
  }

  chapter(num, title) {
    const t = this.theme;
    const colors = [t.primary, t.pink, t.accent, t.secondary, t.blue];
    const bar = colors
      .map(
        (c) =>
          `<span style="background:${c};width:28px;height:5px;display:inline-block;"></span>`
      )
      .join("");

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

  html(raw) {
    /** Insert raw HTML. */
    this._parts.push(raw);
    return this;
  }

  figure(src, caption, { narrow = false } = {}) {
    /**
     * Embed an image. src can be:
     * - A filename (resolved relative to asset_dir if set)
     * - A full path
     * - A data URI
     * - A chart placeholder (from .chart())
     */
    const cls = narrow ? "figure narrow" : "figure";
    const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
    this._parts.push(`
      <figure class="${cls}">
        <img src="${src}" alt="${caption || ""}">
        ${cap}
      </figure>
    `);
    return this;
  }

  callout(text, { style = "lavender", label = "KEY INSIGHT" } = {}) {
    this._parts.push(`
      <div class="callout ${style}">
        <div class="label">${label}</div>
        <div class="text">${text}</div>
      </div>
    `);
    return this;
  }

  tip(text, { style = "mint" } = {}) {
    this._parts.push(`
      <div class="pro-tip ${style}">
        <div class="tip-label">PRO TIP</div>
        <div>${text}</div>
      </div>
    `);
    return this;
  }

  bullets(items) {
    const li = items.map((item) => `<li>${item}</li>`).join("\n");
    this._parts.push(`<ul class="content-list">${li}</ul>`);
    return this;
  }

  sources(links) {
    /** links: array of [label, url] or {label, url} */
    const anchors = links
      .map((l) => {
        const [label, url] = Array.isArray(l) ? l : [l.label, l.url];
        return `<a href="${url}">${label}</a>`;
      })
      .join("\n");

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

  pageBreak() {
    this._parts.push('<div style="page-break-before:always;"></div>');
    return this;
  }

  spacer(height = "20px") {
    this._parts.push(`<div style="height:${height};"></div>`);
    return this;
  }

  hr() {
    this._parts.push(
      `<hr style="border:none;border-top:1px solid ${this.theme.border};margin:16px 0;">`
    );
    return this;
  }

  // ═══════════════════════════════════════════
  // CHARTS
  // ═══════════════════════════════════════════

  chart(type, config, { caption, narrow = false } = {}) {
    /**
     * Add a Chart.js chart. Rendered at export time.
     *
     * type: "bar" | "line" | "doughnut" | "pie" | "radar" | "polarArea" | "horizontalBar"
     * config: Chart.js config object (data, options, etc.)
     *         OR use the shorthand helpers in charts.js
     * caption: optional figure caption
     *
     * Returns this for chaining.
     */
    const id = `chart-${this._chartCounter++}`;
    const cls = narrow ? "figure narrow" : "figure";
    const cap = caption ? `<figcaption>${caption}</figcaption>` : "";

    // Insert a canvas placeholder
    this._parts.push(`
      <figure class="${cls}">
        <canvas id="${id}" width="750" height="450" style="max-width:100%;"></canvas>
        ${cap}
      </figure>
    `);

    // Queue chart for rendering
    this._charts.push({ id, type, config });
    return this;
  }

  // ═══════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════

  toHTML() {
    const css = generateCSS(this.theme);
    const chartScript = this._charts.length > 0 ? this._buildChartScript() : "";

    // Inline Chart.js from node_modules if charts are used
    let chartLib = "";
    if (this._charts.length > 0) {
      const chartPath = path.join(__dirname, "..", "node_modules", "chart.js", "dist", "chart.umd.js");
      if (fs.existsSync(chartPath)) {
        chartLib = `<script>${fs.readFileSync(chartPath, "utf-8")}</script>`;
      } else {
        chartLib = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>';
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>${css}</style>
${chartLib}
</head>
<body>
${this._parts.join("\n")}
${chartScript}
</body>
</html>`;
  }

  _buildChartScript() {
    const chartInits = this._charts
      .map((c) => {
        const cfg = JSON.stringify({
          type: c.type === "horizontalBar" ? "bar" : c.type,
          data: c.config.data,
          options: {
            ...(c.config.options || {}),
            responsive: false,
            animation: false,
            ...(c.type === "horizontalBar" ? { indexAxis: "y" } : {}),
          },
        });
        return `new Chart(document.getElementById('${c.id}'), ${cfg});`;
      })
      .join("\n");

    return `<script>
document.addEventListener('DOMContentLoaded', function() {
  Chart.defaults.font.family = "${this.theme.fontFamily}";
  Chart.defaults.color = "${this.theme.navy}";
  ${chartInits}
  // Signal that charts are rendered
  window.__chartsRendered = true;
});
</script>`;
  }

  async save(filename, { outputDir, saveHTML = false } = {}) {
    const html = this.toHTML();
    const dir = outputDir || process.cwd();

    if (saveHTML) {
      const fs = require("fs");
      const htmlPath = require("path").join(
        dir,
        filename.replace(/\.pdf$/i, ".html")
      );
      fs.writeFileSync(htmlPath, html);
      console.log(`HTML: ${htmlPath}`);
    }

    const pdfPath = require("path").join(dir, filename);
    await exportPDF(html, pdfPath, { hasCharts: this._charts.length > 0 });
    console.log(`PDF: ${pdfPath}`);
    return pdfPath;
  }
}

module.exports = { Ebook };
