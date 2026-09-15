import type { ReactNode } from 'react'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { CitizenProvider, ErrorState, LoadingState } from '../components/citizen'

export const Route = createFileRoute('/citizen')({ component: CitizenLayout })

function CitizenLayout() {
  const session = authClient.useSession()
  const organizations = authClient.useListOrganizations()

  if (session.isPending || (session.data && organizations.isPending)) {
    return (
      <Frame>
        <LoadingState />
      </Frame>
    )
  }

  if (session.error) {
    return (
      <Frame>
        <ErrorState onRetry={() => session.refetch()} />
      </Frame>
    )
  }

  if (!session.data) {
    return <Navigate to="/auth/signin" search={{ as: 'borger' }} replace />
  }

  if (organizations.error) {
    return (
      <Frame>
        <ErrorState onRetry={() => organizations.refetch()} />
      </Frame>
    )
  }

  const organization = organizations.data?.[0]
  const careHome = organization ? { id: organization.id, name: organization.name } : undefined

  return (
    <CitizenProvider value={{ user: session.data.user, careHome }}>
      <Frame>
        <Outlet />
      </Frame>
    </CitizenProvider>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="theme-citizen flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}
