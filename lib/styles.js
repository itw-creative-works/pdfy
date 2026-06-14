/**
 * styles.js — CSS generator for the ebook design system.
 * Reads every themable value from the resolved theme tokens.
 */

const { printableHeight } = require('./theme');

/**
 * Build the @page footer content value from the footer template.
 * '{page}' becomes the CSS page counter; plain text passes through.
 */
function footerContent(text) {
  if (!text.includes('{page}')) {
    return `"${text}"`;
  }

  const [before, after] = text.split('{page}');
  const parts = [];
  if (before) {
    parts.push(`"${before}"`);
  }
  parts.push('counter(page)');
  if (after) {
    parts.push(`"${after}"`);
  }
  return parts.join(' ');
}

/**
 * Generate the tint variant rules for callouts and pro tips
 */
function tintCSS(tints) {
  return Object.entries(tints)
    .map(([name, tint]) => `
.callout.${name} { background: ${tint.background}; }
.callout.${name} .label { color: ${tint.accent}; }
.callout.${name} .text { color: ${tint.text}; }
.pro-tip.${name} { background: ${tint.background}; }
.pro-tip.${name} .tip-label { color: ${tint.accent}; }
`)
    .join('');
}

/**
 * Generate the complete design-system stylesheet for a resolved theme
 * @param {object} theme - Resolved theme (see lib/theme.js)
 * @returns {string} CSS document
 */
