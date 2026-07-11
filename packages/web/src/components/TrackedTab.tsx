import type { DropTable } from '@warframe-dropper/types'
import { findExactDrop } from '../utils/search'
import { RelicOptimizer } from './RelicOptimizer'
import { SourceList } from './SourceList'

interface Props {
  data: DropTable
  tracked: string[]
  onUntrack: (item: string) => void
}

export function TrackedTab({ data, tracked, onUntrack }: Props) {
  if (tracked.length === 0) {
    return (
      <p className="empty-state">
        No items tracked yet — use the Search tab and click "Track".
      </p>
    )
  }

  return (
    <div>
      {tracked.length >= 2 && (
        <div className="optimizer-section">
          <h2>Relic Optimizer</h2>
          <RelicOptimizer data={data} tracked={tracked} />
        </div>
      )}
      {tracked.map((item) => {
        const exact = findExactDrop(data, item)

        return (
          <div key={item} className="result-group">
            <div className="result-header">
              <strong>{item}</strong>
              <button onClick={() => onUntrack(item)}>Untrack</button>
            </div>

            {!exact ? (
              <p className="not-found">
                Not found in current drop table — run <code>npm run parse</code> to refresh.
              </p>
            ) : (
              <SourceList sources={exact.sources} />
            )}
          </div>
        )
      })}
    </div>
  )
}
