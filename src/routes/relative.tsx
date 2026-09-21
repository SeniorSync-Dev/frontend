import type { ReactNode } from 'react'
import { createFileRoute, Link, Navigate, Outlet, useNavigate } from '@tanstack/react-router'
import { Button, Spinner } from '@heroui/react'
import { LogOut } from 'lucide-react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/relative')({
  component: RelativeLayout,
})

function RelativeLayout() {
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  function signOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: '/' }),
      },
    })
  }

  if (isSessionPending) {
    return (
      <Frame>
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner size="lg" color="accent" aria-label="Loading your information" />
        </div>
      </Frame>
    )
  }

  if (!session) {
    return <Navigate to="/auth/signin" search={{ as: 'paaroerende' }} replace />
  }

  return (
    <Frame>
      <header className="flex flex-none items-center gap-4 border-b border-border bg-surface px-4 py-3 sm:px-8">
        <Link to="/relative" className="text-lg font-bold tracking-wide text-foreground no-underline">
          SeniorSync
        </Link>
        <Button variant="ghost" className="ml-auto" onPress={signOut}>
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-4 px-4 py-5 sm:px-6">
          <Outlet />
        </div>
      </main>
    </Frame>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">{children}</div>
}
