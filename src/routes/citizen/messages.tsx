import { createFileRoute, Navigate } from '@tanstack/react-router'
import { EmptyState, Spinner } from '@heroui/react'
import { MessageSquare } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { cardClass } from '../../lib/citizen/styles'

export const Route = createFileRoute('/citizen/messages')({
  component: Messages,
})

function Messages() {
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations()
  const careHome = organizations?.[0]

  if (isOrganizationsPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter beskeder" />
      </div>
    )
  }

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <EmptyState className={`${cardClass} flex flex-col items-center gap-4 px-8 py-12 text-center`}>
      <span className="flex size-21 items-center justify-center rounded-full bg-accent-soft text-accent">
        <MessageSquare className="size-10" aria-hidden />
      </span>
      <p className="text-3xl font-bold text-foreground">Du har ingen beskeder endnu</p>
      <p className="max-w-xl text-xl leading-relaxed text-muted">
        Beskeder fra dit plejehjem og dine pårørende vil blive vist her.
      </p>
    </EmptyState>
  )
}
