import { Alert, Button } from '@heroui/react'
import { largeButton } from './styles'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry: () => void
}

export function ErrorState({
  title = 'Vi kunne ikke hente dine oplysninger',
  description = 'Prøv igen om et øjeblik.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 py-8">
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title className="text-xl">{title}</Alert.Title>
          <Alert.Description className="text-lg">{description}</Alert.Description>
        </Alert.Content>
      </Alert>
      <Button variant="primary" className={`${largeButton} self-start`} onPress={onRetry}>
        Prøv igen
      </Button>
    </div>
  )
}
