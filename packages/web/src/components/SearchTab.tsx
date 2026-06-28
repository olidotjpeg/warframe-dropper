import { useState, useEffect, useRef } from 'react'
import type { DropTable } from '@warframe-dropper/types'
import { searchDrops, type SearchResult } from '../utils/search'

interface Props {
  data: DropTable
  tracked: string[]
  onTrack: (item: string) => void
}

export function SearchTab({ data, tracked, onTrack }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setResults(searchDrops(data, query))
    }, 150)
    return () => clearTimeout(timerRef.current)
  }, [query, data])

  return (
    <div>
      <input
        type="search"
        placeholder="Search items…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {query.trim() && results.length === 0 && (
        <p className="empty-state">No results for "{query}"</p>
      )}

      {results.map(({ item, sources }) => (
        <div key={item} className="result-group">
          <div className="result-header">
            <strong>{item}</strong>
            <button onClick={() => onTrack(item)} disabled={tracked.includes(item)}>
              {tracked.includes(item) ? 'Tracked' : 'Track'}
            </button>
          </div>
          <table>
            <tbody>
              {sources.map((src, i) => (
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
        </div>
      ))}
    </div>
  )
}
