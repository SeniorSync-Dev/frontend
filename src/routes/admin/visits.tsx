import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, Input } from '@heroui/react'
import { useAssignVisit, useCreateVisit, useVisitOptions, useVisits } from '../../lib/admin/visits'
import { visitStatusLabels } from '../../models/visit'

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  )
}

function RouteComponent() {
  const { data: visits = [], isError: visitsError } = useVisits()
  const { data: options, isError: optionsError } = useVisitOptions()
  const citizens = options?.citizens ?? []
  const employees = options?.employees ?? []
  const createVisit = useCreateVisit()
  const assignVisit = useAssignVisit()

  const [title, setTitle] = useState('')
  const [citizenUserId, setCitizenUserId] = useState('')
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('')
  const [scheduledStart, setScheduledStart] = useState('')
  const [scheduledEnd, setScheduledEnd] = useState('')

  const error =
    visitsError || optionsError
      ? 'Kunne ikke hente besøg.'
      : createVisit.isError
        ? 'Kunne ikke oprette besøget.'
        : assignVisit.isError
          ? 'Kunne ikke tildele besøget.'
          : null

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!citizenUserId || !scheduledStart) return

    createVisit.mutate(
      {
        citizenUserId,
        assignedEmployeeId: assignedEmployeeId || undefined,
        title: title || undefined,
        scheduledStart,
        scheduledEnd: scheduledEnd || undefined,
      },
      {
        onSuccess: () => {
          setTitle('')
          setCitizenUserId('')
          setAssignedEmployeeId('')
          setScheduledStart('')
          setScheduledEnd('')
        },
      },
    )
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
                      <Chip.Label>{visitStatusLabels[visit.status]}</Chip.Label>
                    </Chip>
                  </div>
                  <p className="text-sm text-muted">{formatRange(visit.scheduledStart, visit.scheduledEnd)}</p>
                  <p className="text-sm text-muted">
                    {visit.citizenName} · {visit.employeeName ?? 'Ikke tildelt'}
                  </p>
                </div>
                {!visit.assignedEmployeeId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    isPending={assignVisit.isPending && assignVisit.variables === visit.id}
                    onPress={() => assignVisit.mutate(visit.id)}
                  >
                    Tildel mig
                  </Button>
                )}
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
