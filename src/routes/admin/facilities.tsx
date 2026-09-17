import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Input } from '@heroui/react'
import { API_BASE_URL } from '../../lib/auth-client'

export const Route = createFileRoute('/admin/facilities')({
  component: RouteComponent,
})

const typeLabels = {
  nursing_home: 'Plejehjem',
  health_center: 'Sundhedscenter',
  activity_center: 'Aktivitetscenter',
  rehab_center: 'Genoptræningscenter',
  homecare_unit: 'Hjemmepleje',
  other: 'Andet',
} as const

type FacilityType = keyof typeof typeLabels

type Facility = { id: string; name: string; type: FacilityType }

function TypeSelect({ value, onChange }: { value: FacilityType; onChange: (type: FacilityType) => void }) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as FacilityType)}
    >
      {Object.entries(typeLabels).map(([type, label]) => (
        <option key={type} value={type}>
          {label}
        </option>
      ))}
    </select>
  )
}

function RouteComponent() {
  const [facilities, setFacilities] = useState<Array<Facility>>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<FacilityType>('other')
  const [street, setStreet] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')

  async function reload() {
    const response = await fetch(`${API_BASE_URL}/api/facilities`, { credentials: 'include' })
    if (!response.ok) {
      setError('Kunne ikke hente faciliteter.')
      return
    }
    setFacilities(await response.json())
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !street || !zipCode || !city) return

    const response = await fetch(`${API_BASE_URL}/api/facilities`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, street, zipCode, city }),
    })
    if (!response.ok) {
      setError('Kunne ikke oprette faciliteten.')
      return
    }

    setName('')
    setType('other')
    setStreet('')
    setZipCode('')
    setCity('')
    await reload()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Faciliteter</h1>

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
          <Card.Title>Faciliteter</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {facilities.length === 0 ? (
            <p className="text-sm text-muted">Ingen faciliteter endnu.</p>
          ) : (
            facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <p className="text-sm font-medium">{facility.name}</p>
                <p className="text-sm text-muted">{typeLabels[facility.type]}</p>
              </div>
            ))
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Opret facilitet</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <Input
              required
              placeholder="Navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[180px] flex-1"
            />
            <TypeSelect value={type} onChange={setType} />
            <Input required placeholder="Adresse" value={street} onChange={(e) => setStreet(e.target.value)} />
            <Input required placeholder="Postnummer" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-32" />
            <Input required placeholder="By" value={city} onChange={(e) => setCity(e.target.value)} />
            <Button type="submit" variant="primary">
              Opret
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}
