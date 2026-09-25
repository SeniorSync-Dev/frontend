import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Alert, Card, Chip, EmptyState, Input, Spinner, TextArea } from '@heroui/react'
import { CalendarDays, Check, CircleCheck, MapPin, Video, type LucideIcon } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { useAppointments, useBookVisit, useCancelActivitySignup } from '../../lib/citizen/api'
import { appointmentTypeLabel } from '../../lib/citizen/appointments'
import { Button } from '../../lib/citizen/Button'
import { formatDateLabel, formatTime, formatTimeRange } from '../../lib/format'
import { ListPagination, pageCountOf, pageSlice } from '../../lib/ListPagination'
import { useNow } from '../../lib/useNow'
import type { AppointmentType, Appointment } from '#/models/appointment'

const APPOINTMENTS_PER_PAGE = 4

export const Route = createFileRoute('/citizen/appointments')({
  component: Appointments,
})

function isOver(appointment: Appointment, now: Date) {
  return (appointment.end ?? appointment.start) < now
}

function Appointments() {
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations()
  const careHome = organizations?.[0]

  const { data: appointments, error, refetch } = useAppointments()
  const cancelMutation = useCancelActivitySignup()
  const now = useNow()
  const [selectedPage, setSelectedPage] = useState<number | null>(null)

  if (isOrganizationsPending || (careHome && !appointments && !error)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter dine aftaler" />
      </div>
    )
  }

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  if (error && !appointments) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-8">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Vi kunne ikke hente dine aftaler</Alert.Title>
            <Alert.Description className="text-lg">{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" size="lg" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const upcoming = appointments ?? []
  const nextIndex = upcoming.findIndex((appointment) => !isOver(appointment, now))
  const next = nextIndex === -1 ? undefined : upcoming[nextIndex]

  const defaultPage = nextIndex === -1 ? 1 : Math.floor(nextIndex / APPOINTMENTS_PER_PAGE) + 1
  const page = Math.min(
    selectedPage ?? defaultPage,
    pageCountOf(upcoming.length, APPOINTMENTS_PER_PAGE),
  )

  return (
    <>
      <BookVisit />

      {cancelMutation.error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Det lykkedes ikke</Alert.Title>
            <Alert.Description className="text-lg">{cancelMutation.error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {upcoming.length === 0 ? (
        <EmptyState className="flex flex-col items-center gap-4 px-8 py-12 text-center">
          <span className="flex size-21 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CalendarDays className="size-10" aria-hidden />
          </span>
          <p className="text-3xl font-bold text-foreground">Du har ingen kommende aftaler</p>
          <p className="max-w-xl text-xl leading-relaxed text-muted">
            Når dit plejehjem planlægger et besøg eller en aktivitet, kan du se det her.
          </p>
        </EmptyState>
      ) : (
        <>
          <p className="text-2xl text-muted">Her er dine aftaler de næste 14 dage:</p>
          {pageSlice(upcoming, page, APPOINTMENTS_PER_PAGE).map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              highlighted={appointment === next}
              isFinished={isOver(appointment, now)}
              isCancelling={cancelMutation.isPending && cancelMutation.variables === appointment.id}
              onCancel={() => cancelMutation.mutate(appointment.id)}
            />
          ))}

          <ListPagination
            page={page}
            itemCount={upcoming.length}
            label="aftaler"
            pageSize={APPOINTMENTS_PER_PAGE}
            size="lg"
            onPageChange={setSelectedPage}
          />
        </>
      )}
    </>
  )
}

function BookVisit() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const bookVisit = useBookVisit()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduledStart) return

    bookVisit.mutate(
      { title: title || undefined, description: description || undefined, scheduledStart },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setScheduledStart('')
          setIsOpen(false)
        },
      },
    )
  }

  if (!isOpen) {
    return (
      <Button variant="primary" size="xl" fullWidth onPress={() => setIsOpen(true)}>
        <CalendarDays className="size-6" strokeWidth={2.5} aria-hidden />
        Bestil et besøg
      </Button>
    )
  }

  return (
    <Card className="gap-5 p-6 sm:p-7">
      <Card.Header>
        <Card.Title className="text-xl font-bold">Bestil et besøg</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {bookVisit.isError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="text-lg">Det lykkedes ikke</Alert.Title>
                <Alert.Description className="text-base">{bookVisit.error.message}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <label className="flex flex-col gap-2 text-xl font-semibold">
            Hvad handler besøget om? (valgfrit)
            <Input
              placeholder="F.eks. Hjælp til bad"
              className="h-14 text-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-xl font-semibold">
            Hvornår passer det dig?
            <Input
              type="datetime-local"
              required
              className="h-14 text-xl"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-xl font-semibold">
            Vil du fortælle lidt mere? (valgfrit)
            <TextArea
              className="text-xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary" size="xl" isPending={bookVisit.isPending}>
              Send bestilling
            </Button>
            <Button type="button" variant="outline" size="xl" onPress={() => setIsOpen(false)}>
              Annullér
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}


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

function AppointmentCard({
  appointment,
  highlighted,
  isFinished,
  isCancelling,
  onCancel,
}: {
  appointment: Appointment
  highlighted: boolean
  isFinished: boolean
  isCancelling: boolean
  onCancel: () => void
}) {
  const Icon = typeIcon[appointment.type]
  const details = [`Kl. ${formatTimeRange(appointment.start, appointment.end)}`, appointment.location]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card
      className={`flex-row flex-wrap items-center gap-6 sm:flex-nowrap ${
        highlighted ? 'border-2 border-accent' : ''
      } ${isFinished ? 'opacity-60' : ''}`}
    >
      <div className="flex size-21 flex-none flex-col items-center justify-center rounded-xl bg-accent-soft text-accent">
        <span className="text-base font-bold uppercase">{formatDateLabel(appointment.start)}</span>
        <span className="text-2xl font-extrabold text-foreground">{formatTime(appointment.start)}</span>
      </div>

      <Card.Content className="min-w-0 gap-1">
        <Card.Title className="text-2xl leading-tight font-bold">{appointment.title}</Card.Title>
        <Card.Description className="text-xl leading-snug">{details}</Card.Description>
        {appointment.description && (
          <Card.Description className="text-xl leading-snug">{appointment.description}</Card.Description>
        )}
      </Card.Content>

      <div className="flex flex-none flex-col items-end gap-2">
        {appointment.isCompleted ? (
          <Chip color="success" variant="soft" size="lg" className="gap-2">
            <CircleCheck className="size-5" aria-hidden />
            <Chip.Label>Udført</Chip.Label>
          </Chip>
        ) : (
          <Chip color={typeChipColor[appointment.type]} variant="soft" size="lg" className="gap-2">
            <Icon className="size-5" strokeWidth={appointment.type === 'activity' ? 3 : 2} aria-hidden />
            <Chip.Label>{appointmentTypeLabel[appointment.type]}</Chip.Label>
          </Chip>
        )}
        {appointment.type === 'activity' && !isFinished && (
          <Button
            variant="ghost"
            className="h-12 rounded-xl px-4 text-lg font-semibold text-accent underline underline-offset-4"
            isPending={isCancelling}
            onPress={onCancel}
          >
            Afmeld dig
          </Button>
        )}
      </div>
    </Card>
  )
}
