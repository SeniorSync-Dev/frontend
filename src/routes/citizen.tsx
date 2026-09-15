import type { ReactNode } from 'react'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Alert, Button, Spinner } from '@heroui/react'
import { authClient } from '../lib/auth-client'
import type { CareHome as CareHome } from '../lib/citizen/types'
import { CitizenProvider } from '../components/citizen'
import { largeButton } from '../components/citizen/styles'

export const Route = createFileRoute('/citizen')({ component: CitizenLayout })

function devCareHome(): CareHome | undefined {
  const name = import.meta.env.DEV ? import.meta.env.VITE_DEV_CARE?.trim() : undefined
  return name ? { id: name, name } : undefined
}

function CitizenLayout() {
  const { data: session, isPending, error, refetch } = authClient.useSession()

  if (isPending) {
    return (
      <Frame>
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner size="lg" color="accent" aria-label="Henter dine oplysninger" />
        </div>
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-6 py-16">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title className="text-xl">Vi kunne ikke hente dine oplysninger</Alert.Title>
              <Alert.Description className="text-lg">Prøv igen om et øjeblik.</Alert.Description>
            </Alert.Content>
          </Alert>
          <Button variant="primary" className={`${largeButton} self-start`} onPress={() => refetch()}>
            Prøv igen
          </Button>
        </div>
      </Frame>
    )
  }

  if (!session) {
    return <Navigate to="/auth/signin" search={{ as: 'borger' }} replace />
  }

  return (
    <CitizenProvider value={{ user: session.user, careHome: devCareHome() }}>
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
