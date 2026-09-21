import type { ReactNode } from 'react'
import { createFileRoute, Link, Navigate, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { Avatar, Button } from '@heroui/react'
import { Calendar, LayoutGrid, LogOut, Plus, Users } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { useLinkedCitizens } from '../lib/relative/api'
import { AddCitizenModal } from '../lib/relative/AddCitizenModal'
import { getInitials } from '../lib/initials'

export const Route = createFileRoute('/relative')({
  component: RelativeLayout,
})

function RelativeLayout() {
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  if (isSessionPending) {
    return (
      <Frame>
        <div className="flex flex-1 items-center justify-center py-24">Henter dine oplysninger…</div>
      </Frame>
    )
  }

  if (!session) {
    return <Navigate to="/auth/signin" search={{ as: 'paaroerende' }} replace />
  }

  function signOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: '/' }),
      },
    })
  }

  return (
    <Frame>
      <Sidebar name={session.user.name} onSignOut={signOut} />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-5 px-6 py-6 md:px-10">
          <Outlet />
        </div>
      </main>
    </Frame>
  )
}

function Sidebar({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const { citizenId } = useParams({ strict: false })
  const { data: citizens } = useLinkedCitizens()
  const approved = (citizens ?? []).filter((citizen) => citizen.status === 'approved')

  return (
    <aside className="hidden w-64 flex-none flex-col border-r border-border bg-surface sm:flex">
      <Link to="/relative" className="px-5 pt-5 text-lg font-bold tracking-wide text-foreground no-underline">
        SeniorSync
      </Link>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-2 pb-2 text-xs font-bold tracking-wide text-muted uppercase">Mine pårørende</p>

        <div className="flex flex-col gap-1">
          {approved.map((citizen) => (
            <Link
              key={citizen.citizenUserId}
              to="/relative/$citizenId"
              params={{ citizenId: citizen.citizenUserId }}
              className={`flex items-center gap-3 rounded-md px-2 py-2 no-underline ${
                citizen.citizenUserId === citizenId ? 'bg-accent-soft' : 'hover:bg-surface-hover'
              }`}
            >
              <Avatar size="sm" color={citizen.citizenUserId === citizenId ? 'accent' : 'default'}>
                <Avatar.Fallback>{getInitials(citizen.name)}</Avatar.Fallback>
              </Avatar>
              <span className="min-w-0">
                <span
                  className={`block truncate text-sm font-semibold ${
                    citizen.citizenUserId === citizenId ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {citizen.name}
                </span>
                <span className="block truncate text-xs text-muted">{citizen.relationshipType}</span>
              </span>
            </Link>
          ))}

          <AddCitizenModal
            trigger={(open) => (
              <Button
                variant="ghost"
                onPress={open}
                className="h-auto w-full justify-start gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted hover:bg-surface-hover"
              >
                <span className="flex size-8 flex-none items-center justify-center rounded-full border border-dashed border-border">
                  <Plus className="size-4" aria-hidden />
                </span>
                Tilføj borger
              </Button>
            )}
          />
        </div>

        {citizenId && (
          <>
            <div className="my-4 border-t border-border" />
            <div className="flex flex-col gap-1">
              <SidebarPageLink to="/relative/$citizenId" citizenId={citizenId} icon={LayoutGrid} label="Overblik" exact />
              <SidebarPageLink to="/relative/$citizenId/calendar" citizenId={citizenId} icon={Calendar} label="Kalender" />
              <SidebarPageLink to="/relative/$citizenId/activities" citizenId={citizenId} icon={Users} label="Aktiviteter" />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <Link
          to="/auth/profile"
          className="flex min-w-0 flex-1 items-center gap-3 no-underline hover:opacity-80"
        >
          <Avatar size="sm">
            <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{name}</span>
        </Link>
        <button
          onClick={onSignOut}
          aria-label="Log ud"
          className="flex size-8 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </aside>
  )
}

function SidebarPageLink({
  to,
  citizenId,
  icon: Icon,
  label,
  exact,
}: {
  to: '/relative/$citizenId' | '/relative/$citizenId/calendar' | '/relative/$citizenId/activities'
  citizenId: string
  icon: typeof Calendar
  label: string
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      params={{ citizenId }}
      activeOptions={{ exact }}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted no-underline hover:bg-surface-hover"
      activeProps={{ className: 'bg-accent-soft text-accent hover:bg-accent-soft' }}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Link>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return <div className="flex h-dvh overflow-hidden bg-background text-foreground">{children}</div>
}
