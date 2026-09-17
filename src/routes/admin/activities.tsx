import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, Input } from '@heroui/react'
import { API_BASE_URL } from '../../lib/auth-client'

export const Route = createFileRoute('/admin/activities')({
  component: RouteComponent,
})

const dateFormatter = new Intl.DateTimeFormat('da-DK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''
  return `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`
}

const typeLabels = {
  outing: 'Udflugt',
  sports: 'Sport',
  social: 'Socialt',
  healthcare: 'Sundhedspleje',
  training: 'Træning',
  other: 'Andet',
} as const

type ActivityType = keyof typeof typeLabels

type Activity = {
  id: string
  title: string
  type: ActivityType
  startsAt: string
  endsAt: string
  capacity: number | null
  locationName: string | null
}

type Facility = {
  id: string
  name: string
}

function TypeSelect({ value, onChange }: { value: ActivityType; onChange: (type: ActivityType) => void }) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as ActivityType)}
    >
      {Object.entries(typeLabels).map(([type, label]) => (
        <option key={type} value={type}>
          {label}
        </option>
      ))}
    </select>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  )
}

function RouteComponent() {
  const [activities, setActivities] = useState<Array<Activity>>([])
  const [facilities, setFacilities] = useState<Array<Facility>>([])
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ActivityType>('other')
  const [facilityId, setFacilityId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [locationName, setLocationName] = useState('')

  async function reload() {
    const [activitiesResponse, facilitiesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/activities`, { credentials: 'include' }),
      fetch(`${API_BASE_URL}/api/facilities`, { credentials: 'include' }),
    ])
    if (!activitiesResponse.ok || !facilitiesResponse.ok) {
      setError('Kunne ikke hente aktiviteter.')
      return
    }
    setActivities(await activitiesResponse.json())
    setFacilities(await facilitiesResponse.json())
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !startsAt || !endsAt) return

    const response = await fetch(`${API_BASE_URL}/api/activities`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, startsAt, endsAt, capacity, locationName, facilityId: facilityId || undefined }),
    })
    if (!response.ok) {
      setError('Kunne ikke oprette aktiviteten.')
      return
    }

    setTitle('')
    setType('other')
    setFacilityId('')
    setStartsAt('')
    setEndsAt('')
    setCapacity('')
    setLocationName('')
    await reload()
  }

  async function removeActivity(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      setError('Kunne ikke fjerne aktiviteten.')
      return
    }
    await reload()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Aktiviteter</h1>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Der opstod en fejl</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Opret aktivitet</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Titel">
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Type">
                <TypeSelect value={type} onChange={setType} />
              </Field>
              <Field label="Facilitet">
                <select
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                >
                  <option value="">Standard</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lokation">
                <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} />
              </Field>
              <Field label="Starttidspunkt">
                <Input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </Field>
              <Field label="Sluttidspunkt">
                <Input type="datetime-local" required value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </Field>
              <Field label="Kapacitet">
                <Input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Opret
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Kommende aktiviteter</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {activities.length === 0 ? (
            <p className="text-sm text-muted">Ingen aktiviteter endnu.</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Chip variant="soft" color="accent" size="sm">
                      <Chip.Label>{typeLabels[activity.type]}</Chip.Label>
                    </Chip>
                  </div>
                  <p className="text-sm text-muted">
                    {formatRange(activity.startsAt, activity.endsAt)}
                    {activity.locationName ? ` · ${activity.locationName}` : ''}
                    {activity.capacity ? ` · ${activity.capacity} pladser` : ''}
                  </p>
                </div>
                <Button variant="danger-soft" size="sm" onPress={() => removeActivity(activity.id)}>
                  Fjern
                </Button>
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
