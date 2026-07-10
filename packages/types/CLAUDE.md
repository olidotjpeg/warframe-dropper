# packages/types

Shared TypeScript interfaces for the drop table data model, consumed by both `parser` (produces) and `web` (consumes). Everything lives in `src/index.ts` — no build step, no logic, just types.

Shape: `DropTable` → `Section[]` → `Group[]` → `Rotation[]` → `Stage[]` → `Drop[]`. `CollapsedSource` is a flattened view used by the web UI, not part of the raw parsed data.

Changing a type here affects both other packages — check usages in `packages/parser/src` and `packages/web/src` before altering field names or shapes.
