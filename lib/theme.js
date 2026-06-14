/**
 * theme.js — Theme defaults, merging, and color resolution.
 * The single source of truth for every visual decision in pdfy.
 */

/**
 * Default theme
 *
 * Shape:
 *   colors  - named colors; everything that accepts a color also accepts these names
 *   palette - ordered series (color names or hex) used by swatch bars, TOC dots,
 *             and chart color defaults
 *   tints   - callout/tip variants: { background, accent, text } per variant
 *   fonts   - family stack, optional web-font import URL, base line height
 *   sizes   - type scale
 *   spacing - vertical rhythm and box padding tokens
 *   page    - PDF page format and margins (shared by CSS @page and Playwright)
 *   footer  - content-page footer template; {page} → page number, {title} → book title
 */
const DEFAULT_THEME = {
  colors: {
    // Brand
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#A78BFA',

    // Extended
    blue: '#60A5FA',
    pink: '#F472B6',
    orange: '#FB923C',
    yellow: '#FBBF24',
    green: '#34D399',

    // Neutrals
    text: '#1e293b',
    muted: '#64748b',
    border: '#e2e8f0',
    surface: '#f8fafc',
    heading: '#7c3aed',
    link: '#2563eb',
  },
  palette: ['primary', 'pink', 'accent', 'secondary', 'blue', 'orange'],
  tints: {
    lavender: { background: '#f5f3ff', accent: 'accent', text: '#7c3aed' },
    blush: { background: '#fff1f2', accent: 'primary', text: 'primary' },
    sky: { background: '#f0f9ff', accent: 'blue', text: 'blue' },
    cream: { background: '#fffbeb', accent: 'orange', text: '#92400e' },
    mint: { background: '#ecfdf5', accent: 'secondary', text: '#065f46' },
  },
  fonts: {
    family: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
    import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    lineHeight: 1.6,
  },
  sizes: {
    body: '11pt',
    coverTitle: '34pt',
    partTitle: '30pt',
    chapterTitle: '22pt',
    heading: '15pt',
    caption: '9pt',
    footer: '8pt',
  },
  spacing: {
    paragraph: '10px',
    section: '22px',
    block: '16px',
    inset: '16px 20px',
  },
  page: {
    format: 'Letter',
    margins: { top: '0.85in', right: '1in', bottom: '1in', left: '1in' },
  },
  footer: { text: 'Page {page}' },
};

/**
 * Page format dimensions in inches (keys lowercase)
 */
const PAGE_SIZES = {
  letter: { width: 8.5, height: 11 },
  legal: { width: 8.5, height: 14 },
  tabloid: { width: 11, height: 17 },
  a3: { width: 11.69, height: 16.54 },
  a4: { width: 8.27, height: 11.69 },
  a5: { width: 5.83, height: 8.27 },
};

/**
 * Printable page height in inches (page height minus vertical margins),
 * used to size full-page sections (cover, part openers) so they truly
 * fill and center on the page. Falls back to 9in for unknown formats
 * or non-inch margins.
 * @param {object} page - Theme page settings ({ format, margins })
 * @returns {number} Printable height in inches
 */
function printableHeight(page) {
  const size = PAGE_SIZES[String(page.format).toLowerCase()];
  const top = parseFloat(page.margins.top);
  const bottom = parseFloat(page.margins.bottom);
  const usesInches = String(page.margins.top).endsWith('in')
    && String(page.margins.bottom).endsWith('in');

  if (!size || !usesInches || Number.isNaN(top) || Number.isNaN(bottom)) {
    return 9;
  }

  // Small safety margin so rounding never overflows onto a blank page
  return size.height - top - bottom - 0.05;
}

/**
 * Check whether a value is a plain object (not an array, null, etc.)
 */
function isPlainObject(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value);
}

/**
 * Deep-merge overrides onto a base object without mutating either.
 * Plain objects recurse; arrays and scalars replace wholesale.
 * @param {object} base - Base object
 * @param {object} [overrides] - Values to merge on top
 * @returns {object} New merged object
 */
function merge(base, overrides = {}) {
  const result = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      result[key] = merge(base[key], value);
      continue;
    }
    result[key] = value;
  }

  return result;
}

/**
 * Resolve a color value against a named color map.
 * Hex/rgb/hsl values pass through; anything else is a name lookup,
 * falling back to the raw value (CSS keywords like "white" stay valid).
 * @param {object} colors - Named color map (theme.colors)
 * @param {string} value - Color name, hex, or CSS color
 * @returns {string|undefined} Resolved color, or undefined when value is missing
 */
function resolveColor(colors, value) {
  if (!value) {
    return undefined;
  }
  if (/^(#|rgb|hsl)/i.test(value)) {
    return value;
  }
  return colors[value] || value;
}

/**
 * Build a complete theme: deep-merge overrides onto DEFAULT_THEME, then
 * resolve every color-name reference (palette entries, tint accent/text)
 * to hex. Idempotent — resolving an already-resolved theme is a no-op.
 * @param {object} [overrides] - Partial theme overrides
 * @returns {object} Fully resolved theme
 */
function resolveTheme(overrides = {}) {
  const theme = merge(DEFAULT_THEME, overrides);

  // Resolve palette entries to concrete colors
  theme.palette = theme.palette.map((entry) => resolveColor(theme.colors, entry));

  // Resolve tint accent/text references to concrete colors
  theme.tints = Object.fromEntries(
    Object.entries(theme.tints).map(([name, tint]) => [name, {
      background: resolveColor(theme.colors, tint.background),
      accent: resolveColor(theme.colors, tint.accent),
      text: resolveColor(theme.colors, tint.text),
    }])
  );

  return theme;
}

/**
 * First n palette colors, cycling when n exceeds the palette length.
 * @param {object} theme - Resolved theme
 * @param {number} [n] - Number of colors (defaults to the full palette)
 * @returns {string[]} Array of n colors
 */
function palette(theme, n) {
  const series = theme.palette;
  const count = n || series.length;
  return Array.from({ length: count }, (item, i) => series[i % series.length]);
}

module.exports = {
  DEFAULT_THEME,
  merge,
  resolveColor,
  resolveTheme,
  palette,
  printableHeight,
};
