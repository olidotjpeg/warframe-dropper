# WD-6: Implement parse.ts — Pattern 1 (Missions / Relics / Keys)

**Epic:** B — Parser
**Depends on:** WD-5
**Estimate:** M (2–3 hours)

## Goal

Implement `parsePattern1()` to extract groups, rotations, and drops from 2-column tables. This pattern covers missions, relics, sortie rewards, key rewards, and similar content — the largest portion of the drop table.

## Acceptance Criteria

- [ ] `missionRewards` section contains groups like `"Mercury/Apollodorus (Survival)"`
- [ ] Groups that have rotations (A/B/C) have multiple `Rotation` objects with correct names
- [ ] Groups without rotations have a single `Rotation` with `name: ""`
- [ ] Each `Drop` has correct `item`, `rarity`, and `chance` (e.g. `{ item: "Forma Blueprint", rarity: "Common", chance: 25.93 }`)
- [ ] No TypeScript errors

## Background: the HTML structure

```html
<!-- Group header (colspan=2, not a rotation name) -->
<tr><th colspan="2">Mercury/Apollodorus (Survival)</th></tr>

<!-- Rotation header (also colspan=2, text starts with "Rotation") -->
<tr><th colspan="2">Rotation A</th></tr>

<!-- Drop row (two <td> cells) -->
<tr><td>Forma Blueprint</td><td>Common (25.93%)</td></tr>

<!-- Blank row = end of group, start of next -->
<tr class="blank-row"><td colspan="2">&nbsp;</td></tr>
```

## Implementation Notes

### The state machine approach

Walk rows one by one, maintaining "current" pointers:

```typescript
function parsePattern1($: cheerio.CheerioAPI, rows: cheerio.Element[]): Group[] {
  const groups: Group[] = [];
  let currentGroup: Group | null = null;
  let currentRotation: Rotation | null = null;

  for (const row of rows) {
    const $row = $(row);

    // Skip blank rows — they separate groups
    if ($row.hasClass('blank-row')) {
      currentGroup = null;
      currentRotation = null;
      continue;
    }

    const cells = $row.find('th, td').toArray();
    const firstCell = $(cells[0]);

    // Two-column <th> = either a group name or a rotation name
    if (firstCell.is('th') && firstCell.attr('colspan') === '2') {
      const text = firstCell.text().trim();

      if (/^Rotation\s+[A-C]$/i.test(text)) {
        // It's a rotation header like "Rotation A"
        currentRotation = { name: text.replace(/^Rotation\s+/i, ''), stages: [{ name: '', drops: [] }] };
        currentGroup!.rotations.push(currentRotation);
      } else {
        // It's a new group
        currentGroup = { name: text, rotations: [] };
        groups.push(currentGroup);
        // Start with a default unnamed rotation
        currentRotation = { name: '', stages: [{ name: '', drops: [] }] };
        currentGroup.rotations.push(currentRotation);
      }
      continue;
    }

    // Two <td> cells = a drop row
    if (cells.length >= 2 && $(cells[0]).is('td') && currentRotation) {
      const item = $(cells[0]).text().trim();
      const rarityChance = $(cells[1]).text().trim();
      const drop = parseRarityChance(rarityChance);
      if (item && drop) {
        currentRotation.stages[0].drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}
```

### Parsing the rarity/chance string

```typescript
function parseRarityChance(text: string): { rarity: string; chance: number } | null {
  // Input: "Rare (7.69%)" or "Common (25.93%)"
  const match = text.match(/^(.+?)\s*\(([0-9.]+)%\)$/);
  if (!match) return null;
  return {
    rarity: match[1].trim(),
    chance: parseFloat(match[2]),
  };
}
```

> **Tip:** Extract `parseRarityChance` at the top of `parse.ts` — all three patterns use it.

### Wiring it in

In your `parseGroups` stub from WD-5, add the real call:

```typescript
function parseGroups($, rows, pattern): Group[] {
  if (pattern === 1) return parsePattern1($, rows);
  if (pattern === 2) return []; // WD-7
  if (pattern === 3) return []; // WD-8
  return [];
}
```

### Debugging tips

Add a temporary log to spot-check:

```typescript
const missionSection = table.sections.find(s => s.id === 'missionRewards');
console.log(JSON.stringify(missionSection?.groups.slice(0, 2), null, 2));
```

Expected output should show groups with rotations and drops populated.

### Edge cases to watch for

- Some groups have no rotation headers at all (e.g. sortie rewards). The default unnamed rotation handles this.
- Some groups do have rotation A/B/C. The rotation header row resets `currentRotation`.
- The first `<th colspan=2>` after a blank-row is always a group name, never a rotation (rotations only appear after a group is established).

## Definition of Done

- [ ] `missionRewards` groups are non-empty
- [ ] At least one group has multiple rotations (A, B, C)
- [ ] Drop chances are numbers (not strings), e.g. `25.93` not `"25.93"`
- [ ] `npm run parse` exits cleanly
