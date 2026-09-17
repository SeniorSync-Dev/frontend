import { createFileRoute, Link, useNavigate, type LinkProps } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { CalendarDays, Check, ChevronRight, Clock, MapPin, Phone, Users, Video, type LucideIcon } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { useAppointments } from '../../lib/citizen/api'
import { nextAppointment, nextAppointmentHeading } from '../../lib/citizen/appointments'
import { firstName, formatLongDate, formatRelativeDay, formatTimeRange, greeting } from '../../lib/citizen/format'
import { xlButton } from '../../lib/citizen/styles'
import type { AppointmentType, Appointment } from '#/models/appointment'

export const Route = createFileRoute('/citizen/')({
  component: CitizenHome,
})

function CitizenHome() {
  const { data: session } = authClient.useSession()
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations()
  const careHome = organizations?.[0]

  const { data: appointments, error } = useAppointments()

  if (!session) return null

  const first = firstName(session.user.name)

  if (isOrganizationsPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter dine oplysninger" />
      </div>
    )
  }

  if (!careHome) {
    return <WaitingForCareHome firstName={first} />
  }

  if (!appointments && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter dine aftaler" />
      </div>
    )
  }

  const now = new Date()
  const next = appointments && nextAppointment(appointments)

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">
          {greeting(now)}
          {first ? `, ${first}` : ''}
        </h1>
        <p className="mt-1 text-2xl text-muted">{formatLongDate(now)}</p>
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Vi kunne ikke hente dine aftaler</Alert.Title>
            <Alert.Description className="text-lg">{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Card className="gap-5 p-6 sm:p-7">
        <Card.Header className="flex-row items-center gap-3">
          <CalendarDays className="size-6 text-accent" aria-hidden />
          <Card.Title className="text-xl font-bold text-accent">Dit næste besøg</Card.Title>
        </Card.Header>

        <Card.Content>
          {next ? (
            <NextAppointment appointment={next} now={now} />
          ) : (
            <p className="text-2xl text-muted">Du har ingen kommende aftaler lige nu.</p>
          )}
        </Card.Content>

        <Card.Footer>
          <SeeAppointmentsButton />
        </Card.Footer>
      </Card>

      <NavigationCard
        to="/citizen/activities"
        icon={Users}
        title="Aktiviteter"
        description="Se og tilmeld dig aktiviteter"
      />
    </>
  )
}

function SeeAppointmentsButton() {
  const navigate = useNavigate()

  return (
    <Button variant="primary" fullWidth className={xlButton} onPress={() => navigate({ to: '/citizen/appointments' })}>
      Se mine aftaler
      <ChevronRight className="size-6" strokeWidth={2.5} aria-hidden />
    </Button>
  )
}

const typeIcon: Record<AppointmentType, LucideIcon> = {
  screen_visit: Video,
  home_visit: MapPin,
  activity: Users,
}

function NextAppointment({ appointment, now }: { appointment: Appointment; now: Date }) {
  const Icon = typeIcon[appointment.type]
  const heading = nextAppointmentHeading(appointment, formatRelativeDay(appointment.start, now))
  const subtitle = [appointment.staffName && `med ${appointment.staffName}`, appointment.description]
    .filter(Boolean)
    .join(' - ')
  const meta = [`Kl. ${formatTimeRange(appointment.start, appointment.end)}`, appointment.location]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-wrap items-center gap-6 sm:flex-nowrap">
      <span className="flex size-21 flex-none items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="size-10" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-3xl leading-tight font-bold">{heading}</p>
        {subtitle && <p className="mt-1 text-2xl text-muted">{subtitle}</p>}
        <p className="mt-1 text-2xl text-muted">{meta}</p>
      </div>
    </div>
  )
}

function NavigationCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: LinkProps['to']
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-6 no-underline transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <span className="flex size-15 flex-none items-center justify-center rounded-xl bg-(--brand-soft) text-(--brand)">
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold text-foreground">{title}</span>
        <span className="block text-xl text-muted">{description}</span>
      </span>
      <ChevronRight className="size-6 flex-none text-muted" strokeWidth={2.5} aria-hidden />
    </Link>
  )
}

type StepStatus = 'done' | 'active' | 'upcoming'

const steps: Array<{ number: number; title: string; text: string; status: StepStatus }> = [
  {
    number: 1,
    title: 'Du er oprettet',
    text: 'Dit login virker, og dine oplysninger er gemt.',
    status: 'done',
  },
  {
    number: 2,
    title: 'Vi finder dit plejehjem',
    text: 'Kommunen tilknytter dig et plejehjem dér, hvor du bor.',
    status: 'active',
  },
  {
    number: 3,
    title: 'Så er du i gang',
    text: 'Du kan se dine aftaler, få besøg og skrive med dit plejehjem.',
    status: 'upcoming',
  },
]

function WaitingForCareHome({ firstName: first }: { firstName: string }) {
  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">Velkommen{first ? `, ${first}` : ''}</h1>
        <p className="mt-1 text-2xl text-muted">Du er logget ind. Vi er ved at gøre alt klar til dig.</p>
      </div>

      <Card className="flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <span className="flex size-21 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
          <Clock className="size-10" aria-hidden />
        </span>
        <Card.Content className="gap-1">
          <Card.Title className="text-3xl leading-tight font-bold">Kommunen tilknytter dig et plejehjem</Card.Title>
          <Card.Description className="text-xl leading-snug">
            Det sker som regel inden for få dage. Du får besked, så snart det er på plads.
          </Card.Description>
        </Card.Content>
      </Card>

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.number} aria-current={step.status === 'active' ? 'step' : undefined}>
            <Card className={`h-full gap-2 p-5 ${step.status === 'active' ? 'border-2 border-accent' : ''}`}>
              <Card.Header className="flex-row items-center gap-3">
                <StepMarker number={step.number} status={step.status} />
                <Card.Title className="text-xl font-bold">{step.title}</Card.Title>
              </Card.Header>
              <Card.Content>
                <Card.Description className="text-lg leading-relaxed">{step.text}</Card.Description>
              </Card.Content>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="mt-auto flex-col items-start gap-3 rounded-2xl border-none bg-accent-soft px-5 py-4 shadow-none sm:flex-row sm:items-center sm:gap-5 sm:px-6">
        <Phone className="size-7 flex-none text-accent" aria-hidden />
        <Card.Content className="gap-1">
          <p className="text-xl">
            <strong>Har du spørgsmål?</strong> Kontakt din kommune - de hjælper dig videre.
          </p>
          <p className="text-lg text-muted">Har du akut brug for hjælp, så brug knappen Tilkald hjælp øverst på siden.</p>
        </Card.Content>
      </Card>
    </>
  )
}

function StepMarker({ number, status }: { number: number; status: StepStatus }) {
  if (status === 'done') {
    return (
      <span className="flex size-11 flex-none items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-6" strokeWidth={3} aria-hidden />
        <span className="sr-only">Færdig</span>
      </span>
    )
  }

  return (
    <span
      className={`flex size-11 flex-none items-center justify-center rounded-full text-xl font-extrabold ${
        status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-default text-default-foreground'
      }`}
    >
      {number}
    </span>
  )
}
