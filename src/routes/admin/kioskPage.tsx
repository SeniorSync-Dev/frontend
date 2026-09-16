import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Card } from '@heroui/react'

export const Route = createFileRoute('/admin/kioskPage')({
  component: KioskPage,
})

type Alarm = {
  id: number
  resident: string
  room: string
  sensor: string
  time: string
  handled: boolean
}

const initialAlarms: Alarm[] = [
  {
    id: 1,
    resident: 'Ingrid Nielsen',
    room: 'Lejlighed 12',
    sensor: 'Faldsensor FS-12',
    time: '14:32',
    handled: false,
  },
  {
    id: 2,
    resident: 'Erik Hansen',
    room: 'Lejlighed 08',
    sensor: 'Faldsensor FS-08',
    time: '14:18',
    handled: false,
  },
]

function KioskPage() {
  const [alarms, setAlarms] = useState(initialAlarms)
  const activeAlarms = alarms.filter((alarm) => !alarm.handled)
  const handledAlarms = alarms.filter((alarm) => alarm.handled)

  function toggleHandled(id: number) {
    setAlarms((currentAlarms) =>
      currentAlarms.map((alarm) => (alarm.id === id ? { ...alarm, handled: !alarm.handled } : alarm)),
    )
  }

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">SeniorSync</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Alarmoversigt</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Systemet er online
          </div>
        </header>

        <section aria-labelledby="active-alarms-heading" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted">{'Kr\u00e6ver handling'}</p>
              <h2 id="active-alarms-heading" className="text-2xl font-semibold">
                Aktive alarmer
              </h2>
            </div>
            <span className="rounded-full bg-red-500 px-4 py-1.5 text-lg font-bold text-white" aria-live="polite">
              {activeAlarms.length}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {activeAlarms.map((alarm) => (
              <Card
                key={alarm.id}
                className="overflow-hidden border border-red-200 bg-red-50 text-foreground shadow-lg shadow-red-100"
              >
                <Card.Content className="flex flex-col gap-6 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-500 text-white" aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 9v4m0 4h.01M10.3 3.5 2.2 18a2 2 0 0 0 1.75 3h16.1A2 2 0 0 0 21.8 18L13.7 3.5a2 2 0 0 0-3.4 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-[0.18em] text-red-700 uppercase">Fald registreret</p>
                        <h3 className="mt-1 text-2xl font-semibold">{alarm.resident}</h3>
                      </div>
                    </div>
                    <time className="rounded-lg bg-white px-3 py-1.5 text-lg font-semibold text-red-800 ring-1 ring-red-100" dateTime={alarm.time}>
                      {alarm.time}
                    </time>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 rounded-xl bg-white/80 p-4 text-sm sm:text-base">
                    <div>
                      <dt className="text-muted">Placering</dt>
                      <dd className="mt-1 font-semibold">{alarm.room}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Sensor</dt>
                      <dd className="mt-1 font-semibold">{alarm.sensor}</dd>
                    </div>
                  </dl>

                  <Button size="lg" variant="primary" className="bg-red-600 font-semibold text-white hover:bg-red-700" onPress={() => toggleHandled(alarm.id)}>
                    {'Mark\u00e9r som h\u00e5ndteret'}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>

        {handledAlarms.length > 0 && (
          <section aria-labelledby="handled-alarms-heading">
            <h2 id="handled-alarms-heading" className="mb-3 text-lg font-semibold text-muted">
              {'H\u00e5ndterede alarmer'}
            </h2>
            <div className="flex flex-col gap-3">
              {handledAlarms.map((alarm) => (
                <Card key={alarm.id} className="border border-border bg-surface text-foreground">
                  <Card.Content className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6">
                    <div>
                      <p className="font-semibold">{alarm.resident}</p>
                      <p className="text-sm text-muted">{`${alarm.room} \u00b7 ${alarm.time}`}</p>
                    </div>
                    <Button variant="secondary" size="sm" onPress={() => toggleHandled(alarm.id)}>
                      {'G\u00f8r aktiv igen'}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
