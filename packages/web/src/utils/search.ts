import type { DropTable } from '@warframe-dropper/types'

export interface DropSource {
  sectionName: string
  groupName: string
  rotationName: string
  stageName: string
  rarity: string
  chance: number
}

export interface SearchResult {
  item: string
  sources: DropSource[]
}

export function searchDrops(data: DropTable, query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const matchMap = new Map<string, DropSource[]>()

  for (const section of data.sections) {
    for (const group of section.groups) {
      for (const rotation of group.rotations) {
        for (const stage of rotation.stages) {
          for (const drop of stage.drops) {
            if (!drop.item.toLowerCase().includes(q)) continue
            const source: DropSource = {
              sectionName: section.name,
              groupName: group.name,
              rotationName: rotation.name,
              stageName: stage.name,
              rarity: drop.rarity,
              chance: drop.chance,
            }
            const existing = matchMap.get(drop.item) ?? []
            existing.push(source)
            matchMap.set(drop.item, existing)
          }
        }
      }
    }
  }

  return Array.from(matchMap.entries())
    .map(([item, sources]) => ({ item, sources }))
    .sort((a, b) => a.item.localeCompare(b.item))
}

export function findExactDrop(data: DropTable, item: string): SearchResult | undefined {
  return searchDrops(data, item).find((r) => r.item === item)
}
