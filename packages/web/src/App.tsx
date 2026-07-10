import { useState } from 'react'
import type { ExportItem, ShoppingListBuild } from '@warframe-dropper/types'
import { useDropData } from './hooks/useDropData'
import { useItemData } from './hooks/useItemData'
import { SearchTab } from './components/SearchTab'
import { TrackedTab } from './components/TrackedTab'
import { ShoppingListTab } from './components/ShoppingListTab'
import {
  loadBuilds,
  saveBuilds,
  loadAcquired,
  saveAcquired,
  type AcquiredState,
} from './utils/shoppingList'

type Tab = 'search' | 'tracked' | 'shoppingList'

function loadTracked(): string[] {
  try {
    return JSON.parse(localStorage.getItem('tracked') ?? '[]')
  } catch {
    return []
  }
}

export default function App() {
  const { data, loading, error } = useDropData()
  const { data: itemData, error: itemError } = useItemData()
  const [tab, setTab] = useState<Tab>('search')
  const [tracked, setTracked] = useState<string[]>(loadTracked)
  const [builds, setBuilds] = useState<ShoppingListBuild[]>(loadBuilds)
  const [acquired, setAcquired] = useState<AcquiredState>(loadAcquired)

  const saveTracked = (next: string[]) => {
    setTracked(next)
    localStorage.setItem('tracked', JSON.stringify(next))
  }

  const handleTrack = (item: string) => {
    if (!tracked.includes(item)) saveTracked([...tracked, item])
  }

  const handleUntrack = (item: string) => {
    saveTracked(tracked.filter((t) => t !== item))
  }

  const persistBuilds = (next: ShoppingListBuild[]) => {
    setBuilds(next)
    saveBuilds(next)
  }

  const handleAddBuild = (item: ExportItem) => {
    if (builds.some((b) => b.targetUniqueName === item.uniqueName)) return
    persistBuilds([
      ...builds,
      {
        id: crypto.randomUUID(),
        targetUniqueName: item.uniqueName,
        targetName: item.name,
        quantity: 1,
        addedAt: new Date().toISOString(),
      },
    ])
  }

  const handleRemoveBuild = (id: string) => {
    persistBuilds(builds.filter((b) => b.id !== id))
  }

  const handleSetQuantity = (id: string, quantity: number) => {
    persistBuilds(builds.map((b) => (b.id === id ? { ...b, quantity } : b)))
  }

  const handleToggleAcquired = (name: string, totalCount: number) => {
    const isDone = (acquired[name] ?? 0) >= totalCount
    const next = { ...acquired, [name]: isDone ? 0 : totalCount }
    setAcquired(next)
    saveAcquired(next)
  }

  if (loading) return <div className="status-screen">Loading drop table…</div>
  if (error) return <div className="status-screen error">Error: {error}</div>

  const itemDataReady = itemData && !itemError

  return (
    <>
      <header>
        <h1>Warframe Dropper</h1>
        <nav>
          <button aria-current={tab === 'search' || undefined} onClick={() => setTab('search')}>
            Search
          </button>
          <button aria-current={tab === 'tracked' || undefined} onClick={() => setTab('tracked')}>
            Tracked {tracked.length > 0 && <span className="badge">{tracked.length}</span>}
          </button>
          {itemDataReady && (
            <button
              aria-current={tab === 'shoppingList' || undefined}
              onClick={() => setTab('shoppingList')}
            >
              Shopping List {builds.length > 0 && <span className="badge">{builds.length}</span>}
            </button>
          )}
        </nav>
        <span className="last-update">Updated: {data!.lastUpdate}</span>
      </header>
      <main>
        {tab === 'search' && (
          <SearchTab
            data={data!}
            tracked={tracked}
            onTrack={handleTrack}
            itemData={itemDataReady ? itemData : undefined}
            builds={builds}
            onAddBuild={handleAddBuild}
          />
        )}
        {tab === 'tracked' && (
          <TrackedTab data={data!} tracked={tracked} onUntrack={handleUntrack} />
        )}
        {tab === 'shoppingList' && itemDataReady && (
          <ShoppingListTab
            itemData={itemData}
            builds={builds}
            acquired={acquired}
            onRemoveBuild={handleRemoveBuild}
            onSetQuantity={handleSetQuantity}
            onToggleAcquired={handleToggleAcquired}
          />
        )}
      </main>
    </>
  )
}
