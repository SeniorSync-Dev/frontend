import { MessageSquare } from 'lucide-react'
import type { Message } from '../../lib/citizen/types'
import { EmptyListState } from './EmptyListState'
import { MessageCard } from './MessageCard'

interface MessageListProps {
  messages?: Message[]
  onThank?: (message: Message) => void
  onRequestCall?: (message: Message) => void
}

export function MessageList({ messages, onThank, onRequestCall }: MessageListProps) {
  if (!messages?.length) {
    return (
      <EmptyListState
        icon={MessageSquare}
        title="Du har ingen beskeder endnu"
        description="Beskeder fra dit plejehjem og dine pårørende vil blive vist her."
      />
    )
  }

  const newestFirst = [...messages].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())

  return newestFirst.map((message) => (
    <MessageCard key={message.id} message={message} onRead={onThank} onRequestCall={onRequestCall} />
  ))
}
