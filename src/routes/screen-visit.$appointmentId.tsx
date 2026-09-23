import { useEffect } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Alert, Button, Spinner } from '@heroui/react'
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
  useRealtimeKitMeeting,
} from '@cloudflare/realtimekit-react'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'
import { useJoinScreenVisit } from '../lib/screenVisit/api'

export const Route = createFileRoute('/screen-visit/$appointmentId')({
  component: ScreenVisit,
})

function ScreenVisit() {
  const { appointmentId } = Route.useParams()
  const router = useRouter()
  const { data, error, isPending } = useJoinScreenVisit(appointmentId)

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" color="accent" aria-label="Forbinder til skærmbesøget" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-6 py-12">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Vi kunne ikke åbne skærmbesøget</Alert.Title>
            <Alert.Description className="text-lg">{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" size="lg" className="self-start" onPress={() => router.history.back()}>
          Tilbage
        </Button>
      </div>
    )
  }

  return <MeetingRoom authToken={data.token} />
}

function MeetingRoom({ authToken }: { authToken: string }) {
  const [meeting, initMeeting] = useRealtimeKitClient()

  useEffect(() => {
    initMeeting({ authToken })
  }, [authToken, initMeeting])

  return (
    <RealtimeKitProvider value={meeting}>
      <Meeting />
    </RealtimeKitProvider>
  )
}

function Meeting() {
  const { meeting } = useRealtimeKitMeeting()

  if (!meeting) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" color="accent" aria-label="Klargør skærmbesøget" />
      </div>
    )
  }

  return (
    <div className="h-dvh">
      <RtkMeeting mode="fill" meeting={meeting} showSetupScreen />
    </div>
  )
}
