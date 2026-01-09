import { createFileRoute, redirect } from "@tanstack/react-router";
import { FundResearch } from "@/components/FundResearch";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "../lib/auth";

const checkAuth = createServerFn({ method: "GET" }).handler(async () => {
    const request = getWebRequest();
    const session = await auth.api.getSession({ headers: request!.headers });
    return session;
});

export const Route = createFileRoute("/funds")({
    component: FundResearch,
    loader: async () => {
        const session = await checkAuth();
        if (session) {
            throw redirect({
                to: "/dashboard/funds",
            });
        }
    },
});
