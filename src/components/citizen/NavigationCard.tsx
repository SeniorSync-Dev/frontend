import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cardClass } from './styles'

interface NavigationCardProps {
  to: LinkProps['to']
  icon: LucideIcon
  title: string
  description: string
  color?: 'accent' | 'brand'
}

export function NavigationCard({ to, icon: Icon, title, description, color = 'accent' }: NavigationCardProps) {
  const iconClass = color === 'brand' ? 'bg-(--brand-soft) text-(--brand)' : 'bg-accent-soft text-accent'

  return (
    <Link
      to={to}
      className={`${cardClass} flex items-center gap-5 no-underline transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`}
    >
      <span className={`flex size-15 flex-none items-center justify-center rounded-xl ${iconClass}`}>
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold text-foreground">{title}</span>
        <span className="block text-xl text-muted">{description}</span>
      </span>
      <ChevronRight className="size-6 flex-none text-muted" strokeWidth={2.5} aria-hidden />
    </Link>
  )
}
