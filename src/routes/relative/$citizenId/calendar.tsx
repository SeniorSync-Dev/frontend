import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Calendar, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { CalendarDate } from '@internationalized/date'
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleCheck, MapPin, Pencil, Trash2, Video, X, type LucideIcon } from 'lucide-react'
import { authClient } from '../../../lib/auth-client'
import { useCancelCitizenActivitySignup, useCitizenAppointments, useCompleteVisit, useDeleteVisit } from '../../../lib/relative/api'
import { VisitModal } from '../../../lib/relative/VisitModal'
import { formatDateLabel, formatDayNumber, formatLongDate, formatShortWeekday, formatTime, formatTimeRange } from '../../../lib/format'
import { ListPagination, pageCountOf, pageSlice } from '../../../lib/ListPagination'
import { useNow } from '../../../lib/useNow'
import type { Appointment, AppointmentType } from '#/models/appointment'

export const Route = createFileRoute('/relative/$citizenId/calendar')({
  component: CitizenCalendar,
  validateSearch: (search: Record<string, unknown>): { view?: 'week' | 'month' } => ({
    view: search.view === 'month' ? 'month' : undefined,
  }),
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

function toCalendarDate(date: Date) {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfWeek(date: Date) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const monthFormatter = new Intl.DateTimeFormat('da-DK', { month: 'long' })

function manageAction(
  appointment: Appointment,
  ownUserId?: string,
): { label: string; icon: LucideIcon } | null {
  if (appointment.type === 'activity') return { label: 'Afmeld', icon: X }
  if (appointment.createdByUserId && appointment.createdByUserId === ownUserId)
    return { label: 'Slet', icon: Trash2 }
  return null
}

function isOver(appointment: Appointment, now: Date) {
  return (appointment.end ?? appointment.start) < now
}

function isOwnVisit(appointment: Appointment, ownUserId?: string) {
  return appointment.type !== 'activity' && !!appointment.createdByUserId && appointment.createdByUserId === ownUserId
}

function canComplete(appointment: Appointment, now: Date, ownUserId?: string) {
  return isOwnVisit(appointment, ownUserId) && isOver(appointment, now) && !appointment.isCompleted
}

function CitizenCalendar() {
  const { citizenId } = Route.useParams()
  const { view } = Route.useSearch()
  const { data: session } = authClient.useSession()
  const { data: appointments, error, refetch } = useCitizenAppointments(citizenId)
  const cancelMutation = useCancelCitizenActivitySignup(citizenId)
  const deleteVisitMutation = useDeleteVisit(citizenId)
  const completeVisitMutation = useCompleteVisit(citizenId)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null)
  const [monthPage, setMonthPage] = useState(1)

  const upcoming = appointments ?? []
  const now = useNow()

  const datesWithAppointments = useMemo(
    () => new Set(upcoming.map((appointment) => toCalendarDate(appointment.start).toString())),
    [upcoming],
  )

  const filtered = selectedDate
    ? upcoming.filter((appointment) => toCalendarDate(appointment.start).compare(selectedDate) === 0)
    : upcoming

  const page = Math.min(monthPage, pageCountOf(filtered.length))

  function handleManage(appointment: Appointment) {
    if (appointment.type === 'activity') {
      cancelMutation.mutate(appointment.id)
    } else {
      deleteVisitMutation.mutate(appointment.id)
    }
  }

  function isManaging(id: string) {
    return (
      (cancelMutation.isPending && cancelMutation.variables === id) ||
      (deleteVisitMutation.isPending && deleteVisitMutation.variables === id) ||
      (completeVisitMutation.isPending && completeVisitMutation.variables === id)
    )
  }

  if (!appointments && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" color="accent" aria-label="Henter kalenderen" />
      </div>
    )
  }

  if (error && !appointments) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Vi kunne ikke hente kalenderen</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const manageError =
    cancelMutation.error ?? deleteVisitMutation.error ?? completeVisitMutation.error

  return (
    <div className="flex flex-col gap-4">
      {manageError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{manageError.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {view !== 'month' ? (
        <WeekView
          citizenId={citizenId}
          appointments={upcoming}
          weekOffset={weekOffset}
          onWeekOffsetChange={setWeekOffset}
          ownUserId={session?.user.id}
          now={now}
          isManaging={isManaging}
          onManage={handleManage}
          onComplete={(appointment) => completeVisitMutation.mutate(appointment.id)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <Calendar
            aria-label="Vælg en dato"
            className="mx-auto"
            value={selectedDate}
            onChange={setSelectedDate}
            isDateUnavailable={(date) => !datesWithAppointments.has(date.toString())}
          />

          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            {selectedDate && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{formatLongDate(selectedDate.toDate('UTC'))}</p>
                <Button variant="ghost" size="sm" onPress={() => setSelectedDate(null)}>
                  <X className="size-4" aria-hidden />
                  Vis alle
                </Button>
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <CalendarDays className="size-7" aria-hidden />
                </span>
                <p className="text-base font-bold text-foreground">
                  {selectedDate ? 'Ingen aftaler denne dag' : 'Ingen kommende aftaler'}
                </p>
              </EmptyState>
            ) : (
              <>
                {pageSlice(filtered, page).map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    citizenId={citizenId}
                    appointment={appointment}
                    ownUserId={session?.user.id}
                    now={now}
                    isManaging={isManaging(appointment.id)}
                    onManage={() => handleManage(appointment)}
                    onComplete={() => completeVisitMutation.mutate(appointment.id)}
                  />
                ))}

                <ListPagination
                  page={page}
                  itemCount={filtered.length}
                  label="aftaler"
                  onPageChange={setMonthPage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function WeekView({
  citizenId,
  appointments,
  weekOffset,
  onWeekOffsetChange,
  ownUserId,
  now,
  isManaging,
  onManage,
  onComplete,
}: {
  citizenId: string
  appointments: Appointment[]
  weekOffset: number
  onWeekOffsetChange: (offset: number) => void
  ownUserId?: string
  now: Date
  isManaging: (id: string) => boolean
  onManage: (appointment: Appointment) => void
  onComplete: (appointment: Appointment) => void
}) {
  const monday = useMemo(() => {
    const start = startOfWeek(now)
    start.setDate(start.getDate() + weekOffset * 7)
    return start
  }, [now, weekOffset])

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)),
    [monday],
  )

  const sunday = days[6]
  const sameMonth = monday.getMonth() === sunday.getMonth()
  const rangeLabel = sameMonth
    ? `${monday.getDate()}.–${sunday.getDate()}. ${monthFormatter.format(monday)}`
    : `${monday.getDate()}. ${monthFormatter.format(monday)} – ${sunday.getDate()}. ${monthFormatter.format(sunday)}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onWeekOffsetChange(weekOffset - 1)}
            aria-label="Forrige uge"
            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            onClick={() => onWeekOffsetChange(weekOffset + 1)}
            aria-label="Næste uge"
            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <p className="ml-1 text-sm font-semibold">{rangeLabel}</p>
        </div>

        {weekOffset !== 0 && (
          <Button variant="ghost" size="sm" onPress={() => onWeekOffsetChange(0)}>
            Denne uge
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border sm:grid-cols-7">
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            citizenId={citizenId}
            day={day}
            isToday={isSameDay(day, now)}
            now={now}
            appointments={appointments.filter((a) => isSameDay(a.start, day))}
            ownUserId={ownUserId}
            isManaging={isManaging}
            onManage={onManage}
            onComplete={onComplete}
          />
        ))}
      </div>
    </div>
  )
}

function DayColumn({
  citizenId,
  day,
  isToday,
  now,
  appointments,
  ownUserId,
  isManaging,
  onManage,
  onComplete,
}: {
  citizenId: string
  day: Date
  isToday: boolean
  now: Date
  appointments: Appointment[]
  ownUserId?: string
  isManaging: (id: string) => boolean
  onManage: (appointment: Appointment) => void
  onComplete: (appointment: Appointment) => void
}) {
  return (
    <div className="flex flex-col border-b border-border last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <p
        className={`border-b border-border bg-surface px-2 py-2 text-xs font-bold uppercase ${
          isToday ? 'text-accent' : 'text-muted'
        }`}
      >
        {formatShortWeekday(day)}
        {isToday ? ' · I dag' : ''}
        <span className="ml-1 text-foreground">{formatDayNumber(day)}</span>
      </p>

      {appointments.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted">Ingen aftaler</p>
      ) : (
        <div className="flex flex-1 flex-col gap-2 p-2">
          {appointments.map((appointment) => {
            const action = manageAction(appointment, ownUserId)
            return (
              <Card
                key={appointment.id}
                className={`gap-1 p-2.5 ${isToday ? 'border-accent' : ''} ${
                  isOver(appointment, now) ? 'opacity-50' : ''
                }`}
              >
                <p className="text-xs font-bold text-accent">
                  {formatTimeRange(appointment.start, appointment.end)}
                </p>
                <p className="text-xs font-semibold text-foreground">{appointment.title}</p>
                {appointment.location && (
                  <p className="flex items-start gap-1 text-xs leading-tight text-muted">
                    <MapPin className="mt-0.5 size-3 flex-none" aria-hidden />
                    {appointment.location}
                  </p>
                )}
                <div className="flex items-center justify-end gap-0.5">
                  {appointment.isCompleted && (
                    <span
                      title="Udført"
                      className="mr-auto flex items-center gap-1 text-xs font-medium text-success"
                    >
                      <CircleCheck className="size-3.5" aria-hidden />
                      Udført
                    </span>
                  )}

                  {canComplete(appointment, now, ownUserId) && (
                    <button
                      onClick={() => onComplete(appointment)}
                      disabled={isManaging(appointment.id)}
                      title="Marker som udført"
                      aria-label={`Marker ${appointment.title} som udført`}
                      className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-success disabled:opacity-50"
                    >
                      <Check className="size-3.5" aria-hidden />
                    </button>
                  )}

                  {isOwnVisit(appointment, ownUserId) && !appointment.isCompleted && (
                    <VisitModal
                      citizenId={citizenId}
                      visit={appointment}
                      trigger={(open) => (
                        <button
                          onClick={open}
                          title="Rediger"
                          aria-label={`Rediger ${appointment.title}`}
                          className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </button>
                      )}
                    />
                  )}
                  {action && (
                    <button
                      onClick={() => onManage(appointment)}
                      disabled={isManaging(appointment.id)}
                      title={action.label}
                      aria-label={`${action.label} ${appointment.title}`}
                      className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-danger disabled:opacity-50"
                    >
                      <action.icon className="size-3.5" aria-hidden />
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AppointmentRow({
  citizenId,
  appointment,
  ownUserId,
  now,
  isManaging,
  onManage,
  onComplete,
}: {
  citizenId: string
  appointment: Appointment
  ownUserId?: string
  now: Date
  isManaging: boolean
  onManage: () => void
  onComplete: () => void
}) {
  const Icon = typeIcon[appointment.type]
  const details = [formatTimeRange(appointment.start, appointment.end), appointment.location]
    .filter(Boolean)
    .join(' · ')
  const action = manageAction(appointment, ownUserId)

  return (
    <Card className={`flex-row items-center gap-3 ${isOver(appointment, now) ? 'opacity-50' : ''}`}>
      <div className="flex h-12 w-16 flex-none flex-col items-center justify-center rounded-lg bg-accent-soft px-1 text-accent">
        <span className="text-[10px] font-bold whitespace-nowrap uppercase">{formatDateLabel(appointment.start)}</span>
        <span className="text-sm font-extrabold">{formatTime(appointment.start)}</span>
      </div>

      <Card.Content className="min-w-0 gap-0.5">
        <Card.Title className="text-sm">{appointment.title}</Card.Title>
        <Card.Description className="text-xs">{details}</Card.Description>
      </Card.Content>

      <div className="flex flex-none items-center gap-2">
        {appointment.isCompleted ? (
          <Chip color="success" variant="soft" size="sm" className="gap-1">
            <CircleCheck className="size-3.5" aria-hidden />
            <Chip.Label>Udført</Chip.Label>
          </Chip>
        ) : (
          <Chip color={typeChipColor[appointment.type]} variant="soft" size="sm" className="gap-1">
            <Icon className="size-3.5" aria-hidden />
          </Chip>
        )}

        {canComplete(appointment, now, ownUserId) && (
          <button
            onClick={onComplete}
            disabled={isManaging}
            title="Marker som udført"
            aria-label={`Marker ${appointment.title} som udført`}
            className="flex size-7 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-success disabled:opacity-50"
          >
            <Check className="size-3.5" aria-hidden />
          </button>
        )}

        {isOwnVisit(appointment, ownUserId) && !appointment.isCompleted && (
          <VisitModal
            citizenId={citizenId}
            visit={appointment}
            trigger={(open) => (
              <button
                onClick={open}
                aria-label="Rediger besøg"
                className="flex size-7 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground"
              >
                <Pencil className="size-3.5" aria-hidden />
              </button>
            )}
          />
        )}
        {action && (
          <button
            onClick={onManage}
            disabled={isManaging}
            title={action.label}
            aria-label={`${action.label} ${appointment.title}`}
            className="flex size-7 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-danger disabled:opacity-50"
          >
            <action.icon className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
    </Card>
  )
}
