import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, Input } from '@heroui/react'
import { API_BASE_URL } from '../../lib/auth-client'

export const Route = createFileRoute('/admin/visits')({
  component: RouteComponent,
})

const dateFormatter = new Intl.DateTimeFormat('da-DK', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatRange(scheduledStart: string, scheduledEnd: string | null) {
  const start = new Date(scheduledStart)
  if (Number.isNaN(start.getTime())) return ''
  if (!scheduledEnd) return dateFormatter.format(start)
  const end = new Date(scheduledEnd)
  if (Number.isNaN(end.getTime())) return dateFormatter.format(start)
  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`
}

const statusLabels = {
  planned: 'Planlagt',
  in_progress: 'I gang',
  completed: 'Gennemført',
  cancelled: 'Aflyst',
  missed: 'Udeblevet',
} as const

type VisitStatus = keyof typeof statusLabels

type Visit = {
  id: string
  title: string
  description: string | null
  scheduledStart: string
  scheduledEnd: string | null
  status: VisitStatus
  citizenUserId: string
  citizenName: string
  assignedEmployeeId: string | null
  employeeName: string | null
}

type Citizen = { userId: string; name: string }
type Employee = { id: string; name: string }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  )
}

function RouteComponent() {
  const [visits, setVisits] = useState<Array<Visit>>([])
  const [citizens, setCitizens] = useState<Array<Citizen>>([])
  const [employees, setEmployees] = useState<Array<Employee>>([])
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [citizenUserId, setCitizenUserId] = useState('')
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd] = useState('')

  async function reload() {
    const [visitsResponse, optionsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/visits`, { credentials: 'include' }),
      fetch(`${API_BASE_URL}/api/visits/options`, { credentials: 'include' }),
    ])
    if (!visitsResponse.ok || !optionsResponse.ok) {
      setError('Kunne ikke hente besøg.')
      return
    }
    setVisits(await visitsResponse.json())
    const options = await optionsResponse.json()
    setCitizens(options.citizens)
    setEmployees(options.employees)
  }

  useEffect(() => {
    reload()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!citizenUserId || !scheduledStart) return

    const response = await fetch(`${API_BASE_URL}/api/visits`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizenUserId,
        assignedEmployeeId: assignedEmployeeId || undefined,
        title: title || undefined,
        scheduledStart,
        scheduledEnd: scheduledEnd || undefined,
      }),
    })
    if (!response.ok) {
      setError('Kunne ikke oprette besøget.')
      return
    }

    setTitle('')
    setCitizenUserId('')
    setAssignedEmployeeId('')
    setScheduledStart('')
    setScheduledEnd('')
    await reload()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Besøg</h1>

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
          <Card.Title>Opret besøg</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Titel">
                <Input placeholder="Besøg" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Borger">
                <select
                  required
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={citizenUserId}
                  onChange={(e) => setCitizenUserId(e.target.value)}
                >
                  <option value="" disabled>
                    Vælg borger
                  </option>
                  {citizens.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Medarbejder">
                <select
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                >
                  <option value="">Ikke tildelt</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Starttidspunkt">
                <Input
                  type="datetime-local"
                  required
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                />
              </Field>
              <Field label="Sluttidspunkt">
                <Input
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                />
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
          <Card.Title>Planlagte besøg</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {visits.length === 0 ? (
            <p className="text-sm text-muted">Ingen besøg endnu.</p>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{visit.title}</p>
                    <Chip variant="soft" color="accent" size="sm">
                      <Chip.Label>{statusLabels[visit.status]}</Chip.Label>
                    </Chip>
                  </div>
                  <p className="text-sm text-muted">{formatRange(visit.scheduledStart, visit.scheduledEnd)}</p>
                  <p className="text-sm text-muted">
                    {visit.citizenName} · {visit.employeeName ?? 'Ikke tildelt'}
                  </p>
                </div>
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
