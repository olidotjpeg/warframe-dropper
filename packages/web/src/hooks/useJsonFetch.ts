import { useEffect, useState } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useJsonFetch<T>(path: string, runHint: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}${path}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} — run ${runHint} first`)
        return res.json() as Promise<T>
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: Error) => setState({ data: null, loading: false, error: err.message }))
  }, [path, runHint])

  return state
}