function generateCSS(theme) {
  const { colors, fonts, sizes, spacing, page, footer } = theme;
  const margins = page.margins;
  const fullPage = `${printableHeight(page)}in`;

  return `
/* ══════════════════════════════════════
   PDFY — Generated Design System
   ══════════════════════════════════════ */

@page {
  size: ${page.format};
  margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
  @bottom-center {
    content: none;  /* Overridden per named page */
  }
}
@page content {
  @bottom-center {
    content: ${footerContent(footer.text)};
    font-family: ${fonts.family};
    font-size: ${sizes.footer};
    color: ${colors.muted};
  }
}
@page cover { @bottom-center { content: none; } }
@page part-opener { @bottom-center { content: none; } }
@page toc { @bottom-center { content: none; } }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: ${fonts.family};
  font-size: ${sizes.body};
  line-height: ${fonts.lineHeight};
  color: ${colors.text};
}

/* ── Cover ── */
.cover-page {
  page: cover;
  page-break-after: always;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: ${fullPage}; text-align: center;
}
.cover-bar { display: flex; gap: 0; }
.cover-title-block {
  background: ${colors.text};
  border-radius: 16px;
  padding: 52px 44px;
  margin: 36px 0;
  width: 88%;
}
.cover-accent {
  width: 140px; height: 6px;
  border-radius: 3px;
  margin: 0 auto 28px;
}
.cover-title {
  font-size: ${sizes.coverTitle}; font-weight: 800;
  line-height: 1.12; color: white;
  letter-spacing: -0.5px;
  margin-bottom: 16px;
}
.cover-subtitle {
  font-size: 14pt; line-height: 1.45;
  color: #cbd5e1; margin-bottom: 22px;
}
.cover-edition {
  display: inline-block;
  font-size: 10pt; font-weight: 700;
  color: ${colors.primary}; letter-spacing: 5px;
  border: 1.5px solid ${colors.primary};
  border-radius: 999px;
  padding: 7px 20px 7px 25px;
}

/* ── TOC ── */
.toc-page {
  page: toc;
  page-break-after: always;
  padding-top: 32px;
}
.toc-title {
  font-size: 20pt; font-weight: 800;
  color: ${colors.text}; text-align: center;
  margin-bottom: 20px;
}
.toc-dots {
  text-align: center; margin-bottom: 20px;
  display: flex; justify-content: center; gap: 4px;
}
.toc-entries { max-width: 420px; margin: 0 auto; }
.toc-part {
  font-size: 13pt; color: ${colors.text};
  margin-top: 10px; margin-bottom: 4px;
}
.toc-chapter {
  font-size: ${sizes.body}; color: ${colors.text};
  padding-left: 37px; text-indent: -17px;
  margin-bottom: 3px; line-height: 1.7;
}
.toc-dot { font-size: 10pt; margin-right: 4px; }

/* ── Part Opener ── */
.part-opener {
  page: part-opener;
  page-break-after: always;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: ${fullPage}; text-align: center;
}
.part-num {
  font-size: 14pt; font-weight: 700;
  color: ${colors.primary}; letter-spacing: 2px;
  margin-bottom: 8px;
}
.part-title {
  font-size: ${sizes.partTitle}; font-weight: 800;
  color: ${colors.text}; margin-bottom: 10px;
}
.part-sub {
  font-size: 13pt; font-style: italic;
  color: ${colors.muted};
}

/* ── Chapter Header ── */
.chapter-header {
  page: content;
  page-break-before: always;
  margin-bottom: 20px;
  padding-top: 16px;
}
.ch-num {
  font-size: 12pt; font-weight: 700;
  color: ${colors.primary}; letter-spacing: 1.5px;
  margin-bottom: 4px;
}
.ch-title {
  font-size: ${sizes.chapterTitle}; font-weight: 800;
  color: ${colors.text}; line-height: 1.25;
  margin-bottom: 8px;
}
.chapter-header hr {
  border: none;
  border-top: 1px solid ${colors.border};
  margin-bottom: 18px;
}

/* ── Content ── */
/* Content-level elements all share the "content" named page
   so Chromium doesn't insert spurious page breaks between them. */
h3, p, ul.content-list, .callout, .pro-tip, .figure, .sources, .wrapup, .note,
.stats, .quote, table.table, ul.checklist, .steps, .group {
  page: content;
}

.group { page-break-inside: avoid; }

h3 {
  font-size: ${sizes.heading}; font-weight: 700;
  color: ${colors.heading};
  margin-top: ${spacing.section}; margin-bottom: 10px;
  page-break-after: avoid;
}
p {
  margin-bottom: ${spacing.paragraph};
  text-align: justify;
  line-height: 1.55;
}
.note {
  font-size: 10pt; font-style: italic;
  color: ${colors.muted}; text-align: center;
  margin-top: 20px; padding: 0 40px;
}

/* ── Figures ── */
.figure {
  page-break-inside: avoid;
  margin: ${spacing.block} 0; text-align: center;
}
.figure img, .figure canvas {
  max-width: 100%;
  border: 1.5px solid ${colors.border};
  border-radius: 8px;
  padding: 12px;
  background: white;
}
.figure.narrow img, .figure.narrow canvas { max-width: 65%; }
.figure figcaption {
  font-size: ${sizes.caption}; font-style: italic;
  color: ${colors.muted}; margin-top: 6px;
}

/* ── Callouts ── */
.callout {
  page-break-inside: avoid;
  border-radius: 8px;
  padding: ${spacing.inset};
  margin: ${spacing.block} 0;
}
.callout .label {
  font-size: 9pt; font-weight: 700;
  margin-bottom: 6px; letter-spacing: 0.5px;
}
.callout .text {
  font-style: italic; line-height: 1.5;
}

/* ── Pro Tips ── */
.pro-tip {
  page-break-inside: avoid;
  display: flex; gap: 14px;
  border-radius: 8px;
  padding: ${spacing.inset};
  margin: ${spacing.block} 0;
}
.pro-tip .tip-label {
  font-weight: 700; font-size: 10pt;
  white-space: nowrap; padding-top: 2px;
}

/* ── Lists ── */
ul.content-list { padding-left: 24px; margin: 8px 0 12px 0; }
ul.content-list li { margin-bottom: 5px; line-height: 1.5; }

/* ── Sources ── */
.sources {
  page-break-inside: avoid;
  margin-top: 20px;
  border-top: 1px solid ${colors.border};
  padding-top: 10px;
}
.sources h4 {
  font-size: 10pt; font-weight: 700;
  color: ${colors.muted}; letter-spacing: 1px;
  margin-bottom: 6px;
}
.sources a {
  display: block; font-size: ${sizes.caption};
  color: ${colors.link}; text-decoration: none;
  padding: 1px 0 1px 12px; line-height: 1.5;
}

/* ── Wrapup ── */
.wrapup {
  page-break-inside: avoid;
  margin-top: 24px;
  border-top: 1px solid ${colors.border};
  padding-top: 16px;
}

/* ── Stats ── */
.stats {
  page-break-inside: avoid;
  display: flex; gap: 12px;
  margin: ${spacing.block} 0;
}
.stat {
  flex: 1;
  background: ${colors.surface};
  border: 1.5px solid ${colors.border};
  border-top-width: 4px;
  border-radius: 10px;
  padding: 16px 12px 13px;
  text-align: center;
}
.stat-value {
  font-size: 22pt; font-weight: 800;
  line-height: 1.1; letter-spacing: -0.5px;
}
.stat-label {
  font-size: 7.5pt; font-weight: 600;
  color: ${colors.muted}; text-transform: uppercase;
  letter-spacing: 1px; line-height: 1.45;
  margin-top: 5px;
}

/* ── Quote ── */
.quote {
  page-break-inside: avoid;
  margin: 22px 0; padding: 0 40px;
  text-align: center;
}
.quote-mark {
  font-size: 36pt; font-weight: 800;
  line-height: 0.5; margin-bottom: 10px;
}
.quote-text {
  font-size: 13pt; font-style: italic; font-weight: 500;
  line-height: 1.5; color: ${colors.text};
}
.quote-attribution {
  margin-top: 12px;
  font-size: 8.5pt; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${colors.muted};
}

/* ── Tables ── */
table.table {
  page-break-inside: avoid;
  width: 100%; border-collapse: collapse;
  margin: ${spacing.block} 0;
  font-size: 9.5pt;
}
table.table th {
  text-align: left;
  font-size: 8pt; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  color: ${colors.muted};
  padding: 6px 10px;
  border-bottom: 2px solid ${colors.primary};
}
table.table td {
  padding: 7px 10px; line-height: 1.45;
  border-bottom: 1px solid ${colors.border};
  vertical-align: top;
}
table.table td:first-child { font-weight: 600; }
table.table tbody tr:nth-child(even) { background: ${colors.surface}; }

/* ── Checklist ── */
ul.checklist {
  list-style: none;
  padding: 0; margin: ${spacing.block} 0;
}
ul.checklist li {
  display: flex; gap: 10px; align-items: flex-start;
  page-break-inside: avoid;
  padding: 5px 0; line-height: 1.5;
}
.check {
  flex: 0 0 auto;
  width: 16px; height: 16px;
  border-radius: 50%;
  color: white; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin-top: 3px;
}

/* ── Steps ── */
.steps { margin: ${spacing.block} 0; }
.step {
  page-break-inside: avoid;
  display: flex; gap: 14px;
  padding: 9px 0;
}
.step-num {
  flex: 0 0 auto;
  width: 30px; height: 30px;
  border-radius: 50%;
  color: white; font-weight: 800; font-size: 12.5pt;
  display: flex; align-items: center; justify-content: center;
}
.step-title {
  font-weight: 700; font-size: 11.5pt;
  color: ${colors.text}; margin-bottom: 2px;
  padding-top: 3px;
}
.step-text { font-size: 10pt; line-height: 1.5; }

${tintCSS(theme.tints)}
`;
}

module.exports = { generateCSS };
