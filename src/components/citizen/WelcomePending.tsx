import { Card } from '@heroui/react'
import { Check, Clock, Phone } from 'lucide-react'
import { firstName } from '../../lib/citizen/format'
import { cardClass } from './styles'

type StepStatus = 'done' | 'active' | 'upcoming'

interface Step {
  number: number
  title: string
  text: string
  status: StepStatus
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Du er oprettet',
    text: 'Dit login virker, og dine oplysninger er gemt.',
    status: 'done',
  },
  {
    number: 2,
    title: 'Vi finder dit plejehjem',
    text: 'Kommunen tilknytter dig et plejehjem dér, hvor du bor.',
    status: 'active',
  },
  {
    number: 3,
    title: 'Så er du i gang',
    text: 'Du kan se dine aftaler, få besøg og skrive med dit plejehjem.',
    status: 'upcoming',
  },
]

interface WelcomePendingProps {
  name: string
}

export function WelcomePending({ name }: WelcomePendingProps) {
  const first = firstName(name)

  return (
    <>
      <div>
        <h1 className="text-4xl font-bold">Velkommen{first ? `, ${first}` : ''}</h1>
        <p className="mt-1 text-2xl text-muted">Du er logget ind. Vi er ved at gøre alt klar til dig.</p>
      </div>

      <Card className={`${cardClass} flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6`}>
        <span className="flex size-21 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
          <Clock className="size-10" aria-hidden />
        </span>
        <Card.Content className="gap-1">
          <Card.Title className="text-3xl leading-tight font-bold">Kommunen tilknytter dig et plejehjem</Card.Title>
          <Card.Description className="text-xl leading-snug">
            Det sker som regel inden for få dage. Du får besked, så snart det er på plads.
          </Card.Description>
        </Card.Content>
      </Card>

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.number} aria-current={step.status === 'active' ? 'step' : undefined}>
            <StepCard step={step} />
          </li>
        ))}
      </ol>

      <Card className="mt-auto flex-col items-start gap-3 rounded-2xl border-none bg-accent-soft px-5 py-4 shadow-none sm:flex-row sm:items-center sm:gap-5 sm:px-6">
        <Phone className="size-7 flex-none text-accent" aria-hidden />
        <Card.Content className="gap-1">
          <p className="text-xl">
            <strong>Har du spørgsmål?</strong> Kontakt din kommune - de hjælper dig videre.
          </p>
          <p className="text-lg text-muted">
            Har du akut brug for hjælp, så brug knappen Tilkald hjælp øverst på siden.
          </p>
        </Card.Content>
      </Card>
    </>
  )
}

function StepCard({ step }: { step: Step }) {
  return (
    <Card className={`${cardClass} h-full gap-2 p-5 ${step.status === 'active' ? 'border-2 border-accent' : ''}`}>
      <Card.Header className="flex-row items-center gap-3">
        <StepMarker number={step.number} status={step.status} />
        <Card.Title className="text-xl font-bold">{step.title}</Card.Title>
      </Card.Header>
      <Card.Content>
        <Card.Description className="text-lg leading-relaxed">{step.text}</Card.Description>
      </Card.Content>
    </Card>
  )
}

function StepMarker({ number, status }: { number: number; status: StepStatus }) {
  if (status === 'done') {
    return (
      <span className="flex size-11 flex-none items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="size-6" strokeWidth={3} aria-hidden />
        <span className="sr-only">Færdig</span>
      </span>
    )
  }

  return (
    <span
      className={`flex size-11 flex-none items-center justify-center rounded-full text-xl font-extrabold ${
        status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-default text-default-foreground'
      }`}
    >
      {number}
    </span>
  )
}
