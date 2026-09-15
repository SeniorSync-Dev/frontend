import { Card, Chip } from '@heroui/react'
import { Check, MapPin, Video, type LucideIcon } from 'lucide-react'
import type { Appointment, AppointmentType } from '../../lib/citizen/types'
import { appointmentTypeLabel } from '../../lib/citizen/appointments'
import { formatDateLabel, formatTime } from '../../lib/citizen/format'
import { DateBox } from './DateBox'
import { cardClass } from './styles'

const typeIcon: Record<AppointmentType, LucideIcon> = {
  screen_visit: Video,
  home_visit: MapPin,
  activity: Check,
}

const typeChipClass: Record<AppointmentType, string> = {
  screen_visit: 'bg-accent-soft text-accent',
  home_visit: 'bg-(--brand-soft) text-(--brand)',
  activity: 'bg-success-soft text-success',
}

interface AppointmentCardProps {
  appointment: Appointment
  highlighted?: boolean
}

export function AppointmentCard({ appointment, highlighted = false }: AppointmentCardProps) {
  const Icon = typeIcon[appointment.type]

  return (
    <Card
      className={`${cardClass} flex-row flex-wrap items-center gap-6 sm:flex-nowrap ${highlighted ? 'border-2 border-accent' : ''}`}
    >
      <DateBox label={formatDateLabel(appointment.start)} value={formatTime(appointment.start)} />

      <Card.Content className="min-w-0 gap-1">
        <Card.Title className="text-2xl leading-tight font-bold">{appointment.title}</Card.Title>
        {appointment.description && (
          <Card.Description className="text-xl leading-snug">{appointment.description}</Card.Description>
        )}
      </Card.Content>

      <Chip
        className={`h-auto flex-none gap-2 rounded-full px-5 py-2.5 text-lg font-bold ${typeChipClass[appointment.type]}`}
      >
        <Icon className="size-5" strokeWidth={appointment.type === 'activity' ? 3 : 2} aria-hidden />
        <Chip.Label>{appointmentTypeLabel[appointment.type]}</Chip.Label>
      </Chip>
    </Card>
  )
}
