import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, EmptyState, Modal, Spinner, useOverlayState } from '@heroui/react'
import { Check, ClipboardCheck, RefreshCw, TriangleAlert } from 'lucide-react'
import {
  sensorEventsQueryOptions,
  useAcknowledgeSensorEvent,
  useResolveSensorEvent,
} from '../../lib/admin/sensorEvent'
import type { SensorEvent, SensorEventSeverity, SensorEventStatus } from '../../models/sensorEvent'

export const Route = createFileRoute('/admin/sensor-events')({ component: SensorEventsPage })

const queryPageSize = 100
const visiblePageSize = 20
const refetchInterval = 30_000
const dateTimeFormatter = new Intl.DateTimeFormat('da-DK', { dateStyle: 'medium', timeStyle: 'short' })

const severityOptions = [
  { value: 'low-priority', label: 'Info og advarsler' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Advarsel' },
  { value: 'critical', label: 'Kritisk' },
  { value: 'emergency', label: 'Akut' },
] as const

const statusOptions = [
  { value: 'open', label: 'Nye og kvitterede' },
  { value: 'new', label: 'Ny' },
  { value: 'acknowledged', label: 'Kvitteret' },
  { value: 'in_progress', label: 'Under behandling' },
  { value: 'resolved', label: 'Løst' },
  { value: 'false_alarm', label: 'Falsk alarm' },
  { value: 'dismissed', label: 'Afvist' },
] as const

type SeverityFilter = (typeof severityOptions)[number]['value']
type StatusFilter = (typeof statusOptions)[number]['value']

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return 'Ikke registreret'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? 'Ikke registreret' : dateTimeFormatter.format(parsedDate)
}

function severityColor(severity: string) {
  if (severity === 'emergency') return 'danger' as const
  if (severity === 'critical' || severity === 'warning') return 'warning' as const
  return 'accent' as const
}

function severityLabel(severity: string) {
  return ({ info: 'Info', warning: 'Advarsel', critical: 'Kritisk', emergency: 'Akut' } as Record<string, string>)[severity] ?? severity
}

function statusLabel(status: string) {
  return ({ new: 'Ny', acknowledged: 'Kvitteret', in_progress: 'Under behandling', resolved: 'Løst', false_alarm: 'Falsk alarm', dismissed: 'Afvist' } as Record<string, string>)[status] ?? status
}

function SensorEventsPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('low-priority')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [page, setPage] = useState(1)
  const [eventToResolve, setEventToResolve] = useState<SensorEvent | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const resolveDialog = useOverlayState()
  const acknowledgeEvent = useAcknowledgeSensorEvent()
  const resolveEvent = useResolveSensorEvent()

  const severities: SensorEventSeverity[] = severityFilter === 'low-priority' ? ['info', 'warning'] : [severityFilter]
  const statuses: SensorEventStatus[] = statusFilter === 'open' ? ['new', 'acknowledged'] : [statusFilter]
  const eventQueries = useQueries({
    queries: severities.flatMap((severity) =>
      statuses.map((status) => sensorEventsQueryOptions({ severity, status, page: 1, pageSize: queryPageSize, refetchInterval })),
    ),
  })

  const events = useMemo(() => {
    const uniqueEvents = new Map<string, SensorEvent>()
    eventQueries.forEach((query) => query.data?.sensorEvents.forEach((event) => uniqueEvents.set(event.id, event)))
    return [...uniqueEvents.values()].sort((first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime())
  }, [eventQueries])
  const totalPages = Math.max(1, Math.ceil(events.length / visiblePageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleEvents = events.slice((currentPage - 1) * visiblePageSize, currentPage * visiblePageSize)
  const isPending = eventQueries.some((query) => query.isPending)
  const isFetching = eventQueries.some((query) => query.isFetching)
  const hasError = eventQueries.some((query) => query.isError)

  function changeFilters(setter: (value: never) => void, value: string) {
    setter(value as never)
    setPage(1)
  }

  function refresh() {
    void Promise.all(eventQueries.map((query) => query.refetch()))
  }

  function openResolveDialog(event: SensorEvent) {
    setEventToResolve(event)
    setResolutionNotes('')
    resolveDialog.open()
  }

  function closeResolveDialog() {
    if (resolveEvent.isPending) return
    resolveDialog.close()
    setEventToResolve(null)
    setResolutionNotes('')
  }

  function submitResolution() {
    if (!eventToResolve || !resolutionNotes.trim()) return
    resolveEvent.mutate(
      { sensorEventId: eventToResolve.id, resolutionNotes: resolutionNotes.trim() },
      { onSuccess: closeResolveDialog },
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">SeniorSync</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Sensorhændelser</h1>
          <p className="mt-2 text-sm text-muted">Gennemgå, kvittér og afslut sensorhændelser.</p>
        </div>
        <Button variant="secondary" isPending={isFetching} onPress={refresh}><RefreshCw className="size-4" aria-hidden />Opdater</Button>
      </header>

      <Card>
        <Card.Content className="flex flex-wrap gap-4 p-4 sm:p-5">
          <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-medium">Alvorlighed
            <select className="rounded-lg border border-border bg-background px-3 py-2 font-normal" value={severityFilter} onChange={(event) => changeFilters(setSeverityFilter, event.target.value)}>
              {severityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-medium">Status
            <select className="rounded-lg border border-border bg-background px-3 py-2 font-normal" value={statusFilter} onChange={(event) => changeFilters(setStatusFilter, event.target.value)}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </Card.Content>
      </Card>

      {hasError && <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Title>Kunne ikke hente alle hændelser</Alert.Title><Alert.Description>Viser de data, der er tilgængelige. Prøv igen om et øjeblik.</Alert.Description></Alert.Content></Alert>}
      {(acknowledgeEvent.isError || resolveEvent.isError) && <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Title>Handlingen kunne ikke gennemføres</Alert.Title><Alert.Description>Prøv igen om et øjeblik.</Alert.Description></Alert.Content></Alert>}

      {isPending ? (
        <div className="flex min-h-72 items-center justify-center gap-3 text-muted"><Spinner size="lg" color="accent" /><span>Henter sensorhændelser...</span></div>
      ) : visibleEvents.length === 0 ? (
        <EmptyState className="rounded-2xl border border-border bg-surface px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success"><Check className="size-6" aria-hidden /></span><p className="mt-3 text-lg font-semibold">Ingen hændelser matcher filtrene</p><p className="mt-1 text-sm text-muted">Prøv at vælge en anden alvorlighed eller status.</p></EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleEvents.map((event) => {
            const isNew = event.status === 'new'
            const isOpen = ['new', 'acknowledged', 'in_progress'].includes(event.status)
            return <Card key={event.id} className="border border-border"><Card.Content className="flex flex-col gap-4 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Chip size="sm" color={severityColor(event.severity)} variant="soft"><Chip.Label>{severityLabel(event.severity)}</Chip.Label></Chip><Chip size="sm" variant="soft"><Chip.Label>{statusLabel(event.status)}</Chip.Label></Chip><span className="text-sm text-muted">{event.eventType || 'Sensorhændelse'}</span></div><h2 className="mt-3 text-lg font-semibold">{event.citizenName || 'Ukendt borger'}</h2><p className="mt-1 text-sm text-muted">{event.deviceSerialNumber || event.deviceType || 'Ukendt enhed'} · {formatDateTime(event.occurredAt)}</p></div><div className="flex flex-wrap gap-2">{isNew && <Button size="sm" variant="secondary" isPending={acknowledgeEvent.isPending && acknowledgeEvent.variables?.sensorEventId === event.id} onPress={() => acknowledgeEvent.mutate({ sensorEventId: event.id })}><ClipboardCheck className="size-4" aria-hidden />Kvittér</Button>}{isOpen && <Button size="sm" variant="primary" onPress={() => openResolveDialog(event)}>Løs hændelse</Button>}</div></div><dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2"><div><dt className="text-muted">Kvitteret</dt><dd className="mt-1 font-medium">{event.acknowledgedAt ? formatDateTime(event.acknowledgedAt) : 'Ikke kvitteret'}</dd></div><div><dt className="text-muted">Løst</dt><dd className="mt-1 font-medium">{event.resolvedAt ? formatDateTime(event.resolvedAt) : 'Ikke løst'}</dd></div>{event.resolutionNotes && <div className="sm:col-span-2"><dt className="text-muted">Løsningsnote</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{event.resolutionNotes}</dd></div>}</dl></Card.Content></Card>
          })}
        </div>
      )}

      {events.length > visiblePageSize && <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted">Side {currentPage} af {totalPages} · {events.length} hændelser</p><div className="flex gap-2"><Button size="sm" variant="secondary" isDisabled={currentPage <= 1} onPress={() => setPage(currentPage - 1)}>Forrige</Button><Button size="sm" variant="secondary" isDisabled={currentPage >= totalPages} onPress={() => setPage(currentPage + 1)}>Næste</Button></div></div>}

      <Modal state={resolveDialog}>
        <Modal.Backdrop isDismissable={!resolveEvent.isPending}>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header><Modal.Heading>Løs hændelse</Modal.Heading><Modal.CloseTrigger onPress={closeResolveDialog} /></Modal.Header>
              <Modal.Body><p className="text-sm text-muted">Beskriv kort, hvordan hændelsen blev håndteret. Noten gemmes på hændelsen.</p><label className="mt-4 flex flex-col gap-1.5 text-sm font-medium">Løsningsnote<textarea className="min-h-28 rounded-lg border border-border bg-background px-3 py-2 font-normal" value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} disabled={resolveEvent.isPending} required /></label></Modal.Body>
              <Modal.Footer><Button variant="secondary" onPress={closeResolveDialog} isDisabled={resolveEvent.isPending}>Annuller</Button><Button variant="primary" onPress={submitResolution} isDisabled={!resolutionNotes.trim()} isPending={resolveEvent.isPending}>Gem og løs</Button></Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  )
}
