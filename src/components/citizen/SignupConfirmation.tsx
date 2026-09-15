import { Button } from '@heroui/react'
import { Check } from 'lucide-react'
import type { Activity } from '../../lib/citizen/types'
import { formatLongDate, formatTime } from '../../lib/citizen/format'
import { xlButton } from './styles'

interface SignupConfirmationProps {
  activity: Activity
  onBack: () => void
}

export function SignupConfirmation({ activity, onBack }: SignupConfirmationProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center" role="status">
      <span className="flex size-30 items-center justify-center rounded-full border-3 border-success bg-success-soft text-success">
        <Check className="size-15" strokeWidth={2.5} aria-hidden />
      </span>

      <h1 className="text-4xl font-bold">Du er nu tilmeldt</h1>

      <p className="max-w-2xl text-2xl leading-relaxed text-muted">
        <strong className="text-foreground">{activity.title}</strong>
        <br />
        {formatLongDate(activity.start)} kl. {formatTime(activity.start)}
        {activity.location && (
          <>
            <br />
            {activity.location}
          </>
        )}
      </p>

      <Button variant="primary" className={`${xlButton} px-11`} onPress={onBack}>
        Tilbage til forsiden
      </Button>
    </div>
  )
}
