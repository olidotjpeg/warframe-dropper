import { useState, useMemo } from 'react'
import type { DropSource } from '../utils/search'

const TRUNCATE_AT = 5

function raritySlug(rarity: string) {
  return rarity.toLowerCase().replace(/\s+/g, '-')
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

function SectionBlock({ name, sources }: { name: string; sources: DropSource[] }) {
  const [showAll, setShowAll] = useState(false)
  const sorted = useMemo(() => [...sources].sort((a, b) => b.chance - a.chance), [sources])
  const visible = showAll ? sorted : sorted.slice(0, TRUNCATE_AT)
  const hiddenCount = sorted.length - TRUNCATE_AT

  return (
    <details className="source-section" open>
      <summary className="source-section-summary">
        <span className="source-section-chevron" aria-hidden="true" />
        <span className="source-section-name">{name}</span>
        <span className="source-section-count">{sources.length}</span>
      </summary>
      <div className="source-rows">
        {visible.map((src, i) => (
          <div key={i} className="source-row">
            <span className="source-group">{src.groupName}</span>
            {src.rotationName && <span className="source-pill">Rot {src.rotationName}</span>}
            {src.stageName && <span className="source-pill">{src.stageName}</span>}
            <span className={`source-pill source-rarity rarity-${raritySlug(src.rarity)}`}>
              {src.rarity}
            </span>
            <span className="source-pill source-chance">{src.chance.toFixed(2)}%</span>
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
