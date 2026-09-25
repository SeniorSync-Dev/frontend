import { createFileRoute } from '@tanstack/react-router'
import { Alert, Card, Chip, Spinner } from '@heroui/react'
import { Check, X } from 'lucide-react'
import {
  useApproveRelative,
  useGenerateInviteCode,
  useInviteCode,
  useLinkedRelatives,
  useRejectRelative,
} from '../../lib/citizen/api'
import { Button } from '../../lib/citizen/Button'
import type { LinkedRelative } from '#/models/relative'

export const Route = createFileRoute('/citizen/relatives')({
  component: Relatives,
})

function Relatives() {
  const { data: relatives, error } = useLinkedRelatives()
  const approveMutation = useApproveRelative()
  const rejectMutation = useRejectRelative()

  return (
    <div className="flex flex-col gap-5">
      <InviteCodeCard />

      <div>
        <h2 className="text-2xl font-bold">Mine pårørende</h2>
      </div>

      {(approveMutation.error || rejectMutation.error) && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description className="text-lg">
              {(approveMutation.error ?? rejectMutation.error)?.message}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title className="text-xl">Vi kunne ikke hente dine pårørende</Alert.Title>
            <Alert.Description className="text-lg">{error.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {!relatives && !error && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="accent" aria-label="Henter pårørende" />
        </div>
      )}

      {relatives && relatives.length === 0 && (
        <p className="text-xl text-muted">Ingen har anmodet om adgang endnu.</p>
      )}

      {relatives && relatives.length > 0 && (
        <div className="flex flex-col gap-4">
          {relatives.map((relative) => (
            <RelativeCard
              key={relative.relativeUserId}
              relative={relative}
              isBusy={
                (approveMutation.isPending && approveMutation.variables === relative.relativeUserId) ||
                (rejectMutation.isPending && rejectMutation.variables === relative.relativeUserId)
              }
              onApprove={() => approveMutation.mutate(relative.relativeUserId)}
              onReject={() => rejectMutation.mutate(relative.relativeUserId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RelativeCard({
  relative,
  isBusy,
  onApprove,
  onReject,
}: {
  relative: LinkedRelative
  isBusy: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <Card className="flex-row flex-wrap items-center gap-4">
      <Card.Content className="min-w-0 gap-1">
        <Card.Title className="text-xl font-bold">{relative.name}</Card.Title>
        <Card.Description className="text-lg">{relative.relationshipType}</Card.Description>
      </Card.Content>

      {relative.status === 'pending' ? (
        <div className="flex flex-none gap-2">
          <Button variant="primary" size="lg" isPending={isBusy} onPress={onApprove}>
            <Check className="size-5" aria-hidden />
            Godkend
          </Button>
          <Button variant="outline" size="lg" isPending={isBusy} onPress={onReject}>
            <X className="size-5" aria-hidden />
            Afvis
          </Button>
        </div>
      ) : (
        <Chip color="success" variant="soft">
          <Chip.Label>Har adgang</Chip.Label>
        </Chip>
      )}
    </Card>
  )
}

function InviteCodeCard() {
  const { data: inviteCode, isPending } = useInviteCode()
  const generateMutation = useGenerateInviteCode()

  const code = generateMutation.data?.code ?? inviteCode?.code

  return (
    <Card className="gap-4 p-6">
      <Card.Header>
        <Card.Title className="text-xl font-bold">Invitationskode</Card.Title>
        <Card.Description className="text-lg">
          Del denne kode med en pårørende, så de kan anmode om adgang til din kalender og aktiviteter.
        </Card.Description>
      </Card.Header>

      <Card.Content className="items-center text-center">
        {code ? (
          <p className="text-4xl font-extrabold tracking-[0.2em]">{code}</p>
        ) : (
          !isPending && <p className="text-lg text-muted">Du har ingen aktiv kode.</p>
        )}
        {generateMutation.error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description className="text-lg">{generateMutation.error.message}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </Card.Content>

      <Card.Footer>
        <Button variant="primary" size="lg" isPending={generateMutation.isPending} onPress={() => generateMutation.mutate()}>
          {code ? 'Opret ny kode' : 'Opret en kode'}
        </Button>
      </Card.Footer>
    </Card>
  )
}
