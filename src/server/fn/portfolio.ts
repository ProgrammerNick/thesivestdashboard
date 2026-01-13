import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../../db/index";
import { portfolio, portfolioTransaction, portfolioHolding } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

// Helper to get current user
async function getCurrentUser() {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user;
}

// ==================== PORTFOLIOS ====================

export const getPortfolios = createServerFn({ method: "GET" })
    .handler(async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        const portfolios = await db.query.portfolio.findMany({
            where: eq(portfolio.userId, user.id),
            orderBy: [desc(portfolio.updatedAt)],
            with: {
                holdings: true,
            },
        });

        // Calculate totals for each portfolio
        return portfolios.map(p => {
            const totalValue = p.holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
            const totalCost = p.holdings.reduce((sum, h) => sum + (h.shares * h.avgCostBasis), 0);
            const totalGainLoss = totalValue - totalCost;

            return {
                ...p,
                holdingsCount: p.holdings.length,
                totalValue,
                totalCost,
                totalGainLoss,
                totalGainLossPercent: totalCost > 0 ? ((totalGainLoss / totalCost) * 100) : 0,
            };
        });
    });

export const getPortfolio = createServerFn({ method: "GET" })
    .inputValidator(z.string())
    .handler(async ({ data: portfolioId }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        const result = await db.query.portfolio.findFirst({
            where: and(
                eq(portfolio.id, portfolioId),
                eq(portfolio.userId, user.id)
            ),
            with: {
                holdings: true,
                transactions: {
                    orderBy: [desc(portfolioTransaction.date)],
                },
            },
        });

        if (!result) throw new Error("Portfolio not found");
        return result;
    });

export const createPortfolio = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        name: z.string().min(1),
        type: z.enum(["manual", "plaid"]).default("manual"),
    }))
    .handler(async ({ data }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        const [newPortfolio] = await db.insert(portfolio).values({
            userId: user.id,
            name: data.name,
            type: data.type,
        }).returning();

        return newPortfolio;
    });

export const deletePortfolio = createServerFn({ method: "POST" })
    .inputValidator(z.string())
    .handler(async ({ data: portfolioId }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        await db.delete(portfolio).where(
            and(
                eq(portfolio.id, portfolioId),
                eq(portfolio.userId, user.id)
            )
        );

        return { success: true };
    });

// ==================== TRANSACTIONS ====================

export const addTransaction = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        portfolioId: z.string(),
        symbol: z.string().min(1),
        type: z.enum(["buy", "sell"]),
        shares: z.number().positive(),
        pricePerShare: z.number().positive(),
        date: z.string().transform(s => new Date(s)),
        notes: z.string().optional(),
    }))
    .handler(async ({ data }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        // Verify portfolio ownership
        const p = await db.query.portfolio.findFirst({
            where: and(
                eq(portfolio.id, data.portfolioId),
                eq(portfolio.userId, user.id)
            ),
        });
        if (!p) throw new Error("Portfolio not found");

        const totalValue = data.shares * data.pricePerShare;

        // Add the transaction
        const [newTransaction] = await db.insert(portfolioTransaction).values({
            portfolioId: data.portfolioId,
            symbol: data.symbol.toUpperCase(),
            type: data.type,
            shares: data.shares,
            pricePerShare: data.pricePerShare,
            totalValue,
            date: data.date,
            notes: data.notes,
        }).returning();

        // Update holdings
        await recalculateHoldings(data.portfolioId, data.symbol.toUpperCase());

        return newTransaction;
    });

// Recalculate holdings for a specific symbol in a portfolio
async function recalculateHoldings(portfolioId: string, symbol: string) {
    // Get all transactions for this symbol
    const transactions = await db.query.portfolioTransaction.findMany({
        where: and(
            eq(portfolioTransaction.portfolioId, portfolioId),
            eq(portfolioTransaction.symbol, symbol)
        ),
        orderBy: [portfolioTransaction.date],
    });

    // Calculate total shares and average cost basis
    let totalShares = 0;
    let totalCost = 0;

    for (const tx of transactions) {
        if (tx.type === "buy") {
            totalCost += tx.shares * tx.pricePerShare;
            totalShares += tx.shares;
        } else {
            // For sells, reduce shares but keep cost basis proportional
            const sharesSold = Math.min(tx.shares, totalShares);
            if (totalShares > 0) {
                const avgCost = totalCost / totalShares;
                totalCost -= sharesSold * avgCost;
            }
            totalShares -= sharesSold;
        }
    }

    const avgCostBasis = totalShares > 0 ? totalCost / totalShares : 0;

    // Check if holding exists
    const existingHolding = await db.query.portfolioHolding.findFirst({
        where: and(
            eq(portfolioHolding.portfolioId, portfolioId),
            eq(portfolioHolding.symbol, symbol)
        ),
    });

    if (totalShares <= 0) {
        // Remove holding if no shares left
        if (existingHolding) {
            await db.delete(portfolioHolding).where(eq(portfolioHolding.id, existingHolding.id));
        }
    } else if (existingHolding) {
        // Update existing holding
        await db.update(portfolioHolding)
            .set({
                shares: totalShares,
                avgCostBasis,
            })
            .where(eq(portfolioHolding.id, existingHolding.id));
    } else {
        // Create new holding
        await db.insert(portfolioHolding).values({
            portfolioId,
            symbol,
            shares: totalShares,
            avgCostBasis,
        });
    }
}

export const getTransactions = createServerFn({ method: "GET" })
    .inputValidator(z.string())
    .handler(async ({ data: portfolioId }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        // Verify portfolio ownership
        const p = await db.query.portfolio.findFirst({
            where: and(
                eq(portfolio.id, portfolioId),
                eq(portfolio.userId, user.id)
            ),
        });
        if (!p) throw new Error("Portfolio not found");

        return db.query.portfolioTransaction.findMany({
            where: eq(portfolioTransaction.portfolioId, portfolioId),
            orderBy: [desc(portfolioTransaction.date)],
        });
    });

export const togglePortfolioVisibility = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        portfolioId: z.string(),
        isPublic: z.boolean(),
    }))
    .handler(async ({ data }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");

        // Verify portfolio ownership and update
        const [updatedPortfolio] = await db
            .update(portfolio)
            .set({ isPublic: data.isPublic })
            .where(and(
                eq(portfolio.id, data.portfolioId),
                eq(portfolio.userId, user.id)
            ))
            .returning();

        if (!updatedPortfolio) throw new Error("Portfolio not found or unauthorized");

        return updatedPortfolio;
    });
