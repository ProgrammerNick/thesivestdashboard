import { auth } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
    server: {
        // This handlers block replaces the need for createServerFileRoute
        handlers: {
            GET: async ({ request }) => {
                const url = new URL(request.url);
                if (url.pathname.endsWith("/get-session") || url.searchParams.get("query")?.includes("get-session")) {
                    return new Response(JSON.stringify({
                        user: {
                            id: "dev-user-id",
                            email: "dev@thesivest.com",
                            emailVerified: true,
                            name: "Dev User",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            image: "https://ui-avatars.com/api/?name=Dev+User",
                            displayName: "Dev User"
                        },
                        session: {
                            id: "dev-session-id",
                            userId: "dev-user-id",
                            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                            token: "dev-token",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            ipAddress: "127.0.0.1",
                            userAgent: "Dev Agent"
                        }
                    }), {
                        headers: { "Content-Type": "application/json" }
                    });
                }
                return auth.handler(request)
            },
            POST: async ({ request }) => {
                return auth.handler(request)
            },
        },
    },
})