import { createFileRoute, Navigate } from '@tanstack/react-router'
import { AppointmentList, CitizenShell, ErrorState, LoadingState, useCitizen } from '../../components/citizen'
import { fetchAppointments } from '../../lib/citizen/api'
import { useAsyncData } from '../../lib/useAsyncData'

export const Route = createFileRoute('/citizen/appointments')({ component: Appointments })

function Appointments() {
  const { careHome } = useCitizen()

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <CitizenShell title="Mine aftaler">
      <AppointmentsData />
    </CitizenShell>
  )
}

function AppointmentsData() {
  const { data: appointments, isPending, error, refetch } = useAsyncData(fetchAppointments)

  if (isPending && !appointments) return <LoadingState label="Henter dine aftaler" />
  if (error && !appointments) return <ErrorState title="Vi kunne ikke hente dine aftaler" onRetry={refetch} />

  return <AppointmentList appointments={appointments} />
}
