import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, AlertDialog, Button, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { Check, Users } from 'lucide-react'
import {
  useCancelCitizenActivitySignup,
  useCitizenActivities,
  useLinkedCitizens,
  useSignUpCitizenForActivity,
} from '../../../lib/relative/api'
import { formatLongDate, formatTime, formatTimeRange } from '../../../lib/format'
import { ListPagination, pageCountOf, pageSlice } from '../../../lib/ListPagination'
import type { Activity } from '#/models/activity'

type FilterTab = 'week' | 'all' | 'signedUp'

export const Route = createFileRoute('/relative/$citizenId/activities')({
  component: CitizenActivities,
  validateSearch: (search: Record<string, unknown>): { filter?: FilterTab } => ({
    filter: search.filter === 'week' || search.filter === 'signedUp' ? search.filter : undefined,
  }),
})

function CitizenActivities() {
  const { citizenId } = Route.useParams()
  const { filter = 'all' } = Route.useSearch()
  const navigate = useNavigate()

  const { data: citizens } = useLinkedCitizens()
  const citizenName = citizens?.find((c) => c.citizenUserId === citizenId)?.name ?? 'borgeren'

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
        <Spinner size="lg" color="accent" aria-label="Henter aktiviteter" />
      </div>
    )
  }

  if (error && !activities) {
    return (
      <div className="flex flex-col gap-4">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Vi kunne ikke hente aktiviteterne</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const upcoming = activities ?? []
  const mutationError = signUpMutation.error ?? cancelMutation.error

  return (
    <div className="flex flex-col gap-3">
      <SignUpConfirmedDialog
        activity={confirmed}
        citizenName={citizenName}
        onClose={() => setConfirmed(null)}
        onViewCalendar={() => {
          setConfirmed(null)
          navigate({ to: '/relative/$citizenId/calendar', params: { citizenId } })
        }}
      />

      {mutationError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{mutationError.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {upcoming.length === 0 ? (
        <EmptyState className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Users className="size-7" aria-hidden />
          </span>
          <p className="text-base font-bold text-foreground">Der er ingen aktiviteter lige nu</p>
        </EmptyState>
      ) : (
        <>
          <p className="text-xs text-muted">
            {citizenName} kan selv se og ændre sine tilmeldinger på sin skærm. Plejeteamet får besked, når du
            tilmelder.
          </p>

          <ActivityList
            activities={upcoming}
            filter={filter}
            citizenName={citizenName}
            isBusy={(id) =>
              (signUpMutation.isPending && signUpMutation.variables === id) ||
              (cancelMutation.isPending && cancelMutation.variables === id)
            }
            onSignUp={signUp}
            onCancel={(a) => cancelMutation.mutate(a.id)}
          />
        </>
      )}
    </div>
  )
}

function SignUpConfirmedDialog({
  activity,
  citizenName,
  onClose,
  onViewCalendar,
}: {
  activity: Activity | null
  citizenName: string
  onClose: () => void
  onViewCalendar: () => void
}) {
  return (
    <AlertDialog isOpen={activity !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <span className="hidden" />

      <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-4">
            <AlertDialog.Header className="items-center text-center">
              <AlertDialog.Icon status="success">
                <Check className="size-6" aria-hidden />
              </AlertDialog.Icon>
              <AlertDialog.Heading className="text-xl font-bold">{citizenName} er tilmeldt</AlertDialog.Heading>
            </AlertDialog.Header>

            {activity && (
              <AlertDialog.Body className="text-center">
                <p className="text-sm text-muted">
                  <strong className="text-foreground">{activity.title}</strong>
                  <br />
                  {formatLongDate(activity.start)} kl. {formatTime(activity.start)}
                  {activity.location && (
                    <>
                      <br />
                      {activity.location}
                    </>
                  )}
                </p>
                <p className="mt-3 text-xs text-muted">
                  {citizenName} får en påmindelse dagen før på sin skærm. Plejeteamet er orienteret, og aftalen ligger
                  nu i kalenderen.
                </p>
              </AlertDialog.Body>
            )}

            <AlertDialog.Footer>
              <Button slot="close" variant="outline">
                Tilbage til aktiviteter
              </Button>
              <Button variant="primary" onPress={onViewCalendar}>
                Se i kalenderen
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

function isWithinCurrentWeek(date: Date) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() + (day === 0 ? -6 : 1 - day))
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return date >= monday && date < nextMonday
}

function ActivityList({
  activities,
  filter,
  citizenName,
  isBusy,
  onSignUp,
  onCancel,
}: {
  activities: Activity[]
  filter: FilterTab
  citizenName: string
  isBusy: (id: string) => boolean
  onSignUp: (activity: Activity) => void
  onCancel: (activity: Activity) => void
}) {
  const [selectedPage, setSelectedPage] = useState(1)

  const filtered = activities.filter((activity) => {
    if (filter === 'week') return isWithinCurrentWeek(activity.start)
    if (filter === 'signedUp') return activity.isSignedUp
    return true
  })

  const page = Math.min(selectedPage, pageCountOf(filtered.length))

  return (
    <div className="flex flex-col gap-3">
      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {filter === 'signedUp' ? `${citizenName} er ikke tilmeldt nogen aktiviteter.` : 'Ingen aktiviteter i denne periode.'}
        </p>
      ) : (
        <>
          {pageSlice(filtered, page).map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              citizenName={citizenName}
              isBusy={isBusy(activity.id)}
              onSignUp={onSignUp}
              onCancel={onCancel}
            />
          ))}

          <ListPagination
            page={page}
            itemCount={filtered.length}
            label="aktiviteter"
            onPageChange={setSelectedPage}
          />
        </>
      )}
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
    activity.meetingPoint && `Mødested: ${activity.meetingPoint}`,
    !activity.isSignedUp && activity.availableSpots !== undefined && `${activity.availableSpots} ledige pladser`,
  ]
    .filter(Boolean)
    .join(' · ')

  const isFull = !activity.isSignedUp && activity.availableSpots === 0

  return (
    <Card className={`flex-row items-center gap-3 ${activity.isSignedUp ? 'border-2 border-success' : ''}`}>
      <Card.Content className="min-w-0 flex-1 gap-0.5">
        {activity.isSignedUp && (
          <Chip color="success" variant="soft" size="sm" className="mb-1 self-start">
            <Check className="size-3.5" aria-hidden />
            <Chip.Label>{citizenName} er tilmeldt</Chip.Label>
          </Chip>
        )}
        <Card.Title className="text-sm">{activity.title}</Card.Title>
        <Card.Description className="text-xs">{details}</Card.Description>
      </Card.Content>

      {activity.isSignedUp ? (
        <Button
          variant="ghost"
          size="sm"
          className="flex-none text-accent underline underline-offset-4"
          isPending={isBusy}
          onPress={() => onCancel(activity)}
        >
          Afmeld
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          className="flex-none"
          isPending={isBusy}
          isDisabled={isFull}
          onPress={() => onSignUp(activity)}
        >
          {isFull ? 'Ingen ledige pladser' : `Tilmeld ${citizenName}`}
        </Button>
      )}
    </Card>
  )
}
