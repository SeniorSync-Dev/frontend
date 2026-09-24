import { useState } from 'react'
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { Alert, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { Check, Users } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { useActivities, useCancelActivitySignup, useSignUpForActivity } from '../../lib/citizen/api'
import { Button } from '../../lib/citizen/Button'
import { formatDayNumber, formatLongDate, formatShortWeekday, formatTime, formatTimeRange } from '../../lib/citizen/format'
import type { Activity } from '#/models/activity'

export const Route = createFileRoute('/citizen/activities')({
  component: Activities,
})

function Activities() {
  const navigate = useNavigate()
  const { data: organizations, isPending: isOrganizationsPending } = authClient.useListOrganizations()
  const careHome = organizations?.[0]

  const { data: activities, error, refetch } = useActivities()
  const signUpMutation = useSignUpForActivity()
  const cancelMutation = useCancelActivitySignup()

  const [confirmed, setConfirmed] = useState<Activity | null>(null)

  async function signUp(activity: Activity) {
    await signUpMutation.mutateAsync(activity.id)
    setConfirmed(activity)
  }

  if (isOrganizationsPending || (careHome && !activities && !error)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter aktiviteter" />
      </div>
    )
  }

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  if (confirmed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center" role="status">
        <span className="flex size-30 items-center justify-center rounded-full border-3 border-success bg-success-soft text-success">
          <Check className="size-15" strokeWidth={2.5} aria-hidden />
        </span>

        <h1 className="text-4xl font-bold">Du er nu tilmeldt</h1>

        <p className="max-w-2xl text-2xl leading-relaxed text-muted">
          <strong className="text-foreground">{confirmed.title}</strong>
          <br />
          {formatLongDate(confirmed.start)} kl. {formatTime(confirmed.start)}
          {confirmed.location && (
            <>
              <br />
              {confirmed.location}
            </>
          )}
        </p>

        <Button variant="primary" size="xl" className="px-11" onPress={() => navigate({ to: '/citizen' })}>
          Tilbage til forsiden
        </Button>
      </div>
    )
  }

  if (error && !activities) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-8">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Vi kunne ikke hente aktiviteterne</Alert.Title>
            <Alert.Description className="text-lg">{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" size="lg" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const upcoming = activities ?? []

  if (upcoming.length === 0) {
    return (
      <EmptyState className="flex flex-col items-center gap-4 px-8 py-12 text-center">
        <span className="flex size-21 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Users className="size-10" aria-hidden />
        </span>
        <p className="text-3xl font-bold text-foreground">Der er ingen aktiviteter lige nu</p>
        <p className="max-w-xl text-xl leading-relaxed text-muted">
          Når dit plejehjem opretter aktiviteter, kan du se og tilmelde dig dem her.
        </p>
      </EmptyState>
    )
  }

  const mutationError = signUpMutation.error ?? cancelMutation.error

  return (
    <>
      {mutationError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Det lykkedes ikke</Alert.Title>
            <Alert.Description className="text-lg">{mutationError.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <p className="text-2xl text-muted">Her er de næste aktiviteter, du kan være med til:</p>

      {upcoming.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isBusy={
            (signUpMutation.isPending && signUpMutation.variables === activity.id) ||
            (cancelMutation.isPending && cancelMutation.variables === activity.id)
          }
          onSignUp={signUp}
          onCancel={(a) => cancelMutation.mutate(a.id)}
        />
      ))}
    </>
  )
}

function ActivityCard({
  activity,
  isBusy,
  onSignUp,
  onCancel,
}: {
  activity: Activity
  isBusy: boolean
  onSignUp: (activity: Activity) => void
  onCancel: (activity: Activity) => void
}) {
  const details = [
    `Kl. ${formatTimeRange(activity.start, activity.end)}`,
    activity.location,
    activity.meetingPoint && `Vi mødes ${activity.meetingPoint}`,
    activity.providerCompanyName && `Arrangeret af ${activity.providerCompanyName}`,
    !activity.isSignedUp && activity.availableSpots !== undefined && `${activity.availableSpots} ledige pladser`,
  ]
    .filter(Boolean)
    .join(' · ')

  const isFull = !activity.isSignedUp && activity.availableSpots === 0

  return (
    <Card className={`flex-row flex-wrap items-center gap-6 sm:flex-nowrap ${activity.isSignedUp ? 'border-2 border-success' : ''}`}>
      <div
        className={`flex size-21 flex-none flex-col items-center justify-center rounded-xl ${
          activity.isSignedUp ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent'
        }`}
      >
        <span className="text-base font-bold uppercase">{formatShortWeekday(activity.start)}</span>
        <span className="text-2xl font-extrabold text-foreground">{formatDayNumber(activity.start)}</span>
      </div>

      <Card.Content className="min-w-0 gap-1">
        <Card.Title className="text-2xl leading-tight font-bold">{activity.title}</Card.Title>
        <Card.Description className="text-xl leading-snug">{details}</Card.Description>
      </Card.Content>

      {activity.isSignedUp ? (
        <div className="flex flex-none flex-col items-end gap-2">
          <Chip color="success" variant="primary" size="lg" className="gap-2">
            <Check className="size-5" strokeWidth={3} aria-hidden />
            <Chip.Label>Du er tilmeldt</Chip.Label>
          </Chip>
          <Button
            variant="ghost"
            className="h-12 rounded-xl px-4 text-lg font-semibold text-accent underline underline-offset-4"
            isPending={isBusy}
            onPress={() => onCancel(activity)}
          >
            Afmeld dig
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="flex-none px-8"
          isPending={isBusy}
          isDisabled={isFull}
          onPress={() => onSignUp(activity)}
        >
          {isFull ? 'Ingen ledige pladser' : 'Tilmeld dig'}
        </Button>
      )}
    </Card>
  )
}
