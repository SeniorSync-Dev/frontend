import type { ReactNode } from 'react'
import { createFileRoute, Link, Navigate, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { AlertDialog, buttonVariants, Spinner } from '@heroui/react'
import { ArrowLeft, LogOut, Phone } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { Button, citizenButtonClass } from '../lib/citizen/Button'

export const Route = createFileRoute('/citizen')({
  component: CitizenLayout,
})

const pageTitles: Record<string, string> = {
  '/citizen/appointments': 'Mine aftaler',
  '/citizen/activities': 'Aktiviteter',
  '/citizen/messages': 'Beskeder',
}

function CitizenLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: organizations } = authClient.useListOrganizations()
  const careHome = organizations?.[0]
  const title = pageTitles[pathname.replace(/\/$/, '')]

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
          <Spinner size="lg" color="accent" aria-label="Henter dine oplysninger" />
        </div>
      </Frame>
    )
  }

  if (!session) {
    return <Navigate to="/auth/signin" search={{ as: 'borger' }} replace />
  }

  return (
    <Frame>
      <header className="flex flex-none flex-wrap items-center gap-4 border-b border-border bg-surface px-4 py-3 sm:px-8">
        {title ? (
          <>
            <Button variant="outline" size="lg" className="border-2" onPress={() => navigate({ to: '/citizen' })}>
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
          <Button variant="ghost" size="lg" onPress={signOut}>
            <LogOut className="size-6" aria-hidden />
            Log ud
          </Button>
          <CallForHelp careHomeName={careHome?.name} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-12 sm:py-6">
          <Outlet />
        </div>
      </main>
    </Frame>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="theme-citizen flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  )
}

function CallForHelp({ careHomeName }: { careHomeName?: string }) {
  return (
    <AlertDialog>
      <Button variant="danger" size="lg">
        <Phone className="size-6" aria-hidden />
        Tilkald hjælp
      </Button>

      <AlertDialog.Backdrop className="theme-citizen">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-5 p-7">
            <AlertDialog.Header className="flex-row items-center gap-4">
              <AlertDialog.Icon status="danger" className="size-14">
                <Phone className="size-7" aria-hidden />
              </AlertDialog.Icon>
              <AlertDialog.Heading className="text-3xl font-bold">Tilkald hjælp</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex flex-col gap-5 text-xl leading-relaxed text-muted">
              <div>
                <p>
                  <strong className="text-foreground">Er det akut og livstruende?</strong>
                </p>
                <p>Ring 1-1-2 med det samme.</p>
              </div>
              <a
                href="tel:112"
                className={buttonVariants({
                  variant: 'danger',
                  className: `${citizenButtonClass('lg')} w-full no-underline hover:bg-danger-hover`,
                })}
              >
                <Phone className="size-6" aria-hidden />
                Ring 1-1-2
              </a>
              <p>
                {careHomeName
                  ? `Er det ikke akut, så kontakt dit plejehjem, ${careHomeName}.`
                  : 'Du er endnu ikke tilknyttet et plejehjem. Kommunen kontakter dig, så snart det er på plads.'}
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="outline" size="lg" className="w-full sm:w-auto">
                Luk
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
