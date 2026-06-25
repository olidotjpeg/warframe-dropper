# Warframe Dropper — Task Board

> Day-to-day work tracker. See `project.md` for full architecture reference.

## Epics

| Epic | Name | Tickets |
|------|------|---------|
| A | Infrastructure | WD-1, WD-2 |
| B | Parser | WD-3 → WD-9 |
| C | Web App | WD-10 → WD-14 |

## Dependency Graph

```
WD-1 (monorepo setup)
  ├── WD-2 (shared types)
  │     └── WD-3 (parser scaffold)
  │           ├── WD-4 (fetch.ts)
  │           │     └── WD-5 (parse skeleton)
  │           │           ├── WD-6 (pattern 1)
  │           │           ├── WD-7 (pattern 2)
  │           │           └── WD-8 (pattern 3)
  │           │                 └── WD-9 (index.ts entry point) ← needs WD-6,7,8
  └── WD-10 (web scaffold)
        └── WD-11 (data loading) ← also needs WD-2
              └── WD-12 (search tab)
                    └── WD-13 (tracked tab)
                          └── WD-14 (CSS polish)
```

## All Tickets

| ID | Title | Epic | Depends On | Size |
|----|-------|------|------------|------|
| [WD-1](WD-1-monorepo-setup.md) | Initialize monorepo with npm workspaces | A | — | S |
| [WD-2](WD-2-shared-types.md) | Create shared types package | A | WD-1 | S |
| [WD-3](WD-3-parser-scaffold.md) | Parser package scaffold | B | WD-1, WD-2 | S |
| [WD-4](WD-4-fetch.md) | Implement fetch.ts | B | WD-3 | S |
| [WD-5](WD-5-parse-skeleton.md) | Implement parse.ts — skeleton + section detection | B | WD-4 | M |
| [WD-6](WD-6-parse-pattern1.md) | Implement parse.ts — Pattern 1 (Missions/Relics/Keys) | B | WD-5 | M |
| [WD-7](WD-7-parse-pattern2.md) | Implement parse.ts — Pattern 2 (Enemy drops) | B | WD-5 | M |
| [WD-8](WD-8-parse-pattern3.md) | Implement parse.ts — Pattern 3 (Bounties) | B | WD-5 | M |
| [WD-9](WD-9-parser-entry.md) | Implement index.ts — entry point and file writing | B | WD-6, WD-7, WD-8 | S |
| [WD-10](WD-10-web-scaffold.md) | Scaffold Vite + React app | C | WD-1 | S |
| [WD-11](WD-11-data-loading.md) | Implement data loading hook | C | WD-10, WD-2 | S |
| [WD-12](WD-12-search-tab.md) | Implement Search tab | C | WD-11 | L |
| [WD-13](WD-13-tracked-tab.md) | Implement Tracked tab + localStorage | C | WD-12 | M |
| [WD-14](WD-14-css-polish.md) | CSS polish + rarity colours | C | WD-13 | M |

## Suggested Start Order

Work through tickets top-to-bottom in this table. WD-6, WD-7, and WD-8 can be done in any order (all depend only on WD-5). WD-10 can be started in parallel with WD-3 if two engineers are available.
