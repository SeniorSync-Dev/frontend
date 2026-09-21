import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, Avatar, Button, Card, EmptyState, Spinner } from '@heroui/react'
import { CalendarDays, ChevronRight, Users } from 'lucide-react'
import { useLinkedCitizens } from '../../lib/relative/api'
import { AddCitizenModal } from '../../lib/relative/AddCitizenModal'
import { formatRelativeDateTime } from '../../lib/format'
import { getInitials } from '../../lib/initials'
import type { LinkedCitizen } from '#/models/relative'

export const Route = createFileRoute('/relative/')({
  component: RelativeHome,
})

function RelativeHome() {
  const { data: citizens, error, refetch } = useLinkedCitizens()

  if (!citizens && !error) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter dine pårørende" />
      </div>
    )
  }

  if (error && !citizens) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Vi kunne ikke hente dine pårørende</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const linked = citizens ?? []

  if (linked.length === 0) {
    return (
      <EmptyState className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Users className="size-8" aria-hidden />
        </span>
        <div>
          <p className="text-xl font-bold text-foreground">Du er endnu ikke tilknyttet nogen borgere</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Du får en invitationskode fra plejecentret eller fra borgeren selv. Med koden kan du se kalender og
            tilmelde til aktiviteter.
          </p>
        </div>
        <AddCitizenModal />
        <p className="text-sm text-muted">Har du ikke en kode? Ring til kommunen på 74 42 00 00.</p>
      </EmptyState>
    )
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <div>
        <h1 className="text-xl font-bold">Mine pårørende</h1>
        <p className="text-sm text-muted">Du er tilknyttet {linked.length} borgere</p>
      </div>

      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description className="text-sm">
            Du ser kun kalender og aktiviteter
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <div className="flex flex-col gap-3">
        {linked.map((citizen) => (
          <CitizenCard key={citizen.citizenUserId} citizen={citizen} />
        ))}
      </div>

      <AddCitizenModal trigger={(open) => <Button variant="outline" onPress={open}>Tilføj borger</Button>} />

      <p className="text-sm text-muted">
        Mangler du adgang til en pårørende? Kontakt plejecentret eller kommunen på 74 42 00 00.
      </p>
    </div>
  )
}

function CitizenCard({ citizen }: { citizen: LinkedCitizen }) {
  if (citizen.status === 'pending') {
    return (
      <Card className="flex-row items-center gap-4">
        <Avatar size="lg">
          <Avatar.Fallback>{getInitials(citizen.name)}</Avatar.Fallback>
        </Avatar>
        <Card.Content className="min-w-0 gap-0.5">
          <Card.Title className="text-base">{citizen.name}</Card.Title>
          <Card.Description className="text-sm">Anmodning afventer godkendelse</Card.Description>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Link to="/relative/$citizenId" params={{ citizenId: citizen.citizenUserId }} className="no-underline">
      <Card className="flex-row items-center gap-4 transition-colors hover:bg-surface-hover">
        <Avatar size="lg" color="accent">
          <Avatar.Fallback>{getInitials(citizen.name)}</Avatar.Fallback>
        </Avatar>
        <Card.Content className="min-w-0 gap-0.5">
          <Card.Title className="text-base">{citizen.name}</Card.Title>
          <Card.Description className="text-sm">
            {citizen.relationshipType}
            {citizen.age !== undefined ? ` · ${citizen.age} år` : ''}
          </Card.Description>
          <Card.Description className="text-sm">{citizen.facilityName}</Card.Description>
          {citizen.nextAppointmentStart && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-accent">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatRelativeDateTime(citizen.nextAppointmentStart)} · {citizen.nextAppointmentTitle}
            </div>
          )}
        </Card.Content>
        <ChevronRight className="size-5 flex-none text-muted" aria-hidden />
      </Card>
    </Link>
  )
}
