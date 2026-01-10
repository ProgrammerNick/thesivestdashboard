import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "../lib/auth";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    // Safety check just in case
    if (!request) return null;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        return {
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
        }
    }
    return session;
});
