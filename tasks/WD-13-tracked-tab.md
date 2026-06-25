# WD-13: Implement Tracked tab + localStorage

**Epic:** C — Web App
**Depends on:** WD-12
**Estimate:** M (2–3 hours)

## Goal

Build the Tracked tab that shows current drop rates for all tracked items. The list persists in `localStorage`, so it survives page reloads. After a new `npm run parse`, refreshing the browser shows updated drop rates immediately for every tracked item.

## Acceptance Criteria

- [ ] Tracked items appear in the Tracked tab after clicking "Track" in Search
- [ ] The tracked list survives a page reload
- [ ] Each tracked item shows all its drop sources (same data as Search results)
- [ ] An "Untrack" button removes the item from the list and from localStorage
- [ ] If a tracked item no longer exists in the drop table, it shows a "not found" message
- [ ] No TypeScript errors

## Implementation Notes

### `localStorage` schema

The tracked list is stored as a JSON array of item name strings:

```json
["Forma Blueprint", "Orokin Cell", "Nikana Prime Blueprint"]
```

Key: `"tracked"`

The `tracked` state and `handleTrack` / `handleUntrack` functions should live in `App.tsx` (already started in WD-12) so both tabs share the same state.

### Update `App.tsx` — add untrack

```tsx
const handleUntrack = (item: string) => {
  const next = tracked.filter((t) => t !== item);
  setTracked(next);
  localStorage.setItem('tracked', JSON.stringify(next));
};
```

Pass `onUntrack` down to `TrackedTab`.

### `packages/web/src/components/TrackedTab.tsx`

```tsx
import type { DropTable } from '@warframe-dropper/types';
import { searchDrops } from '../utils/search';

interface Props {
  data: DropTable;
  tracked: string[];
  onUntrack: (item: string) => void;
}

export function TrackedTab({ data, tracked, onUntrack }: Props) {
  if (tracked.length === 0) {
    return (
      <p>
        No items tracked yet. Use the Search tab to find items and click "Track".
      </p>
    );
  }

  return (
    <div>
      {tracked.map((item) => {
        // Re-use the exact same search logic — pass the full item name as the query
        const results = searchDrops(data, item);
        // searchDrops does a substring match, so filter to exact name
        const exact = results.find((r) => r.item === item);

        return (
          <div key={item} className="result-group">
            <div className="result-header">
              <strong>{item}</strong>
              <button onClick={() => onUntrack(item)}>Untrack</button>
            </div>

            {!exact ? (
              <p className="not-found">
                Not found in current drop table. Data may be outdated — run{' '}
                <code>npm run parse</code> to refresh.
              </p>
            ) : (
              <table>
                <tbody>
                  {exact.sources.map((src, i) => (
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
            )}
          </div>
        );
      })}
    </div>
  );
}
```

> **Why re-use `searchDrops`?** The search utility already walks the full drop tree. Rather than writing duplicate traversal logic, we call `searchDrops(data, item)` and then filter to the exact name. This means if the item name changes in a patch, the "not found" message appears automatically.

### Wire into `App.tsx`

Replace the placeholder:

```tsx
import { TrackedTab } from './components/TrackedTab';

// In the JSX:
{tab === 'tracked' && (
  <TrackedTab data={data!} tracked={tracked} onUntrack={handleUntrack} />
)}
```

### Testing localStorage persistence

1. Search for an item and click "Track"
2. Open browser DevTools → Application → Local Storage → `localhost:5173`
3. Confirm `tracked` key contains a JSON array with the item name
4. Reload the page — item should still appear in Tracked tab
5. Click "Untrack" — item disappears from Tracked tab and from localStorage

## Definition of Done

- [ ] Tracked items appear in the Tracked tab after tracking via Search
- [ ] Reloading the page keeps tracked items
- [ ] "Untrack" removes the item immediately from the tab and localStorage
- [ ] Empty state message shows when no items are tracked
- [ ] Not-found message appears for items that don't exist in the current data
- [ ] No TypeScript errors
