import { createFileRoute } from '@tanstack/react-router'
import { getUnderRadarTheses } from '../../server/features/theses'

export const Route = createFileRoute('/api/theses')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const theses = await getUnderRadarTheses()
                return new Response(JSON.stringify(theses), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            },
        },
    },
})
