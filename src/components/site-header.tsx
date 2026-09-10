import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, Button } from '@heroui/react'
import { authClient } from '../lib/auth-client'

export function getInitials(name?: string | null) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-base font-semibold tracking-tight">SeniorSync</span>
        </Link>

        <nav className="flex items-center gap-2">
          {!isPending && session && (
            <>
              <Button variant="ghost" size="sm" onPress={() => navigate({ to: '/auth/profile' })}>
                Min profil
              </Button>
              <Link to="/auth/profile" aria-label="Min profil">
                <Avatar size="sm" color="accent">
                  <Avatar.Fallback>{getInitials(session.user.name)}</Avatar.Fallback>
                </Avatar>
              </Link>
            </>
          )}
          {!isPending && !session && (
            <Button variant="primary" size="sm" onPress={() => navigate({ to: '/auth/signin' })}>
              Log ind
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
