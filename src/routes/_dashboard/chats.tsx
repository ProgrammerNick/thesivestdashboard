import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/chats')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/chats"!</div>
}
