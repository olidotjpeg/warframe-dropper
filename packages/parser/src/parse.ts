import * as cheerio from 'cheerio';
import type { DropTable, Section, Group, Rotation, Stage } from "@warframe-dropper/types";

export function parseHtml(html: string): DropTable {
  const $ = cheerio.load(html);

  const lastUpdateRaw = $('p:contains("Last Update:")').text();
  const lastUpdate = lastUpdateRaw.replace('Last Update:', '').trim();

  const sections: Section[] = [];
  $('h3[id]').each((_, h3El) => {
    const id = $(h3El).attr('id')!;
    const name = $(h3El).text().trim();

    const table = $(h3El).next('table');
    const rows = table.find('tr').toArray();

    const pattern = detectPattern($, rows);
    const groups = parseGroups($, rows, pattern);

    sections.push({ id, name, groups });
  });

  return {
    fetchedAt: new Date().toISOString(),
    lastUpdate,
    sections,
  };
}

function parseRarityChance(text: string): { rarity: string; chance: number } | null {
  const match = text.match(/^(.+?)\s*\(([0-9.]+)%\)$/);
  if (!match) return null;
  return { rarity: match[1].trim(), chance: parseFloat(match[2]) };
}

type Pattern = 1 | 2 | 3;

function detectPattern($: cheerio.CheerioAPI, rows: cheerio.Element[]): Pattern {
  if (rows.length === 0) return 1;

  const firstRow = $(rows[0]);
  const firstTh = firstRow.find('th').first();
  const colspan = firstTh.attr('colspan');
  const text = firstTh.text();

  if (colspan === '3' && /bounty|circuit|undercroft|roathe|faceoff|voidstorm|archimed|descend|nokko/i.test(text)) {
    return 3;
  }

  const secondTh = firstRow.find('th').eq(1);
  if (!colspan && secondTh.text().includes('Drop Chance:')) {
    return 2;
  }

  return 1;
}

function parseGroups($: cheerio.CheerioAPI, rows: cheerio.Element[], pattern: Pattern): Group[] {
  if (pattern === 1) return parsePattern1($, rows);
  if (pattern === 2) return parsePattern2($, rows);
  return parsePattern3($, rows);
}

// Pattern 1: 2-column tables — missions, relics, keys, sorties, transients
function parsePattern1($: cheerio.CheerioAPI, rows: cheerio.Element[]): Group[] {
  const groups: Group[] = [];
  let currentGroup: Group | null = null;
  let currentRotation: Rotation | null = null;

  for (const row of rows) {
    const $row = $(row);

    if ($row.hasClass('blank-row')) {
      currentGroup = null;
      currentRotation = null;
      continue;
    }

    const cells = $row.find('th, td').toArray();
    if (cells.length === 0) continue;
    const firstCell = $(cells[0]);

    if (firstCell.is('th') && firstCell.attr('colspan') === '2') {
      const text = firstCell.text().trim();

      if (/^Rotation\s+[A-C]$/i.test(text)) {
        currentRotation = { name: text.replace(/^Rotation\s+/i, ''), stages: [{ name: '', drops: [] }] };
        currentGroup!.rotations.push(currentRotation);
      } else {
        currentRotation = null; // lazily created on first drop row
        currentGroup = { name: text, rotations: [] };
        groups.push(currentGroup);
      }
      continue;
    }

    if (cells.length >= 2 && $(cells[0]).is('td') && currentGroup) {
      const item = $(cells[0]).text().trim();
      const drop = parseRarityChance($(cells[1]).text().trim());
      if (item && drop) {
        if (!currentRotation) {
          currentRotation = { name: '', stages: [{ name: '', drops: [] }] };
          currentGroup.rotations.push(currentRotation);
        }
        currentRotation.stages[0].drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}

// Pattern 2: 3-column tables — enemy drops (mod/blueprint/resource/relic by avatar)
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

    if (firstCell.is('th') && !firstCell.attr('colspan')) {
      const dropChanceText = $row.find('th').eq(1).text().trim();
      const dropChanceMatch = dropChanceText.match(/([0-9.]+)%/);
      currentGroup = {
        name: firstCell.text().trim(),
        dropChance: dropChanceMatch ? parseFloat(dropChanceMatch[1]) : undefined,
        rotations: [{ name: '', stages: [{ name: '', drops: [] }] }],
      };
      groups.push(currentGroup);
      continue;
    }

    const tds = $row.find('td').toArray();
    if (tds.length >= 3 && currentGroup) {
      const item = $(tds[1]).text().trim();
      const drop = parseRarityChance($(tds[2]).text().trim());
      if (item && drop) {
        currentGroup.rotations[0].stages[0].drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}

// Pattern 3: 3-column tables with stages — bounties (cetus, solaris, deimos, etc.)
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

    if (firstCell.is('th') && firstCell.attr('colspan') === '3') {
      const text = firstCell.text().trim();

      if (/^Rotation\s+[A-C]$/i.test(text)) {
        currentRotation = { name: text.replace(/^Rotation\s+/i, ''), stages: [] };
        currentGroup!.rotations.push(currentRotation);
        currentStage = null;
      } else {
        currentRotation = null; // lazily created on first stage row
        currentGroup = { name: text, rotations: [] };
        groups.push(currentGroup);
        currentStage = null;
      }
      continue;
    }

    const tds = $row.find('td').toArray();
    const ths = $row.find('th').toArray();

    // Stage header: first td has class pad-cell, followed by th[colspan=2]
    if (tds.length > 0 && $(tds[0]).hasClass('pad-cell') && ths.length > 0 && currentGroup) {
      if (!currentRotation) {
        currentRotation = { name: '', stages: [] };
        currentGroup.rotations.push(currentRotation);
      }
      currentStage = { name: $(ths[0]).text().trim(), drops: [] };
      currentRotation.stages.push(currentStage);
      continue;
    }

    // Drop row: 3 tds, first empty
    if (tds.length >= 3 && currentStage) {
      const item = $(tds[1]).text().trim();
      const drop = parseRarityChance($(tds[2]).text().trim());
      if (item && drop) {
        currentStage.drops.push({ item, ...drop });
      }
    }
  }

  return groups;
}