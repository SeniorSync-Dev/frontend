import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { Check, Users } from 'lucide-react'
import {
  useCancelCitizenActivitySignup,
  useCitizenActivities,
  useLinkedCitizens,
  useSignUpCitizenForActivity,
} from '../../../lib/relative/api'
import { formatLongDate, formatTime, formatTimeRange } from '../../../lib/relative/format'
import type { Activity } from '#/models/activity'

export const Route = createFileRoute('/relative/$citizenId/activities')({
  component: CitizenActivities,
})

function CitizenActivities() {
  const { citizenId } = Route.useParams()
  const navigate = useNavigate()

  const { data: citizens } = useLinkedCitizens()
  const citizenName = citizens?.find((c) => c.citizenUserId === citizenId)?.name ?? 'the citizen'

  const { data: activities, error, refetch } = useCitizenActivities(citizenId)
  const signUpMutation = useSignUpCitizenForActivity(citizenId)
  const cancelMutation = useCancelCitizenActivitySignup(citizenId)

  const [confirmed, setConfirmed] = useState<Activity | null>(null)

  async function signUp(activity: Activity) {
    await signUpMutation.mutateAsync(activity.id)
    setConfirmed(activity)
  }

  if (!activities && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size="lg" color="accent" aria-label="Loading activities" />
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center" role="status">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-success bg-success-soft text-success">
          <Check className="size-8" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold">{citizenName} is signed up</h1>
          <p className="mt-2 text-sm text-muted">
            <strong className="text-foreground">{confirmed.title}</strong>
            <br />
            {formatLongDate(confirmed.start)} at {formatTime(confirmed.start)}
            {confirmed.location && (
              <>
                <br />
                {confirmed.location}
              </>
            )}
          </p>
        </div>
        <p className="max-w-sm text-xs text-muted">
          {citizenName} will get a reminder the day before on their screen. The care team has been notified, and
          the appointment is now in the calendar.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onPress={() => navigate({ to: '/relative/$citizenId/calendar', params: { citizenId } })}>
            View in calendar
          </Button>
          <Button variant="primary" onPress={() => setConfirmed(null)}>
            Back to activities
          </Button>
        </div>
      </div>
    )
  }

  if (error && !activities) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>We couldn't load the activities</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const upcoming = activities ?? []

  if (upcoming.length === 0) {
    return (
      <EmptyState className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Users className="size-7" aria-hidden />
        </span>
        <p className="text-base font-bold text-foreground">There are no activities right now</p>
      </EmptyState>
    )
  }

  const mutationError = signUpMutation.error ?? cancelMutation.error

  return (
    <div className="flex flex-col gap-3">
      {mutationError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{mutationError.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <p className="text-xs text-muted">
        {citizenName} can see and change their own sign-ups on their screen. The care team is notified when you sign
        them up.
      </p>

      {upcoming.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          citizenName={citizenName}
          isBusy={
            (signUpMutation.isPending && signUpMutation.variables === activity.id) ||
            (cancelMutation.isPending && cancelMutation.variables === activity.id)
          }
          onSignUp={signUp}
          onCancel={(a) => cancelMutation.mutate(a.id)}
        />
      ))}
    </div>
  )
}

function ActivityCard({
  activity,
  citizenName,
  isBusy,
  onSignUp,
  onCancel,
}: {
  activity: Activity
  citizenName: string
  isBusy: boolean
  onSignUp: (activity: Activity) => void
  onCancel: (activity: Activity) => void
}) {
  const details = [
    formatTimeRange(activity.start, activity.end),
    activity.location,
    activity.meetingPoint && `Meeting point: ${activity.meetingPoint}`,
    !activity.isSignedUp && activity.availableSpots !== undefined && `${activity.availableSpots} spots left`,
  ]
    .filter(Boolean)
    .join(' · ')

  const isFull = !activity.isSignedUp && activity.availableSpots === 0

  return (
    <Card className={`gap-3 ${activity.isSignedUp ? 'border-2 border-success' : ''}`}>
      <Card.Content className="gap-0.5">
        <Card.Title className="text-sm">{activity.title}</Card.Title>
        <Card.Description className="text-xs">{details}</Card.Description>
      </Card.Content>

      {activity.isSignedUp ? (
        <div className="flex items-center justify-between">
          <Chip color="success" variant="soft" size="sm">
            <Check className="size-3.5" aria-hidden />
            <Chip.Label>{citizenName} is signed up</Chip.Label>
          </Chip>
          <Button
            variant="ghost"
            size="sm"
            className="text-accent underline underline-offset-4"
            isPending={isBusy}
            onPress={() => onCancel(activity)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" isPending={isBusy} isDisabled={isFull} onPress={() => onSignUp(activity)}>
          {isFull ? 'No spots left' : `Sign up ${citizenName}`}
        </Button>
      )}
    </Card>
  )
}
