# WD-7: Implement parse.ts — Pattern 2 (Enemy drops)

**Epic:** B — Parser
**Depends on:** WD-5
**Estimate:** M (1–2 hours)

## Goal

Implement `parsePattern2()` to extract drops from 3-column enemy drop tables. These sections list enemies (e.g. "Scaldra Screamer") with a base drop chance percentage and the individual items they drop.

## Acceptance Criteria

- [ ] `modByAvatar` section contains groups named after enemies
- [ ] Each group has `dropChance` set (e.g. `3.00` for a 3% mod drop chance)
- [ ] Each group's drops have correct `item`, `rarity`, and `chance`
- [ ] No TypeScript errors

## Background: the HTML structure

```html
<!-- Group header: enemy name + drop chance -->
<tr>
  <th>Scaldra Screamer</th>
  <th colspan="2">Mod Drop Chance: 3.00%</th>
</tr>

<!-- Drop row: empty first cell, item name, rarity+chance -->
<tr>
  <td></td>
  <td>Stretch</td>
  <td>Uncommon (12.50%)</td>
</tr>

<!-- Blank row separator -->
<tr class="blank-row"><td colspan="3"></td></tr>
```

## Implementation Notes

### Implementation

```typescript
function parsePattern2($: cheerio.CheerioAPI, rows: cheerio.Element[]): Group[] {
  const groups: Group[] = [];
  let currentGroup: Group | null = null;

  for (const row of rows) {
    const $row = $(row);

    if ($row.hasClass('blank-row')) {
      currentGroup = null;
      continue;
    }

    const firstCell = $row.find('th, td').first();

    // Group header: first cell is <th> with no colspan
    if (firstCell.is('th') && !firstCell.attr('colspan')) {
      const enemyName = firstCell.text().trim();
      const dropChanceText = $row.find('th').eq(1).text().trim();
      // dropChanceText = "Mod Drop Chance: 3.00%"
      const dropChanceMatch = dropChanceText.match(/([0-9.]+)%/);
      const dropChance = dropChanceMatch ? parseFloat(dropChanceMatch[1]) : undefined;

      // Each group gets a single unnamed rotation + unnamed stage
      currentGroup = {
        name: enemyName,
        dropChance,
        rotations: [{ name: '', stages: [{ name: '', drops: [] }] }],
      };
      groups.push(currentGroup);
      continue;
    }

    // Drop row: first cell is empty <td>, second is item, third is rarity
    const cells = $row.find('td').toArray();
    if (cells.length >= 3 && currentGroup) {
      const item = $(cells[1]).text().trim();
      const rarityChance = $(cells[2]).text().trim();
      const drop = parseRarityChance(rarityChance);
      if (item && drop) {
        currentGroup.rotations[0].stages[0].drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}
```

### Wiring it in

Update `parseGroups` in `parse.ts`:

```typescript
if (pattern === 2) return parsePattern2($, rows);
```

### Spot-check

```typescript
const modSection = table.sections.find(s => s.id === 'modByAvatar');
console.log(JSON.stringify(modSection?.groups.slice(0, 1), null, 2));
```

Expected: a group with `name`, `dropChance`, and `rotations[0].stages[0].drops` populated.

### Sections that use Pattern 2

```
modByAvatar, blueprintByAvatar, resourceByAvatar,
relicByAvatar, additionalItemByAvatar, sigilByAvatar,
modByDrop, blueprintByDrop, resourceByDrop
```

## Definition of Done

- [ ] `modByAvatar` has non-empty groups
- [ ] At least one group has `dropChance` set to a number
- [ ] Drops are populated with item names and chances
- [ ] `npm run parse` exits cleanly
