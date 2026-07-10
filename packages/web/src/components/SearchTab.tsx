import { useState, useEffect, useRef, useMemo } from 'react'
import type { DropTable, ExportItem, ItemExport } from '@warframe-dropper/types'
import { searchDrops, type SearchResult } from '../utils/search'
import { getBuildableItems, matchBuildableItem } from '../utils/shoppingList'
import { SourceList } from './SourceList'

interface Props {
  data: DropTable
  tracked: string[]
  onTrack: (item: string) => void
  itemData?: ItemExport
  builds: { targetUniqueName: string }[]
  onAddBuild: (item: ExportItem) => void
}

export function SearchTab({ data, tracked, onTrack, itemData, builds, onAddBuild }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    timerRef.current = setTimeout(() => {
      setResults(searchDrops(data, query))
      setIsSearching(false)
    }, 250)
    return () => clearTimeout(timerRef.current)
  }, [query, data])

  const buildableItems = useMemo(() => (itemData ? getBuildableItems(itemData) : []), [itemData])

  const resultsWithBuild = useMemo(
    () =>
      results.map((result) => ({
        ...result,
        buildable: itemData ? matchBuildableItem(buildableItems, result.item) : null,
      })),
    [results, itemData, buildableItems]
  )

  const addedUniqueNames = new Set(builds.map((b) => b.targetUniqueName))

  return (
    <div>
      <div className="search-input-wrap">
        <input
          type="search"
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {isSearching && <span className="search-spinner" aria-label="Searching" />}
      </div>

      {query.trim() && !isSearching && results.length === 0 && (
        <p className="empty-state">No results for "{query}"</p>
      )}

      {resultsWithBuild.map(({ item, sources, buildable }) => (
        <div key={item} className="result-group search-result-enter">
          <div className="result-header">
            <strong>{item}</strong>
            <button onClick={() => onTrack(item)} disabled={tracked.includes(item)}>
              {tracked.includes(item) ? 'Tracked' : 'Track'}
            </button>
            {buildable && (
              <button
                onClick={() => onAddBuild(buildable)}
                disabled={addedUniqueNames.has(buildable.uniqueName)}
              >
                {addedUniqueNames.has(buildable.uniqueName) ? 'Added' : 'Add to build'}
              </button>
            )}
          </div>
          <SourceList sources={sources} />
        </div>
      ))}
    </div>
  )
}
