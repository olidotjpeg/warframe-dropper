import type { DropTable } from '@warframe-dropper/types'
import { searchDrops } from '../utils/search'
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
      {tracked.map((item) => {
        const results = searchDrops(data, item)
        const exact = results.find((r) => r.item === item)

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
