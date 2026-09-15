import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { ArrowLeft, LogOut } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { CallForHelpButton } from './CallForHelpButton'
import { largeButton } from './styles'

interface CitizenShellProps {
  title?: string
  children: ReactNode
}

export function CitizenShell({ title, children }: CitizenShellProps) {
  const navigate = useNavigate()

  function signOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: '/' }),
      },
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-none flex-wrap items-center gap-4 border-b border-border bg-surface px-4 py-3 sm:px-8">
        {title ? (
          <>
            <Button
              variant="outline"
              className={`${largeButton} border-2`}
              onPress={() => navigate({ to: '/citizen' })}
            >
              <ArrowLeft className="size-6" strokeWidth={2.5} aria-hidden />
              Tilbage
            </Button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </>
        ) : (
          <Link to="/citizen" className="text-2xl font-extrabold tracking-wide text-foreground no-underline">
            SeniorSync
          </Link>
        )}

        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" className={largeButton} onPress={signOut}>
            <LogOut className="size-6" aria-hidden />
            Log ud
          </Button>
          <CallForHelpButton />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-12 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
