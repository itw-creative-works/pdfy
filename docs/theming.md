# Theming

Pass a `theme` object to the `Ebook` constructor to override any subset of the defaults. Options shallow-merge over `DEFAULT_THEME` (defined in `lib/ebook.js`); `calloutText` is deep-merged so you can override a single entry.

```js
const book = new Ebook({
  title: 'My Book',
  theme: {
    primary: '#0EA5E9',
    headingColor: '#0369A1',
    calloutText: { sky: '#0284C7' },
    _footerText: 'My Book  |  Page',
  },
});
```

## Theme keys and defaults

### Primary palette

| Key | Default | Used for |
|---|---|---|
| `primary` | `#FF6B6B` | Cover edition line, part/chapter eyebrows, TOC dots, callout accents |
| `secondary` | `#4ECDC4` | Decorative bars, mint callout accent |
| `accent` | `#A78BFA` | Decorative bars, lavender callout accent |

### Extended palette

| Key | Default |
|---|---|
| `blue` | `#60A5FA` |
| `pink` | `#F472B6` |
| `orange` | `#FB923C` |
| `yellow` | `#FBBF24` |
| `green` | `#34D399` |

These feed the decorative cover/chapter color bars and the per-variant callout accents.

### Neutrals

| Key | Default | Used for |
|---|---|---|
| `navy` | `#1e293b` | Body text, titles, cover title block background, chart default text color |
| `slate` | `#64748b` | Captions, footers, sources headings, subtitles |
| `border` | `#e2e8f0` | Rules, figure borders |
| `light` | `#f8fafc` | Reserved light background |

### Background tints (callout/tip fills)

| Key | Default |
|---|---|
| `lavender` | `#f5f3ff` |
| `blush` | `#fff1f2` |
| `sky` | `#f0f9ff` |
| `cream` | `#fffbeb` |
| `mint` | `#ecfdf5` |

### `calloutText`

Per-variant text color inside callouts:

| Key | Default |
|---|---|
| `lavender` | `#7c3aed` |
| `blush` | `#FF6B6B` |
| `sky` | `#60A5FA` |
| `cream` | `#92400e` |
| `mint` | `#065f46` |

### Typography & misc

| Key | Default | Notes |
|---|---|---|
| `fontFamily` | `'Inter', 'Helvetica Neue', Arial, sans-serif` | Applied to body and charts |
| `fontImport` | Google Fonts Inter URL | **Declared but not currently injected into the document** — the font stack falls back to locally installed fonts. Wire it into `toHTML()` if web-font loading is needed. |
| `headingColor` | `#7c3aed` | `.h3()` section headings |
| `_footerText` | *(unset)* | Footer prefix on content pages: renders as `"<_footerText> <page number>"`. When unset, footers read `"Page N"`. |

## Callout / tip variants

The five tints — `lavender`, `blush`, `sky`, `cream`, `mint` — each produce a `.callout.<name>` and `.pro-tip.<name>` style pairing the tint background with its accent and text colors:

| Variant | Background | Accent (label) | Text |
|---|---|---|---|
| `lavender` | `theme.lavender` | `theme.accent` | `calloutText.lavender` |
| `blush` | `theme.blush` | `theme.primary` | `calloutText.blush` |
| `sky` | `theme.sky` | `theme.blue` | `calloutText.sky` |
| `cream` | `theme.cream` | `theme.orange` | `calloutText.cream` |
| `mint` | `theme.mint` | `theme.secondary` | `calloutText.mint` |

```js
book.callout('Key takeaway.', { style: 'cream', label: 'REMEMBER' });
book.tip('Shortcut worth knowing.', { style: 'sky' });
```

## Chart defaults

At render time, `Chart.defaults.font.family` is set to `theme.fontFamily` and `Chart.defaults.color` to `theme.navy`, so charts inherit the book's typography automatically. Chart series colors are whatever you pass to the helpers — pull them from your theme for consistency.
