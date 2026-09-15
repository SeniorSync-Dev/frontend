import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ActivityList, CitizenShell, ErrorState, LoadingState, useCitizen } from '../../components/citizen'
import { cancelActivitySignup, fetchActivities, signUpForActivity } from '../../lib/citizen/api'
import type { Activity } from '../../lib/citizen/types'
import { useAsyncData } from '../../lib/useAsyncData'

export const Route = createFileRoute('/citizen/activities')({ component: Activities })

function Activities() {
  const { careHome } = useCitizen()

  if (!careHome) {
    return <Navigate to="/citizen" replace />
  }

  return (
    <CitizenShell title="Aktiviteter">
      <ActivitiesData />
    </CitizenShell>
  )
}

function ActivitiesData() {
  const { data: activities, isPending, error, refetch } = useAsyncData(fetchActivities)

  if (isPending && !activities) return <LoadingState label="Henter aktiviteter" />
  if (error && !activities) return <ErrorState title="Vi kunne ikke hente aktiviteterne" onRetry={refetch} />

  async function signUp(activity: Activity) {
    await signUpForActivity(activity.id)
    refetch()
  }

  async function cancel(activity: Activity) {
    await cancelActivitySignup(activity.id)
    refetch()
  }

  return <ActivityList activities={activities} onSignUp={signUp} onCancel={cancel} />
}
