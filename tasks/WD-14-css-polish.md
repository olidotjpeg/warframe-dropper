# WD-14: CSS polish + rarity colours

**Epic:** C — Web App
**Depends on:** WD-13
**Estimate:** M (2–3 hours)

## Goal

Style the app so it's clean and usable. No UI library — plain CSS. Key requirements: tab navigation, rarity colour-coding, readable drop tables, no horizontal scroll on normal screens.

## Acceptance Criteria

- [ ] Active tab is visually distinct from inactive tabs
- [ ] Rarity labels are colour-coded: Common (grey), Uncommon (green), Rare (gold), Ultra Rare (red), Legendary (purple)
- [ ] Drop tables are readable with sufficient column spacing
- [ ] The search input is prominently sized
- [ ] No horizontal scroll at 1280px viewport width
- [ ] Looks reasonable on mobile (≥375px width) — full responsiveness is optional

## Implementation Notes

### Suggested file structure

Edit `packages/web/src/index.css` for global styles (reset, variables, layout).
Add component-level CSS alongside each component file (e.g. `SearchTab.css`) if you prefer — or keep everything in `index.css` for simplicity.

### CSS custom properties for rarity colours

```css
:root {
  --color-common: #888;
  --color-uncommon: #4caf50;
  --color-rare: #ffc107;
  --color-ultra-rare: #f44336;
  --color-legendary: #9c27b0;
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
  --color-text: #e0e0e0;
  --color-accent: #0f3460;
}
```

### Rarity classes

The `SearchTab` and `TrackedTab` already apply CSS classes like `rarity-common`, `rarity-uncommon`, `rarity-rare`, `rarity-ultra-rare`, `rarity-legendary`. Add the rules:

```css
.rarity-common    { color: var(--color-common); }
.rarity-uncommon  { color: var(--color-uncommon); }
.rarity-rare      { color: var(--color-rare); font-weight: 600; }
.rarity-ultra-rare { color: var(--color-ultra-rare); font-weight: 700; }
.rarity-legendary { color: var(--color-legendary); font-weight: 700; }
```

### Global reset + base

```css
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  font-size: 15px;
}

a { color: inherit; }
```

### Header + tab nav

```css
header {
  background: var(--color-surface);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid #333;
}

header h1 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.05em;
}

nav {
  display: flex;
  gap: 0.5rem;
}

nav button {
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  font-size: 0.95rem;
}

nav button[aria-current="true"] {
  background: var(--color-accent);
  opacity: 1;
}
```

### Main content area

```css
main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}
```

### Search input

```css
input[type="search"] {
  width: 100%;
  max-width: 600px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  background: var(--color-surface);
  border: 1px solid #444;
  border-radius: 6px;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
```

### Result groups

```css
.result-group {
  margin-bottom: 2rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.result-header strong {
  font-size: 1.05rem;
}

.result-header button {
  padding: 0.2rem 0.7rem;
  border: 1px solid #555;
  background: transparent;
  color: var(--color-text);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.result-header button:disabled {
  opacity: 0.4;
  cursor: default;
}

table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.9rem;
}

td {
  padding: 0.25rem 0.75rem;
  border-bottom: 1px solid #2a2a2a;
  vertical-align: top;
}

td:last-child {
  text-align: right;
  white-space: nowrap;
}
```

### Not-found message

```css
.not-found {
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
}
```

### Responsive tweak

```css
@media (max-width: 600px) {
  header { padding: 0.75rem 1rem; flex-wrap: wrap; }
  main { padding: 1rem; }
  td { padding: 0.2rem 0.4rem; }
}
```

## Definition of Done

- [ ] Rarity colours are visible in both Search and Tracked tabs
- [ ] Active tab button is highlighted
- [ ] App is usable at 1280px and 375px widths (no overflow)
- [ ] `npm run build --workspace=packages/web` exits cleanly (no CSS errors block the build)
