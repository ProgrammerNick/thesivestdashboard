import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/record-trade')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/record-trade"!</div>
}
