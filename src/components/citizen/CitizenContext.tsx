import { createContext, useContext, type ReactNode } from 'react'
import type { authClient } from '../../lib/auth-client'
import type { CareHome } from '../../lib/citizen/types'

export type CitizenUser = typeof authClient.$Infer.Session.user

export interface CitizenContextValue {
  user: CitizenUser
  careHome?: CareHome
}

const CitizenContext = createContext<CitizenContextValue | null>(null)

interface CitizenProviderProps {
  value: CitizenContextValue
  children: ReactNode
}

export function CitizenProvider({ value, children }: CitizenProviderProps) {
  return <CitizenContext.Provider value={value}>{children}</CitizenContext.Provider>
}

export function useCitizen() {
  const ctx = useContext(CitizenContext)
  if (!ctx) throw new Error('useCitizen must be used within the /citizen layout')
  return ctx
}
