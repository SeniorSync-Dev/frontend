import { useState, type SubmitEvent } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, Avatar, Button, Card, Input, Spinner } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { getInitials } from '../../lib/initials'

export const Route = createFileRoute('/auth/profile')({ component: Profile })

function Profile() {
  const navigate = useNavigate()
  const { data: session, isPending, error, refetch } = authClient.useSession()
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null)
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | null>(null)
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const role = activeMemberRole?.role ?? null

  function signOut() {
    authClient.signOut()
  }

  function goBack() {
    switch (role) {
      case 'employee':
      case 'systemAdmin':
        navigate({ to: '/admin/dashboard' })
        return
      case 'servicePartner':
        navigate({ to: '/admin/activities' })
        return
      case 'relative':
        navigate({ to: '/relative' })
        return
      case 'citizen':
        navigate({ to: '/citizen' })
        return
      default:
        navigate({ to: '/' })
    }
  }

  function changeEmail(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailChangeError(null)
    setEmailChangeSuccess(null)

    authClient.changeEmail({
      newEmail,
      callbackURL: '/auth/profile',
      fetchOptions: {
        onRequest: () => setIsChangingEmail(true),
        onSuccess: async () => {
          await refetch()
          setNewEmail('')
          setEmailChangeSuccess('Din e-mailadresse er blevet opdateret.')
        },
        onError: (ctx) => {
          setEmailChangeError(ctx.error.message || 'E-mailadressen kunne ikke opdateres. Prøv igen.')
        },
        onResponse: () => setIsChangingEmail(false),
      },
    })
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter profil" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Kunne ikke hente din profil</Alert.Title>
            <Alert.Description>Prøv at opdatere siden eller log ind igen.</Alert.Description>
          </Alert.Content>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onPress={() => refetch()}>
            Prøv igen
          </Button>
          <Button variant="primary" onPress={() => navigate({ to: '/' })}>
            Log ind
          </Button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Du er ikke logget ind</Card.Title>
            <Card.Description>Log ind med MitID for at se din profil.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Button variant="primary" onPress={() => navigate({ to: '/' })}>
              Log ind med MitID
            </Button>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  const { user } = session

  const details: Array<{ label: string; value?: string | null }> = [
    { label: 'Navn', value: user.name },
    { label: 'E-mail', value: user.email },
    { label: 'Fødselsdato', value: user.birthdate },
    { label: 'CPR-nummer', value: user.nin },
    { label: 'MitID UUID', value: user.mitidUuid },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <Card>
        <Card.Header className="flex-row items-center gap-4">
          <Avatar size="lg" color="accent">
            <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <Card.Title className="text-xl">{user.name}</Card.Title>
            <Card.Description>{user.email}</Card.Description>
          </div>
        </Card.Header>

        <Card.Content>
          <dl className="divide-y divide-border">
            {details.map((item) => (
              <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-muted">{item.label}</dt>
                <dd className="text-sm break-all sm:col-span-2">{item.value || '-'}</dd>
              </div>
            ))}
            <div key="role" className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-muted">Rolle</dt>
                <dd className="text-sm break-all sm:col-span-2">{role || '—'}</dd>
              </div>
          </dl>

          <form className="mt-8 border-t border-border pt-6" onSubmit={changeEmail}>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Skift e-mailadresse</h2>
              <p className="text-sm text-muted">Indtast den e-mailadresse, du fremover vil bruge.</p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
                Ny e-mailadresse
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="navn@eksempel.dk"
                  autoComplete="email"
                  required
                  fullWidth
                />
              </label>
              <Button type="submit" variant="primary" isPending={isChangingEmail}>
                Skift e-mail
              </Button>
            </div>

            {emailChangeError && (
              <Alert className="mt-4" status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Kunne ikke skifte e-mailadresse</Alert.Title>
                  <Alert.Description>{emailChangeError}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            {emailChangeSuccess && (
              <Alert className="mt-4" status="success">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>E-mailadresse opdateret</Alert.Title>
                  <Alert.Description>{emailChangeSuccess}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </form>
        </Card.Content>

        <Card.Footer className="flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" onPress={goBack}>
              Tilbage Til App
            </Button>
            <Button variant="ghost" onPress={() => refetch()}>
              Opdater
            </Button>
          </div>
          <Button variant="danger-soft" onPress={signOut}>
            Log ud
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
