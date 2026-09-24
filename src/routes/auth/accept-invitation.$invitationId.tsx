import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { describeAuthError, type AuthError } from '../../lib/auth-errors'

type AcceptInvitationSearch = {
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/auth/accept-invitation/$invitationId')({
  component: AcceptInvitation,
  validateSearch: (search: Record<string, unknown>): AcceptInvitationSearch => ({
    error: typeof search.error === 'string' ? search.error : undefined,
    error_description:
      typeof search.error_description === 'string' ? search.error_description : undefined,
  }),
})

type Invitation = {
  organizationName: string
  role: string
}

type Status = 'loading' | 'signed-out' | 'ready' | 'accepted' | 'rejected' | 'error'

function destinationForRole(role: string) {
  switch (role) {
    case 'citizen':
      return '/citizen' as const
    case 'employee':
    case 'systemAdmin':
      return '/admin/dashboard' as const
    case 'servicePartner':
      return '/admin/activities' as const
    default:
      return '/auth/profile' as const
  }
}

function AcceptInvitation() {
  const navigate = Route.useNavigate()
  const { invitationId } = Route.useParams()
  const { error: errorCode, error_description } = Route.useSearch()
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(() =>
    describeAuthError(errorCode, error_description),
  )

  useEffect(() => {
    if (!errorCode) return
    setAuthError(describeAuthError(errorCode, error_description))
    navigate({ search: {}, replace: true })
  }, [errorCode, error_description, navigate])

  useEffect(() => {
    if (isSessionPending) return

    if (!session) {
      setStatus('signed-out')
      return
    }
    if (status !== 'loading' && status !== 'signed-out') 
      return

    authClient.organization.getInvitation({ query: { id: invitationId } }).then(({ data, error: getError }) => {
      if (getError || !data) {
        setError(getError?.message ?? 'Invitationen findes ikke, eller er udløbet.')
        setStatus('error')
        return
      }
      setInvitation(data)
      setStatus('ready')
    })
  }, [invitationId, isSessionPending, session, status])

  function signInWithMitId() {
    const invitationUrl = `${window.location.origin}/auth/accept-invitation/${invitationId}`

    authClient.signIn.social({
      provider: 'mitid',
      callbackURL: invitationUrl,
      errorCallbackURL: invitationUrl,
      fetchOptions: {
        onRequest: () => {
          setIsSigningIn(true)
          setAuthError(null)
        },
        onError: (ctx) => {
          setIsSigningIn(false)
          setAuthError({
            status: 'danger',
            title: 'Noget gik galt',
            text: ctx.error.message || 'Login mislykkedes. Prøv venligst igen.',
          })
        },
      },
    })
  }

  async function acceptInvitation() {
    setIsSubmitting(true)
    setError(null)
    const { error: acceptError } = await authClient.organization.acceptInvitation({ invitationId })
    if (acceptError) {
      setIsSubmitting(false)
      setError(acceptError.message ?? 'Kunne ikke acceptere invitationen.')
      setStatus('error')
      return
    }
    setStatus('accepted')
    navigate({ to: destinationForRole(invitation?.role ?? ''), replace: true })
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
          <Card.Content className="flex flex-col gap-4">
            {authError && (
              <Alert status={authError.status}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{authError.title}</Alert.Title>
                  <Alert.Description>{authError.text}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
            <Button variant="primary" fullWidth isPending={isSigningIn} onPress={signInWithMitId}>
              {isSigningIn ? 'Sender dig til MitID…' : authError ? 'Prøv igen med MitID' : 'Log ind med MitID'}
            </Button>
          </Card.Content>
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
            <Card.Description>Invitationen til {invitation?.organizationName} er accepteret.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Button variant="primary" onPress={() => navigate({ to: destinationForRole(invitation?.role ?? '') })}>
              Gå videre
            </Button>
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
