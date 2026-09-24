import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, Input } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { useActivities, useCreateActivity, useDeleteActivity, useUpdateActivity } from '../../lib/admin/activities'
import { useFacilities } from '../../lib/admin/facilities'
import { useMyServiceProviderCompany } from '../../lib/admin/serviceProviders'
import { serviceProviderCategoryLabels } from '../../models/service-provider'
import { activityTypeLabels } from '../../models/admin-activity'
import type { Activity, ActivityType } from '../../models/admin-activity'

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

function TypeSelect({ value, onChange }: { value: ActivityType; onChange: (type: ActivityType) => void }) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as ActivityType)}
    >
      {Object.entries(activityTypeLabels).map(([type, label]) => (
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
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const { data: myCompany } = useMyServiceProviderCompany()
  const { data: activities = [], isError: activitiesError } = useActivities()
  const { data: facilities = [], isError: facilitiesError } = useFacilities()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const deleteActivity = useDeleteActivity()

  const role = activeMemberRole?.role
  const myCompanyId = myCompany?.company?.id ?? null

  function canManage(activity: Activity) {
    if (role === 'systemAdmin' || role === 'employee') return true
    if (role === 'servicePartner') return activity.providerCompanyId !== null && activity.providerCompanyId === myCompanyId
    return false
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ActivityType>('other')
  const [facilityId, setFacilityId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [locationName, setLocationName] = useState('')

  const error = activitiesError || facilitiesError
    ? 'Kunne ikke hente aktiviteter.'
    : createActivity.isError
      ? 'Kunne ikke oprette aktiviteten.'
      : updateActivity.isError
        ? 'Kunne ikke gemme ændringerne.'
        : deleteActivity.isError
          ? 'Kunne ikke fjerne aktiviteten.'
          : null

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setType('other')
    setFacilityId('')
    setStartsAt('')
    setEndsAt('')
    setCapacity('')
    setLocationName('')
  }

  function startEdit(activity: Activity) {
    setEditingId(activity.id)
    setTitle(activity.title)
    setType(activity.type)
    setFacilityId('')
    setStartsAt(activity.startsAt.slice(0, 16))
    setEndsAt(activity.endsAt.slice(0, 16))
    setCapacity(activity.capacity ? String(activity.capacity) : '')
    setLocationName(activity.locationName ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !startsAt || !endsAt) return

    const input = { title, type, startsAt, endsAt, capacity, locationName, facilityId: facilityId || undefined }

    if (editingId) {
      updateActivity.mutate({ id: editingId, ...input }, { onSuccess: resetForm })
    } else {
      createActivity.mutate(input, { onSuccess: resetForm })
    }
  }

  function removeActivity(id: string) {
    deleteActivity.mutate(id)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold">Aktiviteter</h1>
        {role === 'servicePartner' && (
          <p className="text-sm text-muted">
            {myCompany?.company
              ? `Du repræsenterer ${myCompany.company.name} (${serviceProviderCategoryLabels[myCompany.company.category]})`
              : 'Din konto er ikke tilknyttet en serviceudbyder endnu.'}
          </p>
        )}
      </div>

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
          <Card.Title>{editingId ? 'Rediger aktivitet' : 'Opret aktivitet'}</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex justify-end gap-2">
              {editingId && (
                <Button type="button" variant="secondary" onPress={resetForm}>
                  Annullér
                </Button>
              )}
              <Button type="submit" variant="primary">
                {editingId ? 'Gem ændringer' : 'Opret'}
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
                      <Chip.Label>{activityTypeLabels[activity.type]}</Chip.Label>
                    </Chip>
                    {activity.providerCompanyName && (
                      <Chip variant="soft" color="default" size="sm">
                        <Chip.Label>Arrangeret af: {activity.providerCompanyName}</Chip.Label>
                      </Chip>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {formatRange(activity.startsAt, activity.endsAt)}
                    {activity.locationName ? ` · ${activity.locationName}` : ''}
                    {activity.capacity ? ` · ${activity.capacity} pladser` : ''}
                  </p>
                </div>
                {canManage(activity) && (
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onPress={() => startEdit(activity)}>
                      Rediger
                    </Button>
                    <Button variant="danger-soft" size="sm" onPress={() => removeActivity(activity.id)}>
                      Fjern
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}

