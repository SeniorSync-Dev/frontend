import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useLinkedCitizens } from '../../lib/relative/api'

export const Route = createFileRoute('/relative/$citizenId')({
  component: CitizenLayout,
})

function CitizenLayout() {
  const { citizenId } = Route.useParams()
  const { data: citizens } = useLinkedCitizens()
  const citizen = citizens?.find((c) => c.citizenUserId === citizenId)

  const tabs = [
    { to: '/relative/$citizenId', label: 'Overview' },
    { to: '/relative/$citizenId/calendar', label: 'Calendar' },
    { to: '/relative/$citizenId/activities', label: 'Activities' },
  ] as const

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link
          to="/relative"
          className="flex size-9 flex-none items-center justify-center rounded-md text-foreground no-underline hover:bg-surface-hover"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{citizen?.name ?? 'Citizen'}</p>
          {citizen?.facilityName && <p className="truncate text-xs text-muted">{citizen.facilityName}</p>}
        </div>
      </header>

      <nav className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            params={{ citizenId }}
            activeOptions={{ exact: tab.to === '/relative/$citizenId' }}
            className="border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted no-underline"
            activeProps={{ className: 'border-accent text-accent' }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
