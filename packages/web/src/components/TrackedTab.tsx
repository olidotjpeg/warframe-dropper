import type { DropTable } from '@warframe-dropper/types'
import { searchDrops } from '../utils/search'

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
              <table>
                <tbody>
                  {exact.sources.map((src, i) => (
                    <tr key={i}>
                      <td className="col-section">{src.sectionName}</td>
                      <td className="col-group">{src.groupName}</td>
                      {src.rotationName && <td className="col-rot">Rot {src.rotationName}</td>}
                      {src.stageName && <td className="col-stage">{src.stageName}</td>}
                      <td className={`col-rarity rarity-${src.rarity.toLowerCase().replace(/\s+/g, '-')}`}>
                        {src.rarity}
                      </td>
                      <td className="col-chance">{src.chance.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
    </div>
  )
}
