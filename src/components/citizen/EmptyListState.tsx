import type { ReactNode } from 'react'
import { EmptyState } from '@heroui/react'
import type { LucideIcon } from 'lucide-react'
import { cardClass } from './styles'

interface EmptyListStateProps {
  icon: LucideIcon
  title: string
  description?: string
  children?: ReactNode
}

export function EmptyListState({ icon: Icon, title, description, children }: EmptyListStateProps) {
  return (
    <EmptyState className={`${cardClass} flex flex-col items-center gap-4 px-8 py-12 text-center`}>
      <span className="flex size-21 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="size-10" aria-hidden />
      </span>
      <p className="text-3xl font-bold text-foreground">{title}</p>
      {description && <p className="max-w-xl text-xl leading-relaxed text-muted">{description}</p>}
      {children}
    </EmptyState>
  )
}
