import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card } from '@heroui/react'
import { useInviteCodePreview, useRedeemInviteCode } from '../../lib/relative/api'

export const Route = createFileRoute('/relative/add-citizen')({
  component: AddCitizen,
})

const relationshipOptions = ['Daughter / son', 'Spouse', 'Child-in-law', 'Other']

function AddCitizen() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [relationshipType, setRelationshipType] = useState(relationshipOptions[0])

  const preview = useInviteCodePreview(code.length === 6 ? code.toUpperCase() : '')
  const redeemMutation = useRedeemInviteCode()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await redeemMutation.mutateAsync({ code: code.toUpperCase(), relationshipType })
    navigate({ to: '/relative' })
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <h1 className="text-xl font-bold">Add citizen</h1>
      <p className="text-sm text-muted">Enter the invitation code you got from the care home or from the citizen.</p>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Invitation code</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            className="rounded-md border border-border bg-background px-3 py-2 text-center text-2xl font-bold tracking-[0.3em] uppercase"
            placeholder="------"
          />
          <span className="text-xs text-muted">The code is valid for 7 days.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Your relation to the citizen</span>
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {preview.data && (
          <Card>
            <Card.Header>
              <Card.Title className="text-xs font-bold tracking-wide text-muted uppercase">
                The code belongs to
              </Card.Title>
            </Card.Header>
            <Card.Content className="gap-0.5">
              <Card.Title className="text-base">{preview.data.name}</Card.Title>
              <Card.Description className="text-sm">
                {preview.data.age !== undefined ? `${preview.data.age} years · ` : ''}
                {preview.data.facilityName}
              </Card.Description>
            </Card.Content>
          </Card>
        )}

        {code.length === 6 && preview.error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{preview.error.message}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {redeemMutation.error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{redeemMutation.error.message}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <p className="text-sm text-muted">
          {preview.data?.name ?? 'The citizen'} or the care home must approve your request before you get access.
          You'll only see the calendar and activities.
        </p>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isDisabled={code.length !== 6 || !preview.data}
            isPending={redeemMutation.isPending}
          >
            Send request
          </Button>
          <Button variant="outline" onPress={() => navigate({ to: '/relative' })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
