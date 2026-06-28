import { useState } from 'react'
import { useDropData } from './hooks/useDropData'
import { SearchTab } from './components/SearchTab'
import { TrackedTab } from './components/TrackedTab'

type Tab = 'search' | 'tracked'

function loadTracked(): string[] {
  try {
    return JSON.parse(localStorage.getItem('tracked') ?? '[]')
  } catch {
    return []
  }
}

export default function App() {
  const { data, loading, error } = useDropData()
  const [tab, setTab] = useState<Tab>('search')
  const [tracked, setTracked] = useState<string[]>(loadTracked)

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

  if (loading) return <div className="status-screen">Loading drop table…</div>
  if (error) return <div className="status-screen error">Error: {error}</div>

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
        </nav>
        <span className="last-update">Updated: {data!.lastUpdate}</span>
      </header>
      <main>
        {tab === 'search' && (
          <SearchTab data={data!} tracked={tracked} onTrack={handleTrack} />
        )}
        {tab === 'tracked' && (
          <TrackedTab data={data!} tracked={tracked} onUntrack={handleUntrack} />
        )}
      </main>
    </>
  )
}
