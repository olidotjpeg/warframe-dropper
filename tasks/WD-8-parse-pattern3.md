# WD-8: Implement parse.ts — Pattern 3 (Bounties)

**Epic:** B — Parser
**Depends on:** WD-5
**Estimate:** M (2–3 hours)

## Goal

Implement `parsePattern3()` for bounty tables that have the deepest nesting: Group → Rotation → Stage → Drop. Bounties have multiple rotations (A/B/C) and within each rotation, multiple stages (Stage 1, Stage 2, etc.).

## Acceptance Criteria

- [ ] `cetusRewards` has groups named like `"Level 5 - 15 Cetus Bounty"`
- [ ] Each group has multiple named rotations (A, B, C)
- [ ] Each rotation has multiple named stages (Stage 1, Stage 2, Stage 3…)
- [ ] Drops are assigned to the correct stage
- [ ] No TypeScript errors

## Background: the HTML structure

```html
<!-- Group header: colspan=3, contains "Bounty" in text -->
<tr><th colspan="3">Level 5 - 15 Cetus Bounty</th></tr>

<!-- Rotation header: colspan=3, text is "Rotation A" etc. -->
<tr><th colspan="3">Rotation A</th></tr>

<!-- Stage header: empty first cell, th with colspan=2 for stage name -->
<tr>
  <td class="pad-cell"></td>
  <th colspan="2">Stage 1</th>
</tr>

<!-- Drop row: empty first cell, item, rarity+chance -->
<tr>
  <td></td>
  <td>Kuva</td>
  <td>Common (20.00%)</td>
</tr>

<!-- Blank row separates groups -->
<tr class="blank-row"><td colspan="3"></td></tr>
```

## Implementation Notes

### Implementation

```typescript
function parsePattern3($: cheerio.CheerioAPI, rows: cheerio.Element[]): Group[] {
  const groups: Group[] = [];
  let currentGroup: Group | null = null;
  let currentRotation: Rotation | null = null;
  let currentStage: Stage | null = null;

  for (const row of rows) {
    const $row = $(row);

    if ($row.hasClass('blank-row')) {
      currentGroup = null;
      currentRotation = null;
      currentStage = null;
      continue;
    }

    const firstCell = $row.find('th, td').first();
    const allTh = $row.find('th').toArray();
    const allTd = $row.find('td').toArray();

    // Group or Rotation header: <th colspan="3">
    if (firstCell.is('th') && firstCell.attr('colspan') === '3') {
      const text = firstCell.text().trim();

      if (/^Rotation\s+[A-C]$/i.test(text)) {
        // Rotation header
        currentRotation = { name: text.replace(/^Rotation\s+/i, ''), stages: [] };
        currentGroup!.rotations.push(currentRotation);
        currentStage = null;
      } else {
        // Group header
        currentGroup = { name: text, rotations: [] };
        groups.push(currentGroup);
        // Start with a default rotation for content that has no rotation headers
        currentRotation = { name: '', stages: [] };
        currentGroup.rotations.push(currentRotation);
        currentStage = null;
      }
      continue;
    }

    // Stage header: first cell is <td class="pad-cell">, second is <th colspan="2">
    if ($(allTd[0]).hasClass('pad-cell') && allTh.length > 0) {
      const stageName = $(allTh[0]).text().trim();
      currentStage = { name: stageName, drops: [] };
      currentRotation!.stages.push(currentStage);
      continue;
    }

    // Drop row: 3 <td> cells, first is empty
    if (allTd.length >= 3 && currentStage) {
      const item = $(allTd[1]).text().trim();
      const rarityChance = $(allTd[2]).text().trim();
      const drop = parseRarityChance(rarityChance);
      if (item && drop) {
        currentStage.drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}
```

### Wiring it in

Update `parseGroups` in `parse.ts`:

```typescript
if (pattern === 3) return parsePattern3($, rows);
```

### Spot-check

```typescript
const cetusSection = table.sections.find(s => s.id === 'cetusRewards');
const firstGroup = cetusSection?.groups[0];
console.log('Group:', firstGroup?.name);
console.log('Rotations:', firstGroup?.rotations.map(r => r.name));
console.log('Stages in rot A:', firstGroup?.rotations[0]?.stages.map(s => s.name));
```

### Sections that use Pattern 3

```
cetusRewards, solarisRewards, deimosRewards,
entratiLabRewards, hexRewards, zarimanRewards
```

And some others like `duviricircuit`, `roathe`, `faceoff:singlesquad`, `faceoff:squadvssquad`.

### Common pitfalls

- Some bounty tables have no rotation headers — all drops go into the default `Rotation { name: '' }`. The single unnamed rotation handles this, but make sure you don't accidentally push a second default rotation when a new group starts mid-table.
- A blank-row **always** ends a group. Don't try to detect group boundaries any other way.

## Definition of Done

- [ ] `cetusRewards` groups have rotations with 2+ stages each
- [ ] Stage names are `"Stage 1"`, `"Stage 2"`, etc. (not empty)
- [ ] `npm run parse` exits cleanly after this ticket and WD-6/WD-7 are also merged
