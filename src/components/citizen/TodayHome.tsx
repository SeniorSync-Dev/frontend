import { useNavigate } from '@tanstack/react-router'
import { Button, Card } from '@heroui/react'
import { CalendarDays, ChevronRight, MapPin, MessageSquare, Users, Video, type LucideIcon } from 'lucide-react'
import type { Appointment, AppointmentType } from '../../lib/citizen/types'
import { nextAppointment, nextAppointmentHeading } from '../../lib/citizen/appointments'
import { firstName, formatLongDate, formatRelativeDay, formatTime, greeting } from '../../lib/citizen/format'
import { NavigationCard } from './NavigationCard'
import { cardClass, xlButton } from './styles'

interface TodayHomeProps {
  name: string
  appointments?: Appointment[]
  unreadMessageCount?: number
}

export function TodayHome({ name, appointments, unreadMessageCount }: TodayHomeProps) {
  const navigate = useNavigate()
  const now = new Date()
  const next = appointments && nextAppointment(appointments, now)
  const first = firstName(name)

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">
          {greeting(now)}
          {first ? `, ${first}` : ''}
        </h1>
        <p className="mt-1 text-2xl text-muted">{formatLongDate(now)}</p>
      </div>

      <Card className={`${cardClass} gap-5 p-6 sm:p-7`}>
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
          <Button
            variant="primary"
            fullWidth
            className={xlButton}
            onPress={() => navigate({ to: '/citizen/appointments' })}
          >
            Se mine aftaler
            <ChevronRight className="size-6" strokeWidth={2.5} aria-hidden />
          </Button>
        </Card.Footer>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <NavigationCard
          to="/citizen/activities"
          icon={Users}
          title="Aktiviteter"
          description="Se og tilmeld dig aktiviteter"
          color="brand"
        />
        <NavigationCard
          to="/citizen/messages"
          icon={MessageSquare}
          title="Beskeder"
          description={unreadMessagesText(unreadMessageCount)}
        />
      </div>
    </>
  )
}

function unreadMessagesText(count?: number) {
  if (!count) return 'Ingen nye beskeder'
  if (count === 1) return '1 ny besked'
  return `${count} nye beskeder`
}

const typeIcon: Record<AppointmentType, LucideIcon> = {
  screen_visit: Video,
  home_visit: MapPin,
  activity: Users,
}

function NextAppointment({ appointment, now }: { appointment: Appointment; now: Date }) {
  const Icon = typeIcon[appointment.type]
  const heading = nextAppointmentHeading(
    appointment,
    formatRelativeDay(appointment.start, now),
    formatTime(appointment.start),
  )
  const subtitle = [appointment.staffName && `med ${appointment.staffName}`, appointment.description]
    .filter(Boolean)
    .join(' - ')

  return (
    <div className="flex flex-wrap items-center gap-6 sm:flex-nowrap">
      <span className="flex size-21 flex-none items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon className="size-10" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-3xl leading-tight font-bold">{heading}</p>
        {subtitle && <p className="mt-1 text-2xl text-muted">{subtitle}</p>}
      </div>
    </div>
  )
}
