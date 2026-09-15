import { createFileRoute } from '@tanstack/react-router'
import { CitizenShell, ErrorState, LoadingState, TodayHome, useCitizen, WelcomePending } from '../../components/citizen'
import { fetchAppointments } from '../../lib/citizen/api'
import { useAsyncData } from '../../lib/useAsyncData'

export const Route = createFileRoute('/citizen/')({ component: CitizenHome })

/** Home page: waiting screen until the citizen belongs to a care home, then "I dag" */
function CitizenHome() {
  const { user, careHome } = useCitizen()

  if (!careHome) {
    return (
      <CitizenShell>
        <WelcomePending name={user.name} />
      </CitizenShell>
    )
  }

  return (
    <CitizenShell>
      <TodayHomeData name={user.name} />
    </CitizenShell>
  )
}

function TodayHomeData({ name }: { name: string }) {
  const { data: appointments, isPending, error, refetch } = useAsyncData(fetchAppointments)

  if (isPending && !appointments) return <LoadingState />
  if (error && !appointments) return <ErrorState onRetry={refetch} />

  return <TodayHome name={name} appointments={appointments} />
}
