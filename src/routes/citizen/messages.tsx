import { createFileRoute, Navigate } from '@tanstack/react-router'
import { CitizenShell, MessageList, useCitizen } from '../../components/citizen'

export const Route = createFileRoute('/citizen/messages')({ component: Messages })

function Messages() {
  const { careHome } = useCitizen()

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <CitizenShell title="Beskeder">
      <MessageList />
    </CitizenShell>
  )
}
