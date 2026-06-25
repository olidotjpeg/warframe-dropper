# WD-2: Create shared types package

**Epic:** A — Infrastructure
**Depends on:** WD-1
**Estimate:** S (30–60 minutes)

## Goal

Create the `@warframe-dropper/types` package that exports TypeScript interfaces used by both the parser and the web app. Defining types once in a shared package means both sides of the project always agree on the data shape — if you change a field here, TypeScript will immediately tell you everywhere it breaks.

## Acceptance Criteria

- [ ] `packages/types/src/index.ts` exports all 6 interfaces: `DropTable`, `Section`, `Group`, `Rotation`, `Stage`, `Drop`
- [ ] Another package can import from `@warframe-dropper/types` (verified in WD-3)
- [ ] The file compiles with no TypeScript errors

## Implementation Notes

### 1. `packages/types/package.json`

```json
{
  "name": "@warframe-dropper/types",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

> **Why `"main": "src/index.ts"`?** In a monorepo with `tsx`, we skip the compilation step and import TypeScript source directly. This is fine for a dev-only tool — we never publish this package to npm.

### 2. `packages/types/src/index.ts`

```typescript
export interface Drop {
  item: string;
  rarity: string;   // "Common" | "Uncommon" | "Rare" | "Ultra Rare" | "Legendary"
  chance: number;   // e.g. 7.69 means 7.69%
}

export interface Stage {
  name: string;     // "" for most content, "Stage 1" / "Stage 2" for bounties
  drops: Drop[];
}

export interface Rotation {
  name: string;     // "A", "B", "C", or "" for non-rotating content
  stages: Stage[];
}

export interface Group {
  name: string;         // e.g. "Mercury/Apollodorus (Survival)", "Scaldra Screamer"
  dropChance?: number;  // only for enemy drop tables, e.g. 3.00 means 3%
  rotations: Rotation[];
}

export interface Section {
  id: string;       // matches the h3 id in the HTML, e.g. "missionRewards"
  name: string;     // human-readable, e.g. "Mission Rewards"
  groups: Group[];
}

export interface DropTable {
  fetchedAt: string;    // ISO 8601 timestamp, e.g. "2026-06-25T10:00:00.000Z"
  lastUpdate: string;   // extracted from page, e.g. "17 June, 2026"
  sections: Section[];
}
```

### Why this nesting structure?

The HTML has three different table layouts (missions, enemies, bounties). Rather than creating different data shapes for each, we use a single universal nesting:

```
Section → Group → Rotation → Stage → Drop
```

- Most content has one unnamed `Rotation` (`name: ""`) and one unnamed `Stage` (`name: ""`).
- Rotating content (missions) has named rotations A/B/C.
- Bounties additionally have named stages within each rotation.

This means the React app only needs one rendering path — no special cases.

## Definition of Done

- [x] File exists at `packages/types/src/index.ts`
- [x] `cd packages/types && npx tsc --noEmit --strict src/index.ts` exits with no errors
- [x] All 6 interfaces are exported (check with `grep "^export interface" packages/types/src/index.ts`)
