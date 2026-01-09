import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sanity')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sanity"!</div>
}
