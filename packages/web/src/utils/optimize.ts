import type { DropTable } from '@warframe-dropper/types'
import { findExactDrop } from './search'
import { parseRelicGroup } from './relic'

export interface RelicCoverage {
  relicBase: string
  coveredItems: Array<{ item: string; chance: number; rarity: string }>
  totalChance: number
}

export function findRelicOverlaps(data: DropTable, trackedItems: string[]): RelicCoverage[] {
  const relicMap = new Map<string, Map<string, { chance: number; rarity: string }>>()

  for (const item of trackedItems) {
    const exact = findExactDrop(data, item)
    if (!exact) continue

    for (const source of exact.sources) {
      const parsed = parseRelicGroup(source.groupName)
      if (!parsed) continue
      const base = parsed.base

      const itemMap = relicMap.get(base) ?? new Map()
      const existing = itemMap.get(item)
      if (!existing || source.chance > existing.chance) {
        itemMap.set(item, { chance: source.chance, rarity: source.rarity })
      }
      relicMap.set(base, itemMap)
    }
  }

  return Array.from(relicMap.entries())
    .filter(([, items]) => items.size >= 2)
    .map(([relicBase, items]) => {
      const coveredItems = Array.from(items.entries()).map(([item, { chance, rarity }]) => ({
        item,
        chance,
        rarity,
      }))
      const totalChance = coveredItems.reduce((sum, { chance }) => sum + chance, 0)
      return { relicBase, coveredItems, totalChance }
    })
    .sort((a, b) =>
      b.coveredItems.length !== a.coveredItems.length
        ? b.coveredItems.length - a.coveredItems.length
        : b.totalChance - a.totalChance,
    )
}
