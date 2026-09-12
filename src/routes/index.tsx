import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@heroui/react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="flex w-full max-w-sm flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">SeniorSync</h1>
        <p className="mt-3 text-muted">Vælg hvordan du vil logge ind.</p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigate({ to: '/auth/signin', search: { as: 'borger' } })}
          >
            Log ind som borger
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => navigate({ to: '/auth/signin', search: { as: 'paaroerende' } })}
          >
            Log ind som pårørende
          </Button>
        </div>
      </section>
    </div>
  )
}
