import { createServerFn } from '@tanstack/react-start'

export const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
    const { auth } = await import('../../lib/auth');

    // Using empty headers avoids server-side crashes due to module resolution issues.
    // Client-side auth will handle session state.
    const headers = new Headers();
    const session = await auth.api.getSession({ headers });
    return session;
});
