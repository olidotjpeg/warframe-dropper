# WD-5: Implement parse.ts — skeleton and section detection

**Epic:** B — Parser
**Depends on:** WD-4
**Estimate:** M (2–3 hours)

## Goal

Build the outer shell of the parser: load the HTML into cheerio, extract the `lastUpdate` date, walk every `<h3 id="...">` to discover sections, and for each section detect which of the three table patterns it uses. After this ticket, `parseHtml()` returns a valid `DropTable` with correct metadata and the right number of sections — but groups will be empty arrays (filled in WD-6/7/8).

## Acceptance Criteria

- [ ] `parseHtml(html).lastUpdate` returns a string like `"17 June, 2026"`
- [ ] `parseHtml(html).sections` has one entry per `<h3 id>` in the page (typically 50+)
- [ ] Each section has the correct `id` and `name`
- [ ] No TypeScript errors

## Implementation Notes

### Cheerio basics

Cheerio is a server-side jQuery. You load HTML into it with `load()`, then use CSS selectors just like in a browser:

```typescript
import * as cheerio from 'cheerio';

const $ = cheerio.load(html);
$('h3').each((_, el) => {
  console.log($(el).text());
});
```

### 1. Extract `lastUpdate`

The page has a paragraph like:

```html
<p><b>Last Update:</b> 17 June, 2026</p>
```

Extract it:

```typescript
const lastUpdateRaw = $('p:contains("Last Update:")').text();
// lastUpdateRaw = "Last Update: 17 June, 2026"
const lastUpdate = lastUpdateRaw.replace('Last Update:', '').trim();
```

### 2. Walk sections

Each section starts with an `<h3 id="...">` tag. The table with drop data immediately follows it in the DOM.

```typescript
const sections: Section[] = [];

$('h3[id]').each((_, h3El) => {
  const id = $(h3El).attr('id')!;
  const name = $(h3El).text().trim();

  // Grab the <table> that follows this h3
  const table = $(h3El).next('table');
  const rows = table.find('tr').toArray();

  const pattern = detectPattern($, rows);
  const groups = parseGroups($, rows, pattern); // returns [] for now

  sections.push({ id, name, groups });
});
```

### 3. Detect the pattern

Inspect the **first** row of the table to decide which pattern it is:

```typescript
type Pattern = 1 | 2 | 3;

function detectPattern($: cheerio.CheerioAPI, rows: cheerio.Element[]): Pattern {
  if (rows.length === 0) return 1;

  const firstRow = $(rows[0]);
  const firstTh = firstRow.find('th').first();
  const colspan = firstTh.attr('colspan');
  const text = firstTh.text();

  // Pattern 3: bounties — colspan=3 header containing "Bounty" or known bounty words
  if (colspan === '3' && /bounty|circuit|undercroft|roathe|faceoff|voidstorm|archimed|descend|nokko/i.test(text)) {
    return 3;
  }

  // Pattern 2: enemy drops — first th has no colspan, second th mentions "Drop Chance:"
  const secondTh = firstRow.find('th').eq(1);
  if (!colspan && secondTh.text().includes('Drop Chance:')) {
    return 2;
  }

  return 1;
}
```

> **Tip:** The pattern detection doesn't need to be perfect on day one. Run `npm run parse` on the real HTML and `console.log` each section's id + detected pattern. Compare against the section ID list in `project.md` to spot misclassifications.

### 4. Stub `parseGroups`

```typescript
function parseGroups(
  $: cheerio.CheerioAPI,
  rows: cheerio.Element[],
  pattern: Pattern
): Group[] {
  // Will be implemented in WD-6, WD-7, WD-8
  return [];
}
```

### 5. Assemble the result

```typescript
export function parseHtml(html: string): DropTable {
  const $ = cheerio.load(html);

  const lastUpdateRaw = $('p:contains("Last Update:")').text();
  const lastUpdate = lastUpdateRaw.replace('Last Update:', '').trim();

  const sections: Section[] = [];
  $('h3[id]').each((_, h3El) => { /* ... as above ... */ });

  return {
    fetchedAt: new Date().toISOString(),
    lastUpdate,
    sections,
  };
}
```

## Definition of Done

- [ ] `npm run parse` no longer crashes
- [ ] Temporarily add `console.log(JSON.stringify(table.sections.map(s => s.id)))` to `index.ts` and confirm ~50+ section IDs appear
- [ ] `table.lastUpdate` is a non-empty string
- [ ] All groups arrays are `[]` (groups come in WD-6/7/8)
