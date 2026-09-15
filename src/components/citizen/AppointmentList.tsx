import { CalendarDays } from 'lucide-react'
import type { Appointment } from '../../lib/citizen/types'
import { upcomingAppointments } from '../../lib/citizen/appointments'
import { AppointmentCard } from './AppointmentCard'
import { EmptyListState } from './EmptyListState'

interface AppointmentListProps {
  appointments?: Appointment[]
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  const upcoming = appointments && upcomingAppointments(appointments)

  if (!upcoming?.length) {
    return (
      <EmptyListState
        icon={CalendarDays}
        title="Du har ingen kommende aftaler"
        description="Når dit plejehjem planlægger et besøg eller en aktivitet, kan du se det her."
      />
    )
  }

  return (
    <>
      <p className="text-2xl text-muted">Her er dine næste aftaler - én ad gangen:</p>
      {upcoming.map((appointment, index) => (
        <AppointmentCard key={appointment.id} appointment={appointment} highlighted={index === 0} />
      ))}
    </>
  )
}
