import { createFileRoute, Navigate } from '@tanstack/react-router'
import { AppointmentList, CitizenShell, useCitizen } from '../../components/citizen'

export const Route = createFileRoute('/citizen/appointments')({ component: Appointments })

function Appointments() {
  const { careHome } = useCitizen()

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <CitizenShell title="Mine aftaler">
      <AppointmentList />
    </CitizenShell>
  )
}
