import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { pathname } = useLocation()
  const isArea = pathname.startsWith('/citizen') || pathname.startsWith('/relative')

  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const yearRange = currentYear > startYear ? `${startYear} - ${currentYear}` : `${startYear}`

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      {!isArea && (
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          © {yearRange} SeniorSync
        </footer>
      )}
    </div>
  )
}
