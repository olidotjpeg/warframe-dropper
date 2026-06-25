# WD-9: Implement index.ts — entry point and file writing

**Epic:** B — Parser
**Depends on:** WD-6, WD-7, WD-8
**Estimate:** S (1 hour)

## Goal

Wire together fetch + parse and write the output to two JSON files: `latest.json` (always overwritten) and a dated snapshot `YYYY-MM-DD.json`. After this ticket, `npm run parse` is fully functional.

## Acceptance Criteria

- [ ] `npm run parse` writes `packages/web/public/data/latest.json`
- [ ] `npm run parse` writes `packages/web/public/data/YYYY-MM-DD.json` (today's date)
- [ ] Both files are valid JSON containing a `DropTable` object
- [ ] `latest.json` has a `sections` array with 50+ sections
- [ ] Running `npm run parse` a second time overwrites both files cleanly

## Implementation Notes

### Final `packages/parser/src/index.ts`

```typescript
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fetchHtml } from './fetch.js';
import { parseHtml } from './parse.js';

const OUT_DIR = join(
  new URL('.', import.meta.url).pathname,
  '../../../web/public/data'
);

async function main() {
  console.log('Fetching drop table...');
  const html = await fetchHtml();

  console.log('Parsing...');
  const table = parseHtml(html);
  console.log(`Parsed ${table.sections.length} sections`);

  // Ensure the output directory exists
  mkdirSync(OUT_DIR, { recursive: true });

  // Write latest.json
  const latestPath = join(OUT_DIR, 'latest.json');
  writeFileSync(latestPath, JSON.stringify(table, null, 2));
  console.log(`Wrote ${latestPath}`);

  // Write dated snapshot
  const date = new Date().toISOString().slice(0, 10); // "2026-06-25"
  const snapshotPath = join(OUT_DIR, `${date}.json`);
  writeFileSync(snapshotPath, JSON.stringify(table, null, 2));
  console.log(`Wrote ${snapshotPath}`);

  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Notes on the path calculation

`import.meta.url` gives the URL of the current module (the `index.ts` file). Converting it to a path with `new URL('.', import.meta.url).pathname` gives the directory of `index.ts`. From there, `../../../web/public/data` navigates up to the repo root and back down to the web app's public folder.

> **Alternatively**, you can hardcode the path relative to the repo root using `process.cwd()` if you always run the script from the root:
> ```typescript
> const OUT_DIR = join(process.cwd(), 'packages/web/public/data');
> ```
> The `import.meta.url` approach is more robust if someone runs the script from a different directory.

### Verify the output

```sh
npm run parse
cat packages/web/public/data/latest.json | head -20
```

Expected output begins with:
```json
{
  "fetchedAt": "2026-06-25T...",
  "lastUpdate": "...",
  "sections": [
    {
      "id": "missionRewards",
      "name": "...",
      "groups": [...]
    },
```

### Add output files to `.gitignore`

The JSON files are generated artifacts — don't commit them:

```
# .gitignore
packages/web/public/data/*.json
```

But keep `packages/web/public/data/.gitkeep` tracked so the directory exists in git.

## Definition of Done

- [ ] `npm run parse` exits with code 0 and prints "Done!"
- [ ] `packages/web/public/data/latest.json` exists and is valid JSON
- [ ] `packages/web/public/data/latest.json` has `sections.length > 50`
- [ ] A dated snapshot file also appears in the same directory
- [ ] `.gitignore` excludes the generated JSON files
