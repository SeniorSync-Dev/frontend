import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/activities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/activities"!</div>
}
