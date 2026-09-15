import { Button, Card, Chip } from '@heroui/react'
import { Check } from 'lucide-react'
import type { Activity } from '../../lib/citizen/types'
import { formatDayNumber, formatShortWeekday, formatTimeRange } from '../../lib/citizen/format'
import { DateBox } from './DateBox'
import { cardClass, largeButton } from './styles'

interface ActivityCardProps {
  activity: Activity
  onSignUp?: (activity: Activity) => void
  onCancel?: (activity: Activity) => void
  isBusy?: boolean
}

export function ActivityCard({ activity, onSignUp, onCancel, isBusy = false }: ActivityCardProps) {
  const details = [
    `Kl. ${formatTimeRange(activity.start, activity.end)}`,
    activity.location,
    activity.meetingPoint && `Vi mødes ${activity.meetingPoint}`,
    !activity.isSignedUp && activity.availableSpots !== undefined && `${activity.availableSpots} ledige pladser`,
  ]
    .filter(Boolean)
    .join(' · ')

  const isFull = !activity.isSignedUp && activity.availableSpots === 0

  return (
    <Card
      className={`${cardClass} flex-row flex-wrap items-center gap-6 sm:flex-nowrap ${activity.isSignedUp ? 'border-2 border-success' : ''}`}
    >
      <DateBox
        label={formatShortWeekday(activity.start)}
        value={formatDayNumber(activity.start)}
        color={activity.isSignedUp ? 'success' : 'accent'}
      />

      <Card.Content className="min-w-0 gap-1">
        <Card.Title className="text-2xl leading-tight font-bold">{activity.title}</Card.Title>
        <Card.Description className="text-xl leading-snug">{details}</Card.Description>
      </Card.Content>

      {activity.isSignedUp ? (
        <div className="flex flex-none flex-col items-end gap-2">
          <Chip className="h-auto gap-2 rounded-full bg-success px-5 py-2.5 text-lg font-bold text-success-foreground">
            <Check className="size-5" strokeWidth={3} aria-hidden />
            <Chip.Label>Du er tilmeldt</Chip.Label>
          </Chip>
          {onCancel && (
            <Button
              variant="ghost"
              className="h-12 rounded-xl px-4 text-lg font-semibold text-accent underline underline-offset-4"
              isPending={isBusy}
              onPress={() => onCancel(activity)}
            >
              Afmeld dig
            </Button>
          )}
        </div>
      ) : (
        onSignUp && (
          <Button
            variant="primary"
            className={`${largeButton} flex-none px-8`}
            isPending={isBusy}
            isDisabled={isFull}
            onPress={() => onSignUp(activity)}
          >
            {isFull ? 'Ingen ledige pladser' : 'Tilmeld dig'}
          </Button>
        )
      )}
    </Card>
  )
}
