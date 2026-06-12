/**
 * styles.js — CSS generator for the ebook design system.
 * Takes a theme object and produces complete CSS.
 */

function generateCSS(theme) {
  const t = theme;

  // Build callout/tip variants dynamically
  const boxStyles = {
    lavender: { bg: t.lavender, accent: t.accent, text: t.calloutText.lavender },
    blush: { bg: t.blush, accent: t.primary, text: t.calloutText.blush },
    sky: { bg: t.sky, accent: t.blue, text: t.calloutText.sky },
    cream: { bg: t.cream, accent: t.orange, text: t.calloutText.cream },
    mint: { bg: t.mint, accent: t.secondary, text: t.calloutText.mint },
  };

  let boxCSS = "";
  for (const [name, s] of Object.entries(boxStyles)) {
    boxCSS += `
.callout.${name} { background: ${s.bg}; }
.callout.${name} .label { color: ${s.accent}; }
.callout.${name} .text { color: ${s.text}; }
.pro-tip.${name} { background: ${s.bg}; }
.pro-tip.${name} .tip-label { color: ${s.accent}; }
`;
  }

  return `
/* ══════════════════════════════════════
   EBOOK-KIT — Generated Design System
   ══════════════════════════════════════ */

@page {
  size: letter;
  margin: 0.85in 1in 1in 1in;
  @bottom-center {
    content: none;  /* Overridden per named page */
  }
}
@page content {
  @bottom-center {
    content: "${t._footerText || "Page"} " counter(page);
    font-family: ${t.fontFamily};
    font-size: 8pt;
    color: ${t.slate};
  }
}
@page cover { @bottom-center { content: none; } }
@page part-opener { @bottom-center { content: none; } }
@page toc { @bottom-center { content: none; } }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: ${t.fontFamily};
  font-size: 11pt;
  line-height: 1.6;
  color: ${t.navy};
}

/* ── Cover ── */
.cover-page {
  page: cover;
  page-break-after: always;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100%; text-align: center;
}
.cover-bar { display: flex; gap: 0; }
.cover-bar span { width: 60px; height: 8px; }
.cover-title-block {
  background: ${t.navy};
  border-radius: 12px;
  padding: 36px 32px;
  margin: 28px 0;
  width: 85%;
}
.cover-title {
  font-size: 34pt; font-weight: 800;
  line-height: 1.15; color: white;
  margin-bottom: 12px;
}
.cover-subtitle {
  font-size: 15pt; line-height: 1.4;
  color: #d1d5db; margin-bottom: 14px;
}
.cover-edition {
  font-size: 12pt; font-weight: 700;
  color: ${t.primary}; letter-spacing: 3px;
}

/* ── TOC ── */
.toc-page {
  page: toc;
  page-break-after: always;
  padding-top: 32px;
}
.toc-title {
  font-size: 20pt; font-weight: 800;
  color: ${t.navy}; text-align: center;
  margin-bottom: 20px;
}
.toc-dots {
  text-align: center; margin-bottom: 20px;
  display: flex; justify-content: center; gap: 4px;
}
.toc-entries { max-width: 420px; margin: 0 auto; }
.toc-part {
  font-size: 13pt; color: ${t.navy};
  margin-top: 10px; margin-bottom: 4px;
}
.toc-chapter {
  font-size: 11pt; color: ${t.navy};
  padding-left: 20px; margin-bottom: 3px; line-height: 1.7;
}
.toc-dot { font-size: 10pt; margin-right: 4px; }
.toc-note {
  font-size: 10pt; font-style: italic;
  color: ${t.slate}; text-align: center;
  margin-top: 20px; padding: 0 40px;
}

/* ── Part Opener ── */
.part-opener {
  page: part-opener;
  page-break-after: always;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100%; text-align: center;
}
.part-num {
  font-size: 14pt; font-weight: 700;
  color: ${t.primary}; letter-spacing: 2px;
  margin-bottom: 8px;
}
.part-title {
  font-size: 30pt; font-weight: 800;
  color: ${t.navy}; margin-bottom: 10px;
}
.part-sub {
  font-size: 13pt; font-style: italic;
  color: ${t.slate};
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
  color: ${t.primary}; letter-spacing: 1.5px;
  margin-bottom: 4px;
}
.ch-title {
  font-size: 22pt; font-weight: 800;
  color: ${t.navy}; line-height: 1.25;
  margin-bottom: 8px;
}
.chapter-header hr {
  border: none;
  border-top: 1px solid ${t.border};
  margin-bottom: 18px;
}

/* ── Content ── */
/* Content-level elements all share the "content" named page
   so Chromium doesn't insert spurious page breaks between them. */
h3, p, ul.content-list, .callout, .pro-tip, .figure, .sources, .wrapup {
  page: content;
}

h3 {
  font-size: 15pt; font-weight: 700;
  color: ${t.headingColor};
  margin-top: 22px; margin-bottom: 10px;
  page-break-after: avoid;
}
p {
  margin-bottom: 10px;
  text-align: justify;
  line-height: 1.55;
}

/* ── Figures ── */
.figure {
  page-break-inside: avoid;
  margin: 16px 0; text-align: center;
}
.figure img, .figure canvas {
  max-width: 100%;
  border: 1.5px solid ${t.border};
  border-radius: 8px;
  padding: 12px;
  background: white;
}
.figure.narrow img, .figure.narrow canvas { max-width: 65%; }
.figure figcaption {
  font-size: 9pt; font-style: italic;
  color: ${t.slate}; margin-top: 6px;
}

/* ── Callouts ── */
.callout {
  page-break-inside: avoid;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 14px 0;
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
  padding: 14px 18px;
  margin: 14px 0;
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
  margin-top: 20px;
  border-top: 1px solid ${t.border};
  padding-top: 10px;
}
.sources h4 {
  font-size: 10pt; font-weight: 700;
  color: ${t.slate}; letter-spacing: 1px;
  margin-bottom: 6px;
}
.sources a {
  display: block; font-size: 9pt;
  color: #2563eb; text-decoration: none;
  padding: 1px 0 1px 12px; line-height: 1.5;
}

/* ── Wrapup ── */
.wrapup {
  margin-top: 24px;
  border-top: 1px solid ${t.border};
  padding-top: 16px;
}

${boxCSS}
`;
}

module.exports = { generateCSS };
