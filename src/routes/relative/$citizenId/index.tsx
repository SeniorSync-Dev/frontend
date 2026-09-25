import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { ChevronRight, MapPin, Shield, StickyNote } from 'lucide-react'
import { useCancelCitizenActivitySignup, useCitizenActivities, useCitizenAppointments, useSignUpCitizenForActivity } from '../../../lib/relative/api'
import { formatDateLabel, formatDayNumber, formatShortWeekday, formatTime, formatTimeRange } from '../../../lib/format'
import { useNow } from '../../../lib/useNow'
import type { Appointment } from '#/models/appointment'
import type { Activity } from '#/models/activity'

export const Route = createFileRoute('/relative/$citizenId/')({
  component: CitizenOverview,
})

const WINDOW_DAYS = 14

function isOver(appointment: Appointment, now: Date) {
  return (appointment.end ?? appointment.start) < now
}

function windowEndFrom(now: Date) {
  const end = new Date(now)
  end.setDate(end.getDate() + WINDOW_DAYS)
  end.setHours(23, 59, 59, 999)
  return end
}

function CitizenOverview() {
  const { citizenId } = Route.useParams()
  const { data: appointments, error, refetch } = useCitizenAppointments(citizenId)
  const now = useNow()

  if (!appointments && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" color="accent" aria-label="Henter aftaler" />
      </div>
    )
  }

  if (error && !appointments) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Vi kunne ikke hente aftalerne</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const windowEnd = windowEndFrom(now)
  const upcoming = (appointments ?? []).filter(
    (appointment) => !isOver(appointment, now) && appointment.start <= windowEnd,
  )
  const [next, ...rest] = upcoming

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <Alert status="accent">
          <Alert.Indicator>
            <Shield className="size-4" aria-hidden />
          </Alert.Indicator>
          <Alert.Content className="flex-row items-center justify-between gap-3">
            <Alert.Description className="text-sm">
              Du har fået adgang til kalender og aktiviteter.
            </Alert.Description>
          </Alert.Content>
        </Alert>

        {next ? <NextAppointmentCard appointment={next} /> : <p className="text-sm text-muted">Ingen kommende aftaler.</p>}

        {rest.length > 0 && (
          <Card className="gap-0 p-0">
            {rest.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-3 border-b border-border px-4 py-2 leading-tight last:border-b-0"
              >
                <div className="w-14 flex-none text-xs font-bold text-accent">
                  {formatShortWeekday(appointment.start)} {formatDayNumber(appointment.start)}
                  <div className="text-sm font-normal text-foreground">{formatTime(appointment.start)}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{appointment.title}</p>
                  {appointment.description && (
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <StickyNote className="size-3 flex-none" aria-hidden />
                      {appointment.description}
                    </p>
                  )}
                  {appointment.location && (
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <MapPin className="size-3 flex-none" aria-hidden />
                      {appointment.location}
                    </p>
                  )}
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
          Se hele kalenderen
          <ChevronRight className="size-4" aria-hidden />
        </Link>

      </div>

      <SuggestedActivities citizenId={citizenId} />
    </div>
  )
}

function NextAppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card className="flex-row items-center gap-4 border-2 border-accent">
      <div className="flex h-14 w-18 flex-none flex-col items-center justify-center rounded-xl bg-accent-soft px-1 text-accent">
        <span className="text-[10px] font-bold whitespace-nowrap uppercase">{formatDateLabel(appointment.start)}</span>
        <span className="text-base font-extrabold">{formatTime(appointment.start)}</span>
      </div>
      <Card.Content className="min-w-0 gap-0.5">
        <Card.Title className="text-base">{appointment.title}</Card.Title>
        {appointment.description && (
          <Card.Description className="flex items-center gap-1 text-sm">
            <StickyNote className="size-3.5 flex-none" aria-hidden />
            {appointment.description}
          </Card.Description>
        )}
        {appointment.location && (
          <Card.Description className="flex items-center gap-1 text-sm">
            <MapPin className="size-3.5 flex-none" aria-hidden />
            {appointment.location}
          </Card.Description>
        )}
      </Card.Content>
    </Card>
  )
}

function SuggestedActivities({ citizenId }: { citizenId: string }) {
  const { data: activities } = useCitizenActivities(citizenId)
  const signUpMutation = useSignUpCitizenForActivity(citizenId)
  const cancelMutation = useCancelCitizenActivitySignup(citizenId)

  const suggestions = (activities ?? []).filter((activity) => !activity.isSignedUp).slice(0, 4)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-wide text-muted uppercase">Aktiviteter du kan tilmelde</p>
        <Link to="/relative/$citizenId/activities" params={{ citizenId }} className="text-sm text-accent no-underline">
          Alle
        </Link>
      </div>

      {suggestions.length === 0 && <p className="text-sm text-muted">Ingen aktiviteter at tilmelde lige nu.</p>}

      {suggestions.map((activity) => (
        <SuggestedActivityCard
          key={activity.id}
          activity={activity}
          isBusy={
            (signUpMutation.isPending && signUpMutation.variables === activity.id) ||
            (cancelMutation.isPending && cancelMutation.variables === activity.id)
          }
          onSignUp={() => signUpMutation.mutate(activity.id)}
        />
      ))}
    </div>
  )
}

function SuggestedActivityCard({
  activity,
  isBusy,
  onSignUp,
}: {
  activity: Activity
  isBusy: boolean
  onSignUp: () => void
}) {
  const isFull = activity.availableSpots === 0

  return (
    <Card className="gap-2 p-3">
      <Card.Content className="gap-0.5">
        <Card.Title className="text-sm">{activity.title}</Card.Title>
        <Card.Description className="text-xs">
          {formatTimeRange(activity.start, activity.end)}
          {activity.availableSpots !== undefined ? ` · ${isFull ? 'fuld' : `${activity.availableSpots} pladser`}` : ''}
        </Card.Description>
        {activity.description && (
          <Card.Description className="flex items-start gap-1 text-xs">
            <StickyNote className="mt-0.5 size-3 flex-none" aria-hidden />
            {activity.description}
          </Card.Description>
        )}
      </Card.Content>
      <Button variant="outline" size="sm" isPending={isBusy} isDisabled={isFull} onPress={onSignUp}>
        {isFull ? 'Ingen ledige pladser' : 'Tilmeld'}
      </Button>
    </Card>
  )
}
