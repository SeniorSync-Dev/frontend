import { authClient } from '../../lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Card } from '@heroui/react'

export const Route = createFileRoute('/auth/unauthorized')({
  component: RouteComponent,
})

async function RouteComponent() {
  const navigate = Route.useNavigate()

  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const userRole = activeMemberRole?.role ?? null
      
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <Card.Header className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-danger/10 text-xl font-semibold text-danger">
            !
          </div>
          <Card.Title className="text-2xl">Adgang nægtet</Card.Title>
          <Card.Description>
            Din konto har ikke tilladelse til at se denne side.
          </Card.Description>
        </Card.Header>
        <Card.Content className="text-center text-sm text-muted">
          Kontakt din administrator, hvis du mener, at du skal have adgang.
        </Card.Content>
        <Card.Footer className="justify-center">
          {userRole === 'employee' || userRole === 'systemAdmin' ? (
            <Button variant="primary" onPress={() => navigate({ to: '/admin/dashboard' })}>
              Gå til dashboard
            </Button>
          ) : (
            <Button variant="primary" onPress={() => navigate({ to: '/admin/activities' })}>
              Gå til forsiden
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  )
}
