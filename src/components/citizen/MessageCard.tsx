import { Avatar, Button, Card, Chip } from '@heroui/react'
import { Check, Phone } from 'lucide-react'
import type { Message } from '../../lib/citizen/types'
import { formatRelativeDateTime } from '../../lib/citizen/format'
import { getInitials } from '../../lib/initials'
import { cardClass, largeButton } from './styles'

interface MessageCardProps {
  message: Message
  onRead?: (message: Message) => void
  onRequestCall?: (message: Message) => void
}

export function MessageCard({ message, onRead, onRequestCall }: MessageCardProps) {
  const isNew = !message.isRead
  const avatarClass =
    message.senderType === 'care_home' ? 'bg-(--brand-soft) text-(--brand)' : 'bg-default text-default-foreground'

  return (
    <Card className={`${cardClass} gap-4 px-7 py-6 ${isNew ? 'border-2 border-accent' : ''}`}>
      <Card.Header className="flex-row items-center gap-4">
        <Avatar className="size-14 flex-none">
          <Avatar.Fallback className={`text-lg font-bold ${avatarClass}`}>
            {getInitials(message.senderName)}
          </Avatar.Fallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Card.Title className="text-2xl leading-tight font-bold">
            {message.senderName}
            {message.senderRelation && (
              <span className="font-medium text-muted"> · {message.senderRelation}</span>
            )}
          </Card.Title>
          <Card.Description className="text-xl">{formatRelativeDateTime(message.sentAt)}</Card.Description>
        </div>

        {isNew ? (
          <Chip className="h-auto flex-none rounded-full bg-accent px-4 py-1.5 text-lg font-bold text-accent-foreground">
            <Chip.Label>Ny</Chip.Label>
          </Chip>
        ) : (
          <Chip className="h-auto flex-none gap-2 rounded-full bg-default px-4 py-1.5 text-lg font-semibold text-default-foreground">
            <Check className="size-4" strokeWidth={2.5} aria-hidden />
            <Chip.Label>Læst</Chip.Label>
          </Chip>
        )}
      </Card.Header>

      <Card.Content>
        <p className="text-2xl leading-relaxed">{message.text}</p>
      </Card.Content>

      {isNew && (onRead || onRequestCall) && (
        <Card.Footer className="flex-wrap gap-4">
          {onRead && (
            <Button variant="primary" className={`${largeButton} flex-1`} onPress={() => onRead(message)}>
              <Check className="size-5" strokeWidth={3} aria-hidden />
              Læst
            </Button>
          )}
          {onRequestCall && (
            <Button
              variant="outline"
              className={`${largeButton} flex-1 border-2 border-accent text-accent`}
              onPress={() => onRequestCall(message)}
            >
              <Phone className="size-5" aria-hidden />
              Ring til mig
            </Button>
          )}
        </Card.Footer>
      )}
    </Card>
  )
}
