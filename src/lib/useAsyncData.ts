import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  isPending: boolean
  error: Error | null
}

export function useAsyncData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, isPending: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((previous) => ({ ...previous, isPending: true, error: null }))

    load().then(
      (data) => {
        if (!cancelled) setState({ data, isPending: false, error: null })
      },
      (error: unknown) => {
        if (!cancelled) {
          setState((previous) => ({
            ...previous,
            isPending: false,
            error: error instanceof Error ? error : new Error('Der opstod en fejl. Prøv venligst igen.'),
          }))
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const refetch = useCallback(() => setAttempt((count) => count + 1), [])

  return { ...state, refetch }
}
