import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { Cpu, RefreshCw } from 'lucide-react'
import { useAssignSensor, useSensors, useUnassignSensor } from '../../lib/admin/sensor'
import { useVisitOptions } from '../../lib/admin/visits'
import type { SensorAssignment } from '../../models/sensor'

export const Route = createFileRoute('/admin/sensors')({
  component: RouteComponent,
})

const pageSize = 25

function RouteComponent() {
  const [assignment, setAssignment] = useState<SensorAssignment | undefined>()
  const [page, setPage] = useState(1)
  const [selectedCitizenIds, setSelectedCitizenIds] = useState<Record<string, string>>({})
  const { data, isPending, isError, refetch, isFetching } = useSensors({ assignment, page, pageSize })
  const { data: visitOptions } = useVisitOptions()
  const assignSensor = useAssignSensor()
  const unassignSensor = useUnassignSensor()
  const citizens = visitOptions?.citizens ?? []

  function changeAssignment(value: SensorAssignment | undefined) {
    setAssignment(value)
    setPage(1)
  }

  function assign(sensorId: string) {
    const userId = selectedCitizenIds[sensorId]
    if (!userId) return
    assignSensor.mutate({ sensorId, citizenUserId: userId })
  }

  if (isPending) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spinner size="lg" color="accent" aria-label="Henter sensorer" />
      </div>
    )
  }

  if (isError && !data) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-12 sm:px-6">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Kunne ikke hente sensorer</Alert.Title>
            <Alert.Description>Prøv igen om et øjeblik.</Alert.Description>
          </Alert.Content>
        </Alert>
        <Button variant="primary" className="self-start" onPress={() => refetch()}>
          Prøv igen
        </Button>
      </div>
    )
  }

  const sensors = data?.sensors ?? []
  const pagination = data?.pagination

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sensorer</h1>
          <p className="mt-1 text-sm text-muted">
            {pagination ? `${pagination.totalItems} sensorer i alt` : 'Oversigt over organisationens sensorer'}
          </p>
        </div>
        <Button variant="secondary" isPending={isFetching} onPress={() => refetch()}>
          <RefreshCw className="size-4" aria-hidden />
          Opdater
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filtrer efter tildeling">
        <Button variant={assignment === undefined ? 'primary' : 'secondary'} size="sm" onPress={() => changeAssignment(undefined)}>
          Alle
        </Button>
        <Button variant={assignment === 'assigned' ? 'primary' : 'secondary'} size="sm" onPress={() => changeAssignment('assigned')}>
          Tildelte
        </Button>
        <Button variant={assignment === 'unassigned' ? 'primary' : 'secondary'} size="sm" onPress={() => changeAssignment('unassigned')}>
          Ikke tildelte
        </Button>
      </div>

      {isError && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Viser muligvis ikke de nyeste data</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      {(assignSensor.isError || unassignSensor.isError) && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Sensorens tildeling kunne ikke ændres</Alert.Title>
            <Alert.Description>Prøv igen om et øjeblik.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {sensors.length === 0 ? (
        <EmptyState className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Cpu className="size-7" aria-hidden />
          </span>
          <p className="text-lg font-semibold">Ingen sensorer fundet</p>
          <p className="text-sm text-muted">Der er ingen sensorer, som matcher det valgte filter.</p>
        </EmptyState>
      ) : (
        <Card>
          <Card.Content className="divide-y divide-border p-0">
            {sensors.map((sensor) => (
              <div key={sensor.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{sensor.serialNumber}</p>
                    <Chip size="sm" variant="soft" color={sensor.citizenUserId ? 'success' : 'default'}>
                      <Chip.Label>{sensor.citizenUserId ? 'Tildelt' : 'Ikke tildelt'}</Chip.Label>
                    </Chip>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{sensor.status}</Chip.Label>
                    </Chip>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {[sensor.manufacturer, sensor.model, sensor.type, sensor.locationDescription].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {sensor.citizenUserId ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted">{sensor.citizenName || 'Tildelt borger'}</p>
                    <Button
                      variant="danger-soft"
                      size="sm"
                      isPending={unassignSensor.isPending && unassignSensor.variables.sensorId === sensor.id}
                      onPress={() => unassignSensor.mutate({ sensorId: sensor.id })}
                    >
                      Fjern tildeling
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Vælg borger til sensor ${sensor.serialNumber}`}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                      value={selectedCitizenIds[sensor.id] ?? ''}
                      onChange={(event) =>
                        setSelectedCitizenIds((current) => ({ ...current, [sensor.id]: event.target.value }))
                      }
                    >
                      <option value="">Vælg borger</option>
                      {citizens.map((citizen) => (
                        <option key={citizen.userId} value={citizen.userId}>
                          {citizen.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      size="sm"
                      isDisabled={!selectedCitizenIds[sensor.id]}
                      isPending={assignSensor.isPending && assignSensor.variables.sensorId === sensor.id}
                      onPress={() => assign(sensor.id)}
                    >
                      Tildel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card.Content>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Side {pagination.page} af {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" isDisabled={pagination.page <= 1} onPress={() => setPage(pagination.page - 1)}>
              Forrige
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isDisabled={pagination.page >= pagination.totalPages}
              onPress={() => setPage(pagination.page + 1)}
            >
              Næste
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
