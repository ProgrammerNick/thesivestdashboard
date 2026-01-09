import { auth } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
    server: {
        // This handlers block replaces the need for createServerFileRoute
        handlers: {
            GET: async ({ request }) => {
                return auth.handler(request)
            },
            POST: async ({ request }) => {
                return auth.handler(request)
            },
        },
    },
})