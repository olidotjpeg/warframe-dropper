# WD-11: Implement data loading hook

**Epic:** C — Web App
**Depends on:** WD-10, WD-2
**Estimate:** S (1 hour)

## Goal

Create a custom React hook `useDropData()` that fetches `latest.json` when the app loads and returns it typed as `DropTable`. This keeps data-fetching logic out of components and makes it easy to display a loading state.

## Acceptance Criteria

- [ ] `useDropData()` returns `{ data: DropTable | null, loading: boolean, error: string | null }`
- [ ] While fetching, `loading` is `true`
- [ ] On success, `data` is a fully-typed `DropTable`
- [ ] On error (e.g. file not found), `error` is a non-null string
- [ ] The app shell shows "Loading…" then "Loaded X sections" once data arrives

## Implementation Notes

### 1. `packages/web/src/hooks/useDropData.ts`

```typescript
import { useEffect, useState } from 'react';
import type { DropTable } from '@warframe-dropper/types';

interface State {
  data: DropTable | null;
  loading: boolean;
  error: string | null;
}

export function useDropData(): State {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetch('/data/latest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DropTable>;
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: Error) =>
        setState({ data: null, loading: false, error: err.message })
      );
  }, []); // empty array = run once on mount

  return state;
}
```

> **Why a custom hook?** It keeps the fetch logic in one place. Both the `SearchTab` and `TrackedTab` (WD-12/13) need the same data — they'll call the same hook. React re-uses the result if the parent already has it, so we don't fetch twice.

### 2. Use it in `App.tsx`

```tsx
import { useDropData } from './hooks/useDropData';

export default function App() {
  const { data, loading, error } = useDropData();

  if (loading) return <div>Loading drop table…</div>;
  if (error) return <div>Error: {error}. Run `npm run parse` first.</div>;

  return (
    <div>
      <h1>Warframe Dropper</h1>
      <p>Loaded {data!.sections.length} sections — last update: {data!.lastUpdate}</p>
      {/* Tabs go here in WD-12/13 */}
    </div>
  );
}
```

### 3. Testing with real data

You need `packages/web/public/data/latest.json` to exist. Either:

- Run `npm run parse` if the parser is done (WD-9)
- Or create a minimal placeholder:

```sh
echo '{"fetchedAt":"2026-01-01T00:00:00Z","lastUpdate":"test","sections":[]}' \
  > packages/web/public/data/latest.json
```

### Common gotcha

If you get a 404 for `/data/latest.json`, make sure the file is in `public/data/`, not `src/data/`. Vite only serves `public/` as static files.

## Definition of Done

- [ ] App shows "Loading drop table…" briefly, then transitions to showing the section count
- [ ] No TypeScript errors in `useDropData.ts`
- [ ] If `latest.json` is missing, the error message appears instead of a blank screen
