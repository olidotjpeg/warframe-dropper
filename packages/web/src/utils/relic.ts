export const REFINEMENTS = ['Intact', 'Exceptional', 'Flawless', 'Radiant'] as const
export type Refinement = (typeof REFINEMENTS)[number]

export const RELIC_RE = /^(.+?)\s*\((Intact|Exceptional|Flawless|Radiant)\)$/

export function parseRelicGroup(name: string): { base: string; refinement: Refinement } | null {
  const m = name.match(RELIC_RE)
  return m ? { base: m[1], refinement: m[2] as Refinement } : null
}

export function raritySlug(rarity: string) {
  return rarity.toLowerCase().replace(/\s+/g, '-')
}
