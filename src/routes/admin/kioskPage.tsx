import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Chip, EmptyState, Spinner } from '@heroui/react'
import { Activity, CircleAlert, Cpu, RefreshCw, TriangleAlert, WifiOff } from 'lucide-react'
import { useSensorEvents } from '../../lib/admin/sensorEvent'
import { useSensors } from '../../lib/admin/sensor'
import type { SensorEvent, SensorEventSeverity } from '../../models/sensorEvent'

export const Route = createFileRoute('/admin/kioskPage')({ component: KioskPage })

const pageSize = 50
const refreshInterval = 30_000
const dateTimeFormatter = new Intl.DateTimeFormat('da-DK', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
})

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return 'Ukendt tidspunkt'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? 'Ukendt tidspunkt' : dateTimeFormatter.format(parsedDate)
}

function severityLabel(severity: SensorEventSeverity) {
  return severity === 'emergency' ? 'Akut' : 'Kritisk'
}

function EventCard({ event }: { event: SensorEvent }) {
  const severity = event.severity as SensorEventSeverity
  const isEmergency = severity === 'emergency'
  const Icon = isEmergency ? CircleAlert : TriangleAlert

  return (
    <Card className={isEmergency ? 'border border-danger-200 bg-danger-50/70 shadow-sm' : 'border border-warning-200 bg-warning-50/70 shadow-sm'}>
      <Card.Content className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className={isEmergency ? 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger text-danger-foreground' : 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning text-warning-foreground'}>
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" color={isEmergency ? 'danger' : 'warning'} variant="soft"><Chip.Label>{severityLabel(severity)}</Chip.Label></Chip>
                <span className="text-sm text-muted">{event.eventType || 'Sensorhændelse'}</span>
              </div>
              <h3 className="mt-2 truncate text-lg font-semibold">{event.citizenName || 'Ukendt borger'}</h3>
            </div>
          </div>
          <time className="shrink-0 text-sm font-medium text-muted" dateTime={String(event.occurredAt)}>{formatDateTime(event.occurredAt)}</time>
        </div>
        <dl className="grid gap-4 border-t border-foreground/10 pt-4 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Enhed</dt><dd className="mt-1 font-medium">{event.deviceSerialNumber || event.deviceType || 'Ukendt enhed'}</dd></div>
          <div><dt className="text-muted">Status</dt><dd className="mt-1 font-medium">{event.status || 'Ny'}</dd></div>
        </dl>
      </Card.Content>
    </Card>
  )
}

function KioskPage() {
  const criticalEvents = useSensorEvents({ severity: 'critical', page: 1, pageSize, refetchInterval: refreshInterval })
  const emergencyEvents = useSensorEvents({ severity: 'emergency', page: 1, pageSize, refetchInterval: refreshInterval })
  const offlineSensors = useSensors({ assignment: 'assigned', status: 'offline', page: 1, pageSize, refetchInterval: refreshInterval })
  const events = [...(emergencyEvents.data?.sensorEvents ?? []), ...(criticalEvents.data?.sensorEvents ?? [])].sort(
    (first, second) => new Date(second.occurredAt).getTime() - new Date(first.occurredAt).getTime(),
  )
  const isPending = criticalEvents.isPending || emergencyEvents.isPending || offlineSensors.isPending
  const hasError = criticalEvents.isError || emergencyEvents.isError || offlineSensors.isError
  const isFetching = criticalEvents.isFetching || emergencyEvents.isFetching || offlineSensors.isFetching

  function refresh() {
    void Promise.all([criticalEvents.refetch(), emergencyEvents.refetch(), offlineSensors.refetch()])
  }

  if (isPending) {
    return <main className="flex min-h-full items-center justify-center bg-background px-5 text-foreground" aria-label="Henter kioskoversigt"><div className="flex items-center gap-3 text-muted"><Spinner size="lg" color="accent" /><span>Henter driftsoversigt...</span></div></main>
  }

  return (
    <main className="min-h-full bg-background px-5 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">SeniorSync</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Driftsoversigt</h1><p className="mt-2 text-sm text-muted">Kritiske hændelser og enheder, der kræver opmærksomhed.</p></div>
          <Button variant="secondary" isPending={isFetching} onPress={refresh}><RefreshCw className="size-4" aria-hidden />Opdater</Button>
        </header>

        {hasError && <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Title>Kunne ikke hente hele oversigten</Alert.Title><Alert.Description>Viser de data, der er tilgængelige. Prøv at opdatere igen om et øjeblik.</Alert.Description></Alert.Content></Alert>}

        <section aria-labelledby="events-heading" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-muted">Kræver opmærksomhed</p><h2 id="events-heading" className="text-2xl font-semibold">Kritiske og akutte hændelser</h2></div><Chip size="lg" color={events.length > 0 ? 'danger' : 'success'} variant="soft"><Chip.Label>{events.length} fundet</Chip.Label></Chip></div>
          {events.length === 0 ? (
            <EmptyState className="rounded-2xl border border-border bg-surface px-6 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success"><Activity className="size-6" aria-hidden /></span><p className="mt-3 text-lg font-semibold">Ingen kritiske eller akutte hændelser</p><p className="mt-1 text-sm text-muted">Der er ingen sensorhændelser med denne alvorlighedsgrad lige nu.</p></EmptyState>
          ) : <div className="grid gap-4 lg:grid-cols-2">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}
        </section>

        <section aria-labelledby="offline-heading" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-muted">Tildelte enheder</p><h2 id="offline-heading" className="text-2xl font-semibold">Enheder offline</h2></div><Chip size="lg" color={offlineSensors.data?.sensors.length ? 'warning' : 'success'} variant="soft"><Chip.Label>{offlineSensors.data?.sensors.length ?? 0} offline</Chip.Label></Chip></div>
          {(offlineSensors.data?.sensors.length ?? 0) === 0 ? (
            <EmptyState className="rounded-2xl border border-border bg-surface px-6 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-success/10 text-success"><Cpu className="size-6" aria-hidden /></span><p className="mt-3 text-lg font-semibold">Alle tildelte enheder er online</p><p className="mt-1 text-sm text-muted">Der er ingen offline sensorer knyttet til borgere.</p></EmptyState>
          ) : (
            <Card className="border border-warning-200 bg-surface shadow-sm"><Card.Content className="divide-y divide-border p-0">{offlineSensors.data?.sensors.map((sensor) => <div key={sensor.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><WifiOff className="size-5" aria-hidden /></span><div className="min-w-0"><p className="truncate font-semibold">{sensor.citizenName || 'Tildelt borger'}</p><p className="mt-0.5 truncate text-sm text-muted">{sensor.serialNumber} · {sensor.type || 'Sensor'}</p></div></div><div className="text-sm text-muted sm:text-right"><p>Sidst set</p><time className="font-medium text-foreground" dateTime={String(sensor.lastSeenAt)}>{formatDateTime(sensor.lastSeenAt)}</time></div></div>)}</Card.Content></Card>
          )}
        </section>
      </div>
    </main>
  )
}
