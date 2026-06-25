# WD-3: Parser package scaffold

**Epic:** B — Parser
**Depends on:** WD-1, WD-2
**Estimate:** S (1 hour)

## Goal

Create the `@warframe-dropper/parser` package with its `package.json`, installed dependencies, and empty source files. After this ticket the parser compiles and runs without errors, even though it doesn't do anything useful yet.

## Acceptance Criteria

- [ ] `packages/parser/package.json` exists and references `cheerio` and `tsx`
- [ ] `cheerio` is installed (appears in `node_modules/.package-lock.json`)
- [ ] Running `npm run parse` from the root exits with code 0 and prints something to stdout
- [ ] No TypeScript import errors in any of the three empty source files

## Implementation Notes

### 1. `packages/parser/package.json`

```json
{
  "name": "@warframe-dropper/parser",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@warframe-dropper/types": "*",
    "cheerio": "^1.0.0"
  }
}
```

> **`"*"` as a version for the local types package** — npm workspaces resolves `*` to the local package automatically. No need to specify a version number.

### 2. Install the new dependency

From the repo root:

```sh
npm install
```

This picks up the new `cheerio` dependency and installs it into the root `node_modules/`.

### 3. Create empty source files

**`packages/parser/src/fetch.ts`**

```typescript
import type { } from '@warframe-dropper/types';

export async function fetchHtml(): Promise<string> {
  // TODO: implement in WD-4
  throw new Error('not implemented');
}
```

**`packages/parser/src/parse.ts`**

```typescript
import type { DropTable } from '@warframe-dropper/types';

export function parseHtml(_html: string): DropTable {
  // TODO: implement in WD-5, WD-6, WD-7, WD-8
  throw new Error('not implemented');
}
```

**`packages/parser/src/index.ts`**

```typescript
import { fetchHtml } from './fetch.js';
import { parseHtml } from './parse.js';

async function main() {
  console.log('Fetching drop table...');
  const html = await fetchHtml();
  console.log(`Fetched ${html.length} bytes`);

  console.log('Parsing...');
  const table = parseHtml(html);
  console.log(`Parsed ${table.sections.length} sections`);
}

main().catch(console.error);
```

> **Why `.js` extensions on imports?** TypeScript with `"moduleResolution": "bundler"` or ESM requires `.js` even though the actual files are `.ts`. This is a known TypeScript quirk. `tsx` handles the resolution correctly at runtime.

### Gotchas

- If you get "Cannot find module '@warframe-dropper/types'" — make sure you ran `npm install` from the **root**, not from inside `packages/parser/`.
- `cheerio` exports are CommonJS; the `esModuleInterop: true` in the root tsconfig handles the import style.

## Definition of Done

- [ ] `npm install` from root exits cleanly
- [ ] `npm run parse` prints "Fetching drop table..." then crashes with "not implemented" (expected)
- [ ] No red squiggles in VS Code on any import statement
