import { Avatar, Spinner } from '@heroui/react'
import { Link, Outlet, createFileRoute, redirect, useLocation } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import { getInitials } from '../lib/initials'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    // The sign-in screen must remain public so an unauthenticated visitor can sign in.
    if (location.pathname === '/admin/signin') return

    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: '/admin/signin' })
    }

    const { data } = await authClient.organization.getActiveMemberRole();
    const userRole = data?.role;

    if (!data || (userRole !== 'systemAdmin' && userRole !== 'employee')) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

const navClassName =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/10'
const activeNavClassName = `${navClassName} bg-accent text-accent-foreground`

function AdminLayout() {
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin =
    activeMemberRole?.role === 'systemAdmin' || activeMemberRole?.role === 'employee'
  const isServicePartner = activeMemberRole?.role === 'servicePartner'

  if (location.pathname === '/admin/signin') {
    return <Outlet />
  }

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
        <Link to="/admin/dashboard" className="mb-10 flex items-center gap-3 px-3" activeOptions={{ exact: true }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
            S
          </span>
          <span>
            <span className="block text-base font-semibold">SeniorSync</span>
            <span className="block text-xs text-muted">Administration</span>
          </span>
        </Link>

          {isAdmin && (
            <nav aria-label="Administration" className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">Oversigt</p>
              <Link
                to="/admin/dashboard"
                className={navClassName}
                activeProps={{ className: activeNavClassName }}
                activeOptions={{ exact: true }}
              >
                <DashboardIcon />
                Organisation
              </Link>
              <Link to="/admin/visits" className={navClassName} activeProps={{ className: activeNavClassName }}>
                <AlarmIcon />
                Besøg
              </Link>
              <Link to="/admin/kioskPage" className={navClassName} activeProps={{ className: activeNavClassName }}>
                <AlarmIcon />
                Alarmoversigt
              </Link>
              <Link to="/admin/facilities" className={navClassName} activeProps={{ className: activeNavClassName }}>
                <AlarmIcon />
                Faciliteter
              </Link>
              <Link to="/admin/activities" className={navClassName} activeProps={{ className: activeNavClassName }}>
                <AlarmIcon />
                Aktiviteter
              </Link>
            </nav>
          )}
          {isServicePartner && (
            <nav aria-label="Service Partner" className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">Service Partner</p>
              <Link to="/admin/activities" className={navClassName} activeProps={{ className: activeNavClassName }}>
                <AlarmIcon />
                Service Partner
              </Link>
            </nav>
          )}

        <div className="mt-auto border-t border-border pt-4">
          {isPending ? (
            <div className="flex items-center gap-3 px-3 py-2" aria-label="Henter bruger">
              <Spinner size="sm" color="accent" />
              <span className="text-sm text-muted">Henter bruger...</span>
            </div>
          ) : session ? (
            <Link
              to="/auth/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/10"
              aria-label={'G\u00e5 til min profil'}
            >
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>{getInitials(session.user.name)}</Avatar.Fallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{session.user.name}</span>
                <span className="block truncate text-xs text-muted">{session.user.email}</span>
              </span>
            </Link>
          ) : (
            <Link to="/admin/signin" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/10">
              <Avatar size="sm" color="accent">
                <Avatar.Fallback>?</Avatar.Fallback>
              </Avatar>
              <span className="text-sm font-medium">Log ind</span>
            </Link>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function AlarmIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4m0 4h.01M10.3 3.5 2.2 18a2 2 0 0 0 1.75 3h16.1A2 2 0 0 0 21.8 18L13.7 3.5a2 2 0 0 0-3.4 0Z" />
    </svg>
  )
}
