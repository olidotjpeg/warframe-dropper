import { useEffect, useState } from 'react'
import type { DropTable } from '@warframe-dropper/types'

interface State {
  data: DropTable | null
  loading: boolean
  error: string | null
}

export function useDropData(): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    fetch('/data/latest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — run npm run parse first`)
        return res.json() as Promise<DropTable>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: Error) => setState({ data: null, loading: false, error: err.message }))
  }, [])

  return state
}
