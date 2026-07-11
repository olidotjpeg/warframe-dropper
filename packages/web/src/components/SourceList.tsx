import { useState, useMemo } from 'react'
import type { DropSource } from '../utils/search'
import type { CollapsedSource } from '@warframe-dropper/types'
import { REFINEMENTS, type Refinement, parseRelicGroup, raritySlug } from '../utils/relic'

const TRUNCATE_AT = 5

function groupRelics(
  sources: DropSource[],
): Map<string, Partial<Record<Refinement, DropSource>>> | null {
  const entries = sources.map(s => ({ s, r: parseRelicGroup(s.groupName) }))
  if (!entries.some(e => e.r)) return null
  const map = new Map<string, Partial<Record<Refinement, DropSource>>>()
  for (const { s, r } of entries) {
    if (!r) continue
    const row = map.get(r.base) ?? {}
    row[r.refinement] = s
    map.set(r.base, row)
  }
  return map
}

function groupBySection(sources: DropSource[]): Map<string, DropSource[]> {
  const map = new Map<string, DropSource[]>()
  for (const src of sources) {
    const list = map.get(src.sectionName) ?? []
    list.push(src)
    map.set(src.sectionName, list)
  }
  return map
}

function collapseRotations(sources: DropSource[]): CollapsedSource[] {
  const map = new Map<string, CollapsedSource>()
  for (const src of sources) {
    const key = `${src.groupName}|${src.stageName}`
    let entry = map.get(key)
    if (!entry) {
      entry = { groupName: src.groupName, stageName: src.stageName, rotations: [] }
      map.set(key, entry)
    }
    entry.rotations.push({ rotationName: src.rotationName, rarity: src.rarity, chance: src.chance })
  }
  for (const entry of map.values()) {
    entry.rotations.sort((a, b) => a.rotationName.localeCompare(b.rotationName))
  }
  return Array.from(map.values())
}

function maxChance(entry: CollapsedSource) {
  return Math.max(...entry.rotations.map(r => r.chance))
}

function SectionBlock({ name, sources }: { name: string; sources: DropSource[] }) {
  const [showAll, setShowAll] = useState(false)
  const relicGroups = useMemo(() => groupRelics(sources), [sources])
  const collapsedFlat = useMemo(() => collapseRotations(sources), [sources])
  const sortedFlat = useMemo(
    () => [...collapsedFlat].sort((a, b) => maxChance(b) - maxChance(a)),
    [collapsedFlat],
  )
  const sortedRelics = useMemo(() => {
    if (!relicGroups) return null
    return Array.from(relicGroups.entries()).sort(([, a], [, b]) => {
      const best = (m: Partial<Record<Refinement, DropSource>>) =>
        Math.max(...REFINEMENTS.map(r => m[r]?.chance ?? 0))
      return best(b) - best(a)
    })
  }, [relicGroups])

  if (relicGroups && sortedRelics) {
    const visible = showAll ? sortedRelics : sortedRelics.slice(0, TRUNCATE_AT)
    const hiddenCount = sortedRelics.length - TRUNCATE_AT
    return (
      <details className="source-section" open>
        <summary className="source-section-summary">
          <span className="source-section-chevron" aria-hidden="true" />
          <span className="source-section-name">{name}</span>
          <span className="source-section-count">{sortedRelics.length}</span>
        </summary>
        <div className="source-rows">
          {visible.map(([base, byRef]) => (
            <div key={base} className="source-row">
              <span className="source-group">{base}</span>
              {REFINEMENTS.map(ref => {
                const src = byRef[ref]
                if (!src) return null
                return (
                  <span
                    key={ref}
                    className={`source-pill refinement-${ref.toLowerCase()}`}
                    title={`${ref}: ${src.rarity} ${src.chance.toFixed(2)}%`}
                  >
                    {ref[0]} {src.chance.toFixed(2)}%
                  </span>
                )
              })}
            </div>
          ))}
          {!showAll && hiddenCount > 0 && (
            <button className="source-show-more" onClick={() => setShowAll(true)}>
              Show {hiddenCount} more…
            </button>
          )}
        </div>
      </details>
    )
  }

  const visible = showAll ? sortedFlat : sortedFlat.slice(0, TRUNCATE_AT)
  const hiddenCount = sortedFlat.length - TRUNCATE_AT
  return (
    <details className="source-section" open>
      <summary className="source-section-summary">
        <span className="source-section-chevron" aria-hidden="true" />
        <span className="source-section-name">{name}</span>
        <span className="source-section-count">{sortedFlat.length}</span>
      </summary>
      <div className="source-rows">
        {visible.map((entry) => (
          <div key={`${entry.groupName}|${entry.stageName}`} className="source-row">
            <span className="source-group">{entry.groupName}</span>
            {entry.stageName && <span className="source-pill">{entry.stageName}</span>}
            {entry.rotations.map(r => (
              <span
                key={r.rotationName}
                className={`source-pill source-rarity rarity-${raritySlug(r.rarity)}`}
              >
                {r.rotationName && `Rot ${r.rotationName} `}
                {r.rarity} {r.chance.toFixed(2)}%
              </span>
            ))}
          </div>
        ))}
        {!showAll && hiddenCount > 0 && (
          <button className="source-show-more" onClick={() => setShowAll(true)}>
            Show {hiddenCount} more…
          </button>
        )}
      </div>
    </details>
  )
}

export function SourceList({ sources }: { sources: DropSource[] }) {
  const sections = useMemo(() => groupBySection(sources), [sources])
  return (
    <div className="source-list">
      {Array.from(sections.entries()).map(([name, srcs]) => (
        <SectionBlock key={name} name={name} sources={srcs} />
      ))}
    </div>
  )
}
