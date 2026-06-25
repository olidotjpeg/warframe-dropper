# WD-12: Implement Search tab

**Epic:** C — Web App
**Depends on:** WD-11
**Estimate:** L (3–5 hours)

## Goal

Build the Search tab: a text input that filters all drops by item name and displays results grouped by item, showing every source location with its rarity and drop chance. A "Track" button on each result adds it to the tracked list.

## Acceptance Criteria

- [ ] Typing in the search box filters results in real time (debounced 150 ms)
- [ ] Search is case-insensitive and matches partial item names
- [ ] Results are grouped by item name (not by section)
- [ ] Each result row shows: Section name → Group → Rotation (if named) → Stage (if named) → Rarity → Chance%
- [ ] "Track" button appears on each item; clicking it saves the item name to localStorage and gives visual feedback
- [ ] Empty search shows nothing (not all drops — there are thousands)
- [ ] No TypeScript errors

## Implementation Notes

### 1. Extract the search utility

Create `packages/web/src/utils/search.ts`. This is shared with the Tracked tab (WD-13):

```typescript
import type { DropTable, Section, Group, Rotation, Stage } from '@warframe-dropper/types';

export interface SearchResult {
  item: string;
  sources: DropSource[];
}

export interface DropSource {
  sectionName: string;
  groupName: string;
  rotationName: string;
  stageName: string;
  rarity: string;
  chance: number;
}

export function searchDrops(data: DropTable, query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  // Collect all matching drops with their full path
  const matchMap = new Map<string, DropSource[]>();

  for (const section of data.sections) {
    for (const group of section.groups) {
      for (const rotation of group.rotations) {
        for (const stage of rotation.stages) {
          for (const drop of stage.drops) {
            if (!drop.item.toLowerCase().includes(q)) continue;

            const source: DropSource = {
              sectionName: section.name,
              groupName: group.name,
              rotationName: rotation.name,
              stageName: stage.name,
              rarity: drop.rarity,
              chance: drop.chance,
            };

            const existing = matchMap.get(drop.item) ?? [];
            existing.push(source);
            matchMap.set(drop.item, existing);
          }
        }
      }
    }
  }

  // Convert map to sorted array
  return Array.from(matchMap.entries())
    .map(([item, sources]) => ({ item, sources }))
    .sort((a, b) => a.item.localeCompare(b.item));
}
```

### 2. `SearchTab.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import type { DropTable } from '@warframe-dropper/types';
import { searchDrops, type SearchResult } from '../utils/search';

interface Props {
  data: DropTable;
  tracked: string[];
  onTrack: (item: string) => void;
}

export function SearchTab({ data, tracked, onTrack }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResults(searchDrops(data, query));
    }, 150);
    return () => clearTimeout(timerRef.current);
  }, [query, data]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search items…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {results.length === 0 && query.trim() && (
        <p>No results for "{query}"</p>
      )}

      {results.map(({ item, sources }) => (
        <div key={item} className="result-group">
          <div className="result-header">
            <strong>{item}</strong>
            <button
              onClick={() => onTrack(item)}
              disabled={tracked.includes(item)}
            >
              {tracked.includes(item) ? 'Tracked' : 'Track'}
            </button>
          </div>
          <table>
            <tbody>
              {sources.map((src, i) => (
                <tr key={i}>
                  <td>{src.sectionName}</td>
                  <td>{src.groupName}</td>
                  {src.rotationName && <td>Rot {src.rotationName}</td>}
                  {src.stageName && <td>{src.stageName}</td>}
                  <td className={`rarity rarity-${src.rarity.toLowerCase().replace(' ', '-')}`}>
                    {src.rarity}
                  </td>
                  <td>{src.chance.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
```

### 3. Wire into `App.tsx`

```tsx
import { useState } from 'react';
import { useDropData } from './hooks/useDropData';
import { SearchTab } from './components/SearchTab';

export default function App() {
  const { data, loading, error } = useDropData();
  const [tab, setTab] = useState<'search' | 'tracked'>('search');
  const [tracked, setTracked] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tracked') ?? '[]');
    } catch {
      return [];
    }
  });

  const handleTrack = (item: string) => {
    const next = tracked.includes(item) ? tracked : [...tracked, item];
    setTracked(next);
    localStorage.setItem('tracked', JSON.stringify(next));
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <header>
        <h1>Warframe Dropper</h1>
        <nav>
          <button onClick={() => setTab('search')} aria-current={tab === 'search'}>Search</button>
          <button onClick={() => setTab('tracked')} aria-current={tab === 'tracked'}>
            Tracked ({tracked.length})
          </button>
        </nav>
      </header>
      <main>
        {tab === 'search' && (
          <SearchTab data={data!} tracked={tracked} onTrack={handleTrack} />
        )}
        {tab === 'tracked' && <div>Tracked tab — coming in WD-13</div>}
      </main>
    </div>
  );
}
```

### Gotchas

- The drop table has thousands of entries. Never render all of them — only render when `query.trim()` is non-empty.
- The `rarity` CSS class trick (`rarity-ultra-rare`) needs the CSS in WD-14. For now just render the text — don't worry about colours yet.
- `sources` can be very long for common items like "Endo". Consider adding a "show all X sources" collapse if you want, but it's optional for this ticket.

## Definition of Done

- [ ] Searching "Forma" returns results with section/group info
- [ ] "Track" button becomes disabled after clicking
- [ ] Tab switching between Search and "Tracked placeholder" works
- [ ] No TypeScript errors (`npm run build --workspace=packages/web` succeeds)
