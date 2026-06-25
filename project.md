# Warframe Drop Table Parser + Viewer

> **Working on this project?** See [`tasks/README.md`](tasks/README.md) for the ticket board. This file is the architecture reference.

## Overview

A monorepo with a CLI parser that fetches the official Warframe drop table HTML, converts it to JSON, and a static React app that lets you search drops and track specific items.

**Run the parser whenever a patch drops → refresh the app.**

---

## Monorepo Layout (npm workspaces)

```
warframe-dropper/
├── package.json              # workspace root
├── packages/
│   ├── types/                # shared TS interfaces
│   │   └── src/index.ts
│   ├── parser/               # CLI script
│   │   └── src/
│   │       ├── fetch.ts      # download the HTML
│   │       ├── parse.ts      # HTML → DropTable (cheerio)
│   │       └── index.ts      # entry point, writes JSON output
│   └── web/                  # Vite + React app
│       ├── public/
│       │   └── data/         # ← parser writes JSON here
│       └── src/
```

---

## Data Model (`packages/types/src/index.ts`)

```ts
interface DropTable {
  fetchedAt: string;   // ISO timestamp
  lastUpdate: string;  // "17 June, 2026" from page header
  sections: Section[];
}

interface Section {
  id: string;          // "missionRewards", "relicRewards", "modByAvatar", etc.
  name: string;        // "Missions", "Relics", "Mod Drops by Source", etc.
  groups: Group[];
}

interface Group {
  name: string;        // "Mercury/Apollodorus (Survival)", "Scaldra Screamer", "Axi A1 Relic (Intact)"
  dropChance?: number; // only for enemy tables (e.g. 3.00 for 3% base drop)
  rotations: Rotation[];
}

interface Rotation {
  name: string;        // "A", "B", "C", or "" for non-rotating content
  stages: Stage[];
}

interface Stage {
  name: string;        // "" for most, "Stage 1" / "Stage 2, Stage 3..." for bounties
  drops: Drop[];
}

interface Drop {
  item: string;
  rarity: string;      // "Common" | "Uncommon" | "Rare" | "Ultra Rare" | "Legendary"
  chance: number;      // 7.69 (percent)
}
```

The `Rotation → Stage` nesting handles all three HTML table patterns without special-casing in the React app.

---

## HTML Source

URL: `https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html`

The page has three distinct table patterns:

### Pattern 1 — Missions / Relics / Keys (2-column)
Sections: `missionRewards`, `relicRewards`, `keyRewards`, `transientRewards`, `sortieRewards`

```html
<tr><th colspan="2">Mercury/Apollodorus (Survival)</th></tr>  ← group name
<tr><th colspan="2">Rotation A</th></tr>                       ← rotation (may be absent)
<tr><td>Item Name</td><td>Rare (7.69%)</td></tr>              ← drop
<tr class="blank-row">...</tr>                                  ← group separator
```

### Pattern 2 — Enemy drops (3-column)
Sections: `modByAvatar`, `blueprintByAvatar`, `resourceByAvatar`, `relicByAvatar`, `additionalItemByAvatar`, `sigilByAvatar`

```html
<tr><th>Scaldra Screamer</th><th colspan="2">Mod Drop Chance: 3.00%</th></tr>  ← group
<tr><td></td><td>Item Name</td><td>Uncommon (12.50%)</td></tr>                  ← drop
<tr class="blank-row"><td colspan="3"></td></tr>                                 ← separator
```

### Pattern 3 — Bounties (3-column with stages)
Sections: `cetusRewards`, `solarisRewards`, `deimosRewards`, `entratiLabRewards`, `hexRewards`, `zarimanRewards`

```html
<tr><th colspan="3">Level 5 - 15 Cetus Bounty</th></tr>           ← group name
<tr><th colspan="3">Rotation A</th></tr>                            ← rotation
<tr><td class="pad-cell"></td><th colspan="2">Stage 1</th></tr>    ← stage
<tr><td></td><td>Item Name</td><td>Uncommon (20.00%)</td></tr>     ← drop
```

### Detecting which pattern to use
Check the first data row's structure:
- `th` with `colspan=3` and "Bounty" in text → Pattern 3
- `th` with no `colspan` and "Drop Chance:" in sibling → Pattern 2
- Otherwise → Pattern 1

---

## Parser (`packages/parser`)

### Dependencies
- `cheerio` — HTML parsing with CSS selectors
- `tsx` — run TypeScript directly

### `fetch.ts`
Download the HTML with `fetch()` and return it as a string.

### `parse.ts`
1. Load HTML into cheerio
2. Extract `lastUpdate` from the `<p><b>Last Update:</b>` text
3. Find all `h3[id]` elements — each is a section
4. For each section, find the following `<table>` and parse rows:
   - Detect pattern by inspecting `th` colspan values
   - Track current group / rotation / stage as you walk rows
   - Skip `blank-row` rows (they are group separators, reset state)
   - Parse rarity strings: `"Rare (7.69%)"` → `{ rarity: "Rare", chance: 7.69 }`

### `index.ts`
1. Call fetch + parse
2. Write `packages/web/public/data/latest.json`
3. Write `packages/web/public/data/YYYY-MM-DD.json` (versioned snapshot)

### npm script (root `package.json`)
```json
"scripts": {
  "parse": "tsx packages/parser/src/index.ts"
}
```

---

## React App (`packages/web`)

### Data loading
`fetch('/data/latest.json')` on app startup. Keeps JSON separate from the JS bundle so you can update it without rebuilding.

### Views (two tabs, no router needed)

**Search (default)**
- Text input filters `Drop.item` across all sections
- Results grouped by source, e.g.:
  ```
  Nikana Prime Blueprint
    Relics  →  Axi A1 Relic (Intact)   Rare    2.00%
    Relics  →  Axi A1 Relic (Radiant)  Uncommon  10.00%
  ```
- Show the section name, group name, rotation, and stage for full context
- "Track" button on each result

**Tracked**
- List of item names saved to `localStorage`
- Re-runs the same search logic for each tracked item
- Shows current drop rates — if they changed after a parse you'll notice immediately

### Dependencies
- `vite` + `@vitejs/plugin-react`
- `typescript`

No UI library required — the interface is simple enough for plain CSS.

---

## Workflow

```sh
# Initial setup
npm install

# Fetch and parse latest drop tables
npm run parse

# Start the React app
npm run dev

# After a Warframe patch:
npm run parse   # overwrites latest.json, saves a dated snapshot
# refresh the browser
```

---

## All Section IDs (for reference)

```
missionRewards        relicRewards          keyRewards
transientRewards      sortieRewards         arbitrations
derelictvault         phoridassassination   nightmaremoderewards
fomoriansabotage      razorback             kuvasiphon
kuvaflood             granumvoid            extendedgranumvoid
nightmareGranumvoid   cetusRewards          solarisRewards
deimosRewards         entratiLabRewards     hexRewards
zarimanRewards        duviricircuit         duviristaticundercroftportal
roathe                faceoff:singlesquad   faceoff:squadvssquad
voidstorm(earth)      voidstorm(venus)      voidstorm(saturn)
voidstorm(neptune)    voidstorm(pluto)      voidstorm(veilproxima)
deeparchimedeaarcane  temporalarchimedeagoldrewards  (+ steel path variants)
thedescendia:*        nokko:*
modByAvatar           blueprintByAvatar     resourceByAvatar
relicByAvatar         additionalItemByAvatar sigilByAvatar
modByDrop             blueprintByDrop       resourceByDrop
```
