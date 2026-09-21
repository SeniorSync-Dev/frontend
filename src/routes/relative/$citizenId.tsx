import { createFileRoute, Link, Outlet, useLocation, useNavigate, useSearch } from '@tanstack/react-router'
import { ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { ArrowLeft, UserMinus } from 'lucide-react'
import { useLinkedCitizens } from '../../lib/relative/api'
import { VisitModal } from '../../lib/relative/VisitModal'
import { RemoveCitizenModal } from '../../lib/relative/RemoveCitizenModal'
import { formatLongDate } from '../../lib/format'

export const Route = createFileRoute('/relative/$citizenId')({
  component: CitizenLayout,
})

const mobileTabs = [
  { to: '/relative/$citizenId', label: 'Overblik' },
  { to: '/relative/$citizenId/calendar', label: 'Kalender' },
  { to: '/relative/$citizenId/activities', label: 'Aktiviteter' },
] as const

function CitizenLayout() {
  const { citizenId } = Route.useParams()
  const { data: citizens } = useLinkedCitizens()
  const citizen = citizens?.find((c) => c.citizenUserId === citizenId)
  const location = useLocation()
  const isCalendar = location.pathname.endsWith('/calendar')
  const isActivities = location.pathname.endsWith('/activities')
  const isOverview = !isCalendar && !isActivities

  const meta = [
    citizen?.age !== undefined ? `${citizen.age} år` : undefined,
    citizen?.facilityName,
    formatLongDate(new Date()),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3 rounded-xl bg-accent-soft p-4">
        <Link
          to="/relative"
          className="flex size-9 flex-none items-center justify-center rounded-md text-foreground no-underline hover:bg-surface-hover sm:hidden"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{citizen?.name ?? 'Borger'}</h1>
          <p className="truncate text-sm text-muted">{meta}</p>
        </div>

        {isCalendar && (
          <div className="flex flex-none items-center gap-3">
            <CalendarViewToggle citizenId={citizenId} />
            <VisitModal citizenId={citizenId} />
          </div>
        )}

        {isActivities && (
          <div className="flex flex-none items-center gap-3">
            <ActivityFilterToggle citizenId={citizenId} />
          </div>
        )}

        {isOverview && (
          <RemoveCitizenModal
            citizenId={citizenId}
            citizenName={citizen?.name ?? 'borgeren'}
            trigger={(open) => (
              <button
                onClick={open}
                title="Fjern min adgang"
                aria-label={`Fjern min adgang til ${citizen?.name ?? 'borgeren'}`}
                className="flex size-9 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-danger"
              >
                <UserMinus className="size-4" aria-hidden />
              </button>
            )}
          />
        )}
      </header>

      <nav className="flex gap-1 border-b border-border sm:hidden">
        {mobileTabs.map((tab) => (
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

function CalendarViewToggle({ citizenId }: { citizenId: string }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { view?: string }
  const view = search.view === 'month' ? 'month' : 'week'

  function setView(next: string) {
    navigate({
      to: '/relative/$citizenId/calendar',
      params: { citizenId },
      search: { view: next === 'month' ? 'month' : undefined },
    })
  }

  return (
    <ToggleButtonGroup
      size="sm"
      selectedKeys={[view]}
      disallowEmptySelection
      onSelectionChange={(keys) => setView([...keys][0] as string)}
    >
      <ToggleButton id="week">Uge</ToggleButton>
      <ToggleButton id="month">Måned</ToggleButton>
    </ToggleButtonGroup>
  )
}

const activityFilterTabs: Array<{ value:'all' | 'week' | 'signedUp'; label: string }> = [
  { value: 'all', label: 'Alle' },
  { value: 'week', label: 'Denne uge' },
  { value: 'signedUp', label: 'Tilmeldte' },
]

function ActivityFilterToggle({ citizenId }: { citizenId: string }) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { filter?: string }
  const filter = search.filter === 'week' || search.filter === 'signedUp' ? search.filter : 'all'

  function setFilter(next: 'all' | 'week' | 'signedUp') {
    navigate({
      to: '/relative/$citizenId/activities',
      params: { citizenId },
      search: { filter: next === 'all' ? undefined : next },
    })
  }

  return (
    <ToggleButtonGroup
      size="sm"
      selectedKeys={[filter]}
      disallowEmptySelection
      onSelectionChange={(keys) => setFilter([...keys][0] as 'all' | 'week' | 'signedUp')}
    >
      {activityFilterTabs.map((tab) => (
        <ToggleButton key={tab.value} id={tab.value}>
          {tab.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
