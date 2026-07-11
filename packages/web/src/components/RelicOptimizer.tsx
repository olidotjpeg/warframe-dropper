import type { DropTable } from '@warframe-dropper/types'
import { useMemo } from 'react'
import { findRelicOverlaps } from '../utils/optimize'
import { raritySlug } from '../utils/relic'

interface Props {
  data: DropTable
  tracked: string[]
}

export function RelicOptimizer({ data, tracked }: Props) {
  const suggestions = useMemo(() => findRelicOverlaps(data, tracked), [data, tracked])

  if (suggestions.length === 0) {
    return <p className="empty-state">No relics in common across tracked items.</p>
  }

  return (
    <div className="optimizer-list">
      {suggestions.map(({ relicBase, coveredItems, totalChance }) => (
        <div key={relicBase} className="optimizer-row">
          <span className="optimizer-relic">{relicBase}</span>
          <span className="optimizer-items">
            {coveredItems.map(({ item, chance, rarity }) => (
              <span
                key={item}
                className={`source-pill rarity-${raritySlug(rarity)}`}
                title={rarity}
              >
                {item} — {chance.toFixed(2)}%
              </span>
            ))}
          </span>
          <span className="optimizer-total source-pill source-chance">
            {totalChance.toFixed(2)}% combined
          </span>
        </div>
      ))}
    </div>
  )
}
