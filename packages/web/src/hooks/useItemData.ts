import { useEffect, useState } from 'react'
import type { ItemExport } from '@warframe-dropper/types'

interface State {
  data: ItemExport | null
  loading: boolean
  error: string | null
}

export function useItemData(): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/items-latest.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — run npm run parse:items first`)
        return res.json() as Promise<ItemExport>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: Error) => setState({ data: null, loading: false, error: err.message }))
  }, [])

  return state
}
