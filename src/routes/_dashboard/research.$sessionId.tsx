import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/research/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/research/$sessionId"!</div>
}
