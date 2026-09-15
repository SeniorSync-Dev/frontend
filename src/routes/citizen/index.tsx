import { createFileRoute } from '@tanstack/react-router'
import { CitizenShell, TodayHome, useCitizen, WelcomePending } from '../../components/citizen'

export const Route = createFileRoute('/citizen/')({ component: CitizenHome })

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
      <TodayHome name={user.name} />
    </CitizenShell>
  )
}
