import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { portfolio, portfolioHolding, portfolioSnapshot } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const getMyPortfolios = createServerFn({ method: "GET" })
    .handler(async () => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
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
            orderBy: [desc(portfolio.createdAt)]
        });
        return portfolios;
    });

export const getUserPortfolios = createServerFn({ method: "GET" })
    .inputValidator(z.string())
    .handler(async ({ data: userId }) => {
        const portfolios = await db.query.portfolio.findMany({
            where: eq(portfolio.userId, userId),
            with: {
                holdings: true,
                snapshots: {
                    limit: 1,
                    orderBy: [desc(portfolioSnapshot.date)]
                }
            },
            orderBy: [desc(portfolio.createdAt)]
        });
        return portfolios;
    });

export const createPortfolio = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
    }))
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const [newPortfolio] = await db.insert(portfolio).values({
            userId: session.user.id,
            name: data.name,
            description: data.description,
            isPublic: data.isPublic,
        }).returning();

        return newPortfolio;
    });

export const addHolding = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        portfolioId: z.string(),
        symbol: z.string().min(1).toUpperCase(),
        shares: z.string(), // numeric string
        averageCost: z.string(), // numeric string
    }))
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const [p] = await db.select().from(portfolio).where(eq(portfolio.id, data.portfolioId));
        if (!p || p.userId !== session.user.id) {
            throw new Error("Unauthorized or Portfolio not found");
        }

        const [newHolding] = await db.insert(portfolioHolding).values({
            portfolioId: data.portfolioId,
            symbol: data.symbol,
            shares: data.shares,
            averageCost: data.averageCost
        }).returning();

        return newHolding;
    });

export const deletePortfolio = createServerFn({ method: "POST" })
    .inputValidator(z.object({ id: z.string() }))
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const [p] = await db.select().from(portfolio).where(eq(portfolio.id, data.id));
        if (!p || p.userId !== session.user.id) {
            throw new Error("Unauthorized or Portfolio not found");
        }

        await db.delete(portfolio).where(eq(portfolio.id, data.id));
        return { success: true };
    });
