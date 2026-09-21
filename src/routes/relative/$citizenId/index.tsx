import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { CalendarDays, ChevronRight, MapPin, Users, Video, type LucideIcon } from 'lucide-react'
import { useCitizenAppointments } from '../../../lib/relative/api'
import { formatDayNumber, formatLongDate, formatShortWeekday, formatTime } from '../../../lib/relative/format'
import type { Appointment, AppointmentType } from '#/models/appointment'

export const Route = createFileRoute('/relative/$citizenId/')({
  component: CitizenOverview,
})

const typeIcon: Record<AppointmentType, LucideIcon> = {
  screen_visit: Video,
  home_visit: MapPin,
  activity: Users,
}

function CitizenOverview() {
  const { citizenId } = Route.useParams()
  const { data: appointments, error, refetch } = useCitizenAppointments(citizenId)

  if (!appointments && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" color="accent" aria-label="Loading appointments" />
      </div>
    )
  }

  if (error && !appointments) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>We couldn't load the appointments</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const upcoming = appointments ?? []
  const [next, ...rest] = upcoming

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold tracking-wide text-muted uppercase">{formatLongDate(new Date())}</p>

      {next ? <NextAppointmentCard appointment={next} /> : <p className="text-sm text-muted">No upcoming appointments.</p>}

      {rest.length > 0 && (
        <Card className="p-0">
          {rest.map((appointment) => (
            <div key={appointment.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <div className="w-14 flex-none text-xs font-bold text-accent">
                {formatShortWeekday(appointment.start)} {formatDayNumber(appointment.start)}
                <div className="text-sm font-normal text-foreground">{formatTime(appointment.start)}</div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{appointment.title}</p>
                {appointment.description && <p className="text-xs text-muted">{appointment.description}</p>}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Link
        to="/relative/$citizenId/calendar"
        params={{ citizenId }}
        className="flex items-center gap-1 text-sm text-accent no-underline"
      >
        See the full calendar
        <ChevronRight className="size-4" aria-hidden />
      </Link>

      <Link
        to="/relative/$citizenId/activities"
        params={{ citizenId }}
        className="flex items-center justify-center gap-2 rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent no-underline"
      >
        <CalendarDays className="size-4" aria-hidden />
        Sign up for an activity
      </Link>
    </div>
  )
}

function NextAppointmentCard({ appointment }: { appointment: Appointment }) {
  const Icon = typeIcon[appointment.type]

  return (
    <Card className="flex-row items-center gap-4 border-2 border-accent">
      <div className="flex size-14 flex-none flex-col items-center justify-center rounded-xl bg-accent-soft text-accent">
        <span className="text-[10px] font-bold uppercase">Now at</span>
        <span className="text-base font-extrabold">{formatTime(appointment.start)}</span>
      </div>
      <Card.Content className="min-w-0 gap-0.5">
        <Card.Title className="flex items-center gap-1.5 text-base">
          <Icon className="size-4 flex-none text-accent" aria-hidden />
          {appointment.title}
        </Card.Title>
        {appointment.description && <Card.Description className="text-sm">{appointment.description}</Card.Description>}
      </Card.Content>
    </Card>
  )
}
