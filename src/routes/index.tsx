import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button, Chip } from '@heroui/react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Chip variant="soft" color="accent" size="sm">
          <Chip.Label>Velkommen til SeniorSync</Chip.Label>
        </Chip>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Få dit overblik
        </h1>
        <p className="mt-5 text-lg text-muted">
          Log ind med MitID for at få adgang til dine oplysninger og tjenester.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {!isPending && session ? (
            <Button variant="primary" size="lg" onPress={() => navigate({ to: '/auth/profile' })}>
              Gå til min profil
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              isDisabled={isPending}
              onPress={() => navigate({ to: '/auth/signin' })}
            >
              Log ind med MitID
            </Button>
          )}
        </div>
      </section>

    </div>
  )
}
