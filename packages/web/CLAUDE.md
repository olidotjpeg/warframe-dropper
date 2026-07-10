# packages/web

React + Vite frontend, no backend. All data comes from a static JSON file fetched at runtime.

- `src/main.tsx` → `src/App.tsx` — root component, owns tab state (`search` / `tracked` / `shoppingList`), the tracked-items list (persisted to `localStorage` under key `tracked`), and the shopping-list build/acquired state (see `utils/shoppingList.ts`).
- `src/hooks/useDropData.ts` — fetches `data/latest.json` (from `public/data/`, produced by `packages/parser`) on mount. If missing/failed, tells the user to run `npm run parse`.
- `src/hooks/useItemData.ts` — fetches `data/items-latest.json` (craftable items + recipes, produced by `packages/parser/src/items`) on mount. If missing/failed, tells the user to run `npm run parse:items`; the Shopping List tab (and the "Add to build" affordance in Search) are hidden until this loads successfully.
- `src/components/SearchTab.tsx`, `TrackedTab.tsx`, `ShoppingListTab.tsx`, `SourceList.tsx`, `RelicOptimizer.tsx` — UI split by tab. Search shows a Track button (adds to the tracked list) and, for results that match a craftable item, an "Add to build" button (adds to the shopping-list builds) side by side — there's no separate Build tab. `RelicOptimizer` surfaces relic overlap suggestions using `utils/optimize.ts`.
- `src/utils/search.ts` — `searchDrops`: flattens the nested `DropTable` (section → group → rotation → stage → drop) into per-item `SearchResult[]` with match sources.
- `src/utils/optimize.ts` — `findRelicOverlaps`: given tracked items, finds relics (matched via the `"Name (Rarity)"` group-name pattern) that cover 2+ tracked items, for relic-farming efficiency.
- `src/utils/shoppingList.ts` — `matchBuildableItem` fuzzy-matches a drop-table item name to a craftable `ExportItem` (via `findBestDropMatch` from `@warframe-dropper/types`), `getRecipeIngredients`/`aggregateShoppingList` recursively flatten build recipes into raw farmable resource totals for the Shopping List tab, plus `localStorage` persistence for builds/acquired state.

Run: `npm run dev`. Build: `npm run build --workspace=packages/web` (runs `tsc -b && vite build`).

No test suite. `public/data/*.json` (dated snapshots + `latest.json`) are checked-in data files, not source — don't hand-edit them.
