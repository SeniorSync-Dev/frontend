import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert } from '@heroui/react'
import { Users } from 'lucide-react'
import type { Activity } from '../../lib/citizen/types'
import { upcomingActivities } from '../../lib/citizen/appointments'
import { ActivityCard } from './ActivityCard'
import { EmptyListState } from './EmptyListState'
import { SignupConfirmation } from './SignupConfirmation'

interface ActivityListProps {
  activities?: Activity[]
  onSignUp?: (activity: Activity) => Promise<void>
  onCancel?: (activity: Activity) => Promise<void>
}

export function ActivityList({ activities, onSignUp, onCancel }: ActivityListProps) {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState<Activity | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function run(activity: Activity, action: (activity: Activity) => Promise<void>, onSuccess?: () => void) {
    setBusyId(activity.id)
    setError(null)
    try {
      await action(activity)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Noget gik galt. Prøv venligst igen.')
    } finally {
      setBusyId(null)
    }
  }

  if (confirmed) {
    return <SignupConfirmation activity={confirmed} onBack={() => navigate({ to: '/citizen' })} />
  }

  const upcoming = activities && upcomingActivities(activities)

  if (!upcoming?.length) {
    return (
      <EmptyListState
        icon={Users}
        title="Der er ingen aktiviteter lige nu"
        description="Når dit plejehjem opretter aktiviteter, kan du se og tilmelde dig dem her."
      />
    )
  }

  return (
    <>
      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Det lykkedes ikke</Alert.Title>
            <Alert.Description className="text-lg">{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <p className="text-2xl text-muted">Her er de næste aktiviteter, du kan være med til:</p>

      {upcoming.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isBusy={busyId === activity.id}
          onSignUp={onSignUp && ((selected) => run(selected, onSignUp, () => setConfirmed(selected)))}
          onCancel={onCancel && ((selected) => run(selected, onCancel))}
        />
      ))}
    </>
  )
}
