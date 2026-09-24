import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card, Spinner } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { describeAuthError, type AuthError } from '../../lib/auth-errors'

type SignInSearch = {
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/servicePartner/signin')({
  component: SignIn,
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    error: typeof search.error === 'string' ? search.error : undefined,
    error_description:
      typeof search.error_description === 'string' ? search.error_description : undefined,
  }),
})

function SignIn() {
  const navigate = Route.useNavigate()
  const { error: errorCode, error_description } = Route.useSearch()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: activeMemberRole, isPending: isRolePending } = authClient.useActiveMemberRole()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(() =>
    describeAuthError(errorCode, error_description),
  )

  useEffect(() => {
    if (!errorCode) return
    setAuthError(describeAuthError(errorCode, error_description))
    navigate({ search: {}, replace: true })
  }, [errorCode, error_description, navigate])

  useEffect(() => {
    if (isSessionPending || isRolePending || !session) return
    if (activeMemberRole?.role) {
      navigate({ to: '/admin/activities', replace: true })
    }
  }, [isSessionPending, isRolePending, session, activeMemberRole, navigate])

  function signInWithMitID() {
    const signinUrl = `${window.location.origin}/servicePartner/signin`

    authClient.signIn.social({
      provider: 'mitid',
      callbackURL: signinUrl,
      errorCallbackURL: signinUrl,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true)
          setAuthError(null)
        },
        onError: (ctx) => {
          setIsLoading(false)
          setAuthError({
            status: 'danger',
            title: 'Noget gik galt',
            text: ctx.error.message || 'Login mislykkedes. Prøv venligst igen.',
          })
        },
      },
    })
  }

  if (!isSessionPending && session && (isRolePending || !activeMemberRole?.role)) {
    if (isRolePending) {
      return (
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner size="lg" color="accent" aria-label="Henter…" />
        </div>
      )
    }

    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title className="text-2xl h-8">Du er logget ind</Card.Title>
            <Card.Description>
              Din konto er endnu ikke inviteret af en organisation. Kontakt den facilitet eller
              organisation, du samarbejder med, for at få adgang.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center text-sm text-muted">
            <Link to="/" className="underline-offset-4 hover:underline">
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
          <Card.Title className="text-2xl h-8">Log ind som Servicepartner</Card.Title>
          <Card.Description>Brug dit MitID for at logge sikkert ind.</Card.Description>
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

          <Button
            variant="primary"
            size="lg"
            fullWidth
            isPending={isLoading}
            onPress={signInWithMitID}
          >
            {isLoading
              ? 'Sender dig til MitID…'
              : authError
                ? 'Prøv igen med MitID'
                : 'Log ind med MitID'}
          </Button>
        </Card.Content>

        <Card.Footer className="justify-center text-sm text-muted">
          <Link to="/" className="underline-offset-4 hover:underline">
            Tilbage til forsiden
          </Link>
        </Card.Footer>
      </Card>
    </div>
  )
}