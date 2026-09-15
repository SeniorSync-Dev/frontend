import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ActivityList, CitizenShell, useCitizen } from '../../components/citizen'

export const Route = createFileRoute('/citizen/activities')({ component: Activities })

function Activities() {
  const { careHome } = useCitizen()

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <CitizenShell title="Aktiviteter">
      <ActivityList />
    </CitizenShell>
  )
}
