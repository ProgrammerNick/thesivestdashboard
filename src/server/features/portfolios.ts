import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { portfolio, portfolioHolding, portfolioSnapshot } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const getMyPortfolios = createServerFn({ method: "GET" })
    .handler(async () => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return [];
        }

        const portfolios = await db.query.portfolio.findMany({
            where: eq(portfolio.userId, session.user.id),
            with: {
                holdings: true,
                snapshots: {
                    limit: 1,
                    orderBy: [desc(portfolioSnapshot.date)]
                }
            },
            orderBy: [desc(portfolio.createdAt)],
        });

        return portfolios;
    });

export const getMyResearchPosts = createServerFn({ method: "GET" })
    .handler(async () => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            return [];
        }

        const { getPostsByUserId } = await import("@/server/data-access/posts");
        // Reuse existing data access
        const posts = await getPostsByUserId(session.user.id);
        return posts;
    });
