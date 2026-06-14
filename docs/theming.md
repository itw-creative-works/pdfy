# Theming

The theme is the single source of truth for every visual decision: colors, the palette series, callout tints, fonts, type sizes, spacing, page setup, and the footer. Define overrides once — usually in a shared `project.js` — and every part script inherits them.

```js
const { createProject } = require('pdfy');

module.exports = createProject({
  title: 'My Book',
  theme: {
    colors: { primary: '#0EA5E9', heading: '#0369A1' },
    fonts: { family: `'Sora', sans-serif`, import: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;700&display=swap' },
    page: { format: 'A4' },
    footer: { text: '{title}  |  Page {page}' },
  },
  output: { dir: `${__dirname}/output`, html: true },
});
```

## Resolution rules

- Overrides **deep-merge** onto `DEFAULT_THEME` — set only what you change.
- **Arrays replace wholesale**: a custom `palette` fully replaces the default order.
- After merging, every color-name reference (palette entries, tint `accent`/`text`/`background`) is **resolved to hex**. Resolution is idempotent.
- **Anywhere a color is accepted** — chart `color`/`colors`, TOC `color`, tint fields — you can pass a theme color name (`'primary'`), raw hex/rgb/hsl, or a CSS keyword.

## Theme schema and defaults

### `colors` — named colors

| Key | Default | Role |
|---|---|---|
| `primary` | `#FF6B6B` | Brand lead: edition line, part/chapter eyebrows |
| `secondary` | `#4ECDC4` | Brand support |
| `accent` | `#A78BFA` | Brand accent |
| `blue` | `#60A5FA` | Extended palette |
| `pink` | `#F472B6` | Extended palette |
| `orange` | `#FB923C` | Extended palette |
| `yellow` | `#FBBF24` | Extended palette |
| `green` | `#34D399` | Extended palette |
| `text` | `#1e293b` | Body text, titles, cover block background, chart text |
| `muted` | `#64748b` | Captions, footers, subtitles, notes |
| `border` | `#e2e8f0` | Rules, figure borders, chart grid lines (with alpha) |
| `surface` | `#f8fafc` | Stat card backgrounds, table zebra rows |
| `heading` | `#7c3aed` | `.h3()` section headings |
| `link` | `#2563eb` | Source links |
| `green` | `#34D399` | Default checklist badge color (also in the extended palette) |

### `palette` — the ordered series

```js
palette: ['primary', 'pink', 'accent', 'secondary', 'blue', 'orange']
```

Drives — in this order, cycling as needed:
- Cover bars + gradient accent (6), TOC dot rows (5), part-opener bars (3), chapter bars (5)
- **TOC chapter dot auto-cycling** (restarts at each part)
- **Default chart colors**: bar/doughnut series get `palette(n)`; line/groupedBar/radar datasets get `palette(datasets.length)[i]`
- **Stat card and step number colors** when not set per item

Entries are color names or raw hex. Custom palettes replace the default order entirely.

### `tints` — callout/tip variants

Each variant pairs a background with an accent (label) and text color:

| Variant | `background` | `accent` | `text` |
|---|---|---|---|
| `lavender` | `#f5f3ff` | `accent` | `#7c3aed` |
| `blush` | `#fff1f2` | `primary` | `primary` |
| `sky` | `#f0f9ff` | `blue` | `blue` |
| `cream` | `#fffbeb` | `orange` | `#92400e` |
| `mint` | `#ecfdf5` | `secondary` | `#065f46` |

```js
book.callout('Key takeaway.', { style: 'cream', label: 'REMEMBER' });
book.tip('Shortcut worth knowing.', { style: 'sky' });
```

Add or override variants via `theme.tints` — new keys become valid `style` values automatically.

### `fonts`

| Key | Default | Notes |
|---|---|---|
| `family` | `'Inter', 'Helvetica Neue', Arial, sans-serif` | Body and chart typography |
| `import` | Google Fonts Inter URL | Injected as a `<link>` in the document head; export waits on `document.fonts.ready`. Set to `''`/`null` to skip web-font loading. |
| `lineHeight` | `1.6` | Body line height |

### `sizes` — type scale

| Key | Default | Applies to |
|---|---|---|
| `body` | `11pt` | Body text, TOC chapters |
| `coverTitle` | `34pt` | Cover title |
| `partTitle` | `30pt` | Part opener title |
| `chapterTitle` | `22pt` | Chapter title |
| `heading` | `15pt` | `.h3()` headings |
| `caption` | `9pt` | Figure captions, source links |
| `footer` | `8pt` | Page footer |

### `spacing`

| Key | Default | Applies to |
|---|---|---|
| `paragraph` | `10px` | Paragraph bottom margin |
| `section` | `22px` | `.h3()` top margin |
| `block` | `16px` | Vertical rhythm for figures, callouts, tips |
| `inset` | `16px 20px` | Callout/tip padding |

### `page`

| Key | Default | Notes |
|---|---|---|
| `format` | `'Letter'` | Any Playwright/CSS page size (`'A4'`, …) |
| `margins` | `{ top: '0.85in', right: '1in', bottom: '1in', left: '1in' }` | Shared by the CSS `@page` rule and Playwright's print call — one home, no drift |

### `footer`

| Key | Default | Notes |
|---|---|---|
| `text` | `'Page {page}'` | Rendered bottom-center on content pages only. `{page}` → CSS page counter; `{title}` → the book title. Covers, TOC, and part openers never show footers. |

## Chart theming

At render time `Chart.defaults.font.family` = `fonts.family` and `Chart.defaults.color` = `colors.text`, so charts inherit the book's typography. Grid lines derive from `colors.border` with alpha. Series colors come from the palette unless you pass `color`/`colors` (names or hex).
