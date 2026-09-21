import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { CalendarDays, Check, MapPin, Video, type LucideIcon } from 'lucide-react'
import { useCancelCitizenActivitySignup, useCitizenAppointments } from '../../../lib/relative/api'
import { formatDateLabel, formatTime, formatTimeRange } from '../../../lib/relative/format'
import type { Appointment, AppointmentType } from '#/models/appointment'

export const Route = createFileRoute('/relative/$citizenId/calendar')({
  component: CitizenCalendar,
})

const typeIcon: Record<AppointmentType, LucideIcon> = {
  screen_visit: Video,
  home_visit: MapPin,
  activity: Check,
}

const typeChipColor: Record<AppointmentType, 'accent' | 'success'> = {
  screen_visit: 'accent',
  home_visit: 'accent',
  activity: 'success',
}

function CitizenCalendar() {
  const { citizenId } = Route.useParams()
  const { data: appointments, error, refetch } = useCitizenAppointments(citizenId)
  const cancelMutation = useCancelCitizenActivitySignup(citizenId)

  if (!appointments && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" color="accent" aria-label="Loading the calendar" />
      </div>
    )
  }

  if (error && !appointments) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>We couldn't load the calendar</Alert.Title>
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

  if (upcoming.length === 0) {
    return (
      <EmptyState className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CalendarDays className="size-7" aria-hidden />
        </span>
        <p className="text-base font-bold text-foreground">No upcoming appointments</p>
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {cancelMutation.error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{cancelMutation.error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {upcoming.map((appointment) => (
        <AppointmentRow
          key={appointment.id}
          appointment={appointment}
          isCancelling={cancelMutation.isPending && cancelMutation.variables === appointment.id}
          onCancel={() => cancelMutation.mutate(appointment.id)}
        />
      ))}
    </div>
  )
}

function AppointmentRow({
  appointment,
  isCancelling,
  onCancel,
}: {
  appointment: Appointment
  isCancelling: boolean
  onCancel: () => void
}) {
  const Icon = typeIcon[appointment.type]
  const details = [formatTimeRange(appointment.start, appointment.end), appointment.location]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card className="flex-row items-center gap-3">
      <div className="flex size-12 flex-none flex-col items-center justify-center rounded-lg bg-accent-soft text-accent">
        <span className="text-[10px] font-bold uppercase">{formatDateLabel(appointment.start)}</span>
        <span className="text-sm font-extrabold">{formatTime(appointment.start)}</span>
      </div>

      <Card.Content className="min-w-0 gap-0.5">
        <Card.Title className="text-sm">{appointment.title}</Card.Title>
        <Card.Description className="text-xs">{details}</Card.Description>
      </Card.Content>

      <div className="flex flex-none flex-col items-end gap-1">
        <Chip color={typeChipColor[appointment.type]} variant="soft" size="sm" className="gap-1">
          <Icon className="size-3.5" aria-hidden />
        </Chip>
        {appointment.type === 'activity' && (
          <Button
            variant="ghost"
            size="sm"
            className="text-accent underline underline-offset-4"
            isPending={isCancelling}
            onPress={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </Card>
  )
}
