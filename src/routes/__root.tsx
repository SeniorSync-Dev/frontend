import { Outlet, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const yearRange = currentYear > startYear ? `${startYear} - ${currentYear}` : `${startYear}`

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        © {yearRange} SeniorSync
      </footer>
    </div>
  )
}
