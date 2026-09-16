import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { authClient } from '../../lib/auth-client'

export const Route = createFileRoute('/auth/accept-invitation/$invitationId')({
  component: AcceptInvitation,
})

type Invitation = {
  organizationName: string
  role: string
}

type Status = 'loading' | 'signed-out' | 'ready' | 'accepted' | 'rejected' | 'error'

function AcceptInvitation() {
  const { invitationId } = Route.useParams()
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isSessionPending) return

    if (!session) {
      setStatus('signed-out')
      return
    }

    authClient.organization.getInvitation({ query: { id: invitationId } }).then(({ data, error: getError }) => {
      if (getError || !data) {
        setError(getError?.message ?? 'Invitationen findes ikke, eller er udløbet.')
        setStatus('error')
        return
      }
      setInvitation(data)
      setStatus('ready')
    })
  }, [invitationId, isSessionPending, session])

  function signInWithMitId() {
    authClient.signIn.social({
      provider: 'mitid',
      callbackURL: window.location.href,
      errorCallbackURL: window.location.href,
    })
  }

  async function acceptInvitation() {
    setIsSubmitting(true)
    setError(null)
    const { error: acceptError } = await authClient.organization.acceptInvitation({ invitationId })
    setIsSubmitting(false)
    if (acceptError) {
      setError(acceptError.message ?? 'Kunne ikke acceptere invitationen.')
      setStatus('error')
      return
    }
    setStatus('accepted')
  }

  async function rejectInvitation() {
    setIsSubmitting(true)
    setError(null)
    const { error: rejectError } = await authClient.organization.rejectInvitation({ invitationId })
    setIsSubmitting(false)
    if (rejectError) {
      setError(rejectError.message ?? 'Kunne ikke afvise invitationen.')
      setStatus('error')
      return
    }
    setStatus('rejected')
  }

  if (isSessionPending || status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter invitation…" />
      </div>
    )
  }

  if (status === 'signed-out') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Log ind for at se invitationen</Card.Title>
            <Card.Description>
              Du skal være logget ind med den e-mail, invitationen er sendt til.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="flex-col gap-2">
            <Button variant="primary" fullWidth onPress={signInWithMitId}>
              Log ind med MitID
            </Button>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Kunne ikke åbne invitationen</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Link to="/" className="text-sm underline-offset-4 hover:underline">
            Tilbage til forsiden
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Du er nu medlem</Card.Title>
            <Card.Description>Invitationen er accepteret.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Link to="/auth/profile">
              <Button variant="primary">Gå til din profil</Button>
            </Link>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Invitation afvist</Card.Title>
            <Card.Description>Du har afvist invitationen.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Link to="/" className="text-sm underline-offset-4 hover:underline">
              Tilbage til forsiden
            </Link>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <Card.Header className="items-center text-center">
          <Card.Title>Invitation til {invitation?.organizationName}</Card.Title>
          <Card.Description>Vil du acceptere invitationen?</Card.Description>
        </Card.Header>
        <Card.Footer className="flex-col gap-2">
          <Button variant="primary" fullWidth isPending={isSubmitting} onPress={acceptInvitation}>
            Acceptér invitation
          </Button>
          <Button variant="ghost" fullWidth isPending={isSubmitting} onPress={rejectInvitation}>
            Afvis invitation
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
