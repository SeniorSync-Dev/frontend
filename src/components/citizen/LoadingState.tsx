import { Spinner } from '@heroui/react'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Henter dine oplysninger' }: LoadingStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner size="lg" color="accent" aria-label={label} />
    </div>
  )
}
