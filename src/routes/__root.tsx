import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { pathname } = useLocation()
  const isCitizenArea = pathname.startsWith('/citizen')

  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const yearRange = currentYear > startYear ? `${startYear} - ${currentYear}` : `${startYear}`

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      {!isCitizenArea && (
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          © {yearRange} SeniorSync
        </footer>
      )}
    </div>
  )
}
