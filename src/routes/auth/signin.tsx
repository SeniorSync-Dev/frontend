import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Button, Card } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { describeAuthError, type AuthError } from '../../lib/auth-errors'

type LoginAs = 'borger' | 'paaroerende'

type SigninSearch = {
  as?: LoginAs
  error?: string
  error_description?: string
}

export const Route = createFileRoute('/auth/signin')({
  component: Signin,
  validateSearch: (search: Record<string, unknown>): SigninSearch => ({
    as: search.as === 'borger' || search.as === 'paaroerende' ? search.as : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
    error_description:
      typeof search.error_description === 'string' ? search.error_description : undefined,
  }),
})

const loginAsLabel: Record<LoginAs, string> = {
  borger: 'borger',
  paaroerende: 'pårørende',
}

type AccountType = 'citizen' | 'relative'

const loginAsAccountType: Record<LoginAs, AccountType> = {
  borger: 'citizen',
  paaroerende: 'relative',
}

function Signin() {
  const navigate = Route.useNavigate()
  const { as: loginAs, error: errorCode, error_description } = Route.useSearch()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(() =>
    describeAuthError(errorCode, error_description),
  )

  useEffect(() => {
    if (!errorCode) return
    setAuthError(describeAuthError(errorCode, error_description))
    navigate({ search: { as: loginAs }, replace: true })
  }, [errorCode, error_description, loginAs, navigate])

  function signInWithMitID() {
    authClient.signIn.social({
      provider: 'mitid',
      callbackURL: `${window.location.origin}${loginAs === 'borger' ? '/citizen' : '/relative'}`,
      errorCallbackURL: `${window.location.origin}/auth/signin`,
      additionalData: {
        accountType: loginAs ? loginAsAccountType[loginAs] : 'relative',
      },
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

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <Card.Header className="items-center text-center">
          <Card.Title className="text-2xl h-8">
            {loginAs ? `Log ind som ${loginAsLabel[loginAs]}` : 'Log ind'}
          </Card.Title>
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
