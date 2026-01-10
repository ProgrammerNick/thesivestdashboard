import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { post, tradePerformance } from "@/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    type: z.enum(["trade", "thought", "update", "close_trade", "market_outlook", "quarterly_letter"]),
    symbol: z.string().optional(),
    buyPrice: z.number().optional(),
    targetPrice: z.number().optional(),
    stopLoss: z.number().optional(),
    entryThoughts: z.string().optional(),
    exitThoughts: z.string().optional(),
    referencePostId: z.string().optional(),
    closePrice: z.number().optional(),
});

export const createPost = createServerFn({ method: "POST" })
    .inputValidator(createPostSchema)
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user) {
            throw new Error("Unauthorized");
        }

        const [newPost] = await db
            .insert(post)
            .values({
                userId: session.user.id,
                title: data.title,
                content: data.content,
                type: data.type,
                symbol: data.symbol,
                buyPrice: data.buyPrice?.toString(),
                targetPrice: data.targetPrice?.toString(),
                stopLoss: data.stopLoss?.toString(),
                entryThoughts: data.entryThoughts,
                exitThoughts: data.exitThoughts,
                buyDate: data.type === "trade" ? new Date() : undefined,
                sellDate: data.type === "close_trade" ? new Date() : undefined,
                sellPrice: data.closePrice?.toString(),
            })
            .returning();

        if (data.type === "trade" && data.buyPrice) {
            await db.insert(tradePerformance).values({
                postId: newPost.id,
                userId: session.user.id,
                currentPrice: data.buyPrice.toString(),
                returnPercent: "0",
                status: "active",
            });
        }

        if (data.type === "close_trade" && data.referencePostId) {
            // Mark original trade as closed
            await db.update(tradePerformance)
                .set({ status: "closed", lastUpdated: new Date() }) // Assuming schema has these
                .where(eq(tradePerformance.postId, data.referencePostId));

            // Optionally link the new post to the old one if schema supports it
        }

        return newPost;
    });

export const getUserOpenTrades = createServerFn({ method: "GET" })
    .handler(async () => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) return [];

        // Simple fetch of active trades
        // Join post to get symbol/title
        const results = await db.select({
            id: post.id,
            title: post.title,
            symbol: post.symbol,
            buyPrice: post.buyPrice,
            performanceId: tradePerformance.id
        })
            .from(tradePerformance)
            .innerJoin(post, eq(tradePerformance.postId, post.id))
            .where(and(eq(tradePerformance.userId, session.user.id), eq(tradePerformance.status, "active")));

        return results;
    });

export const getSymbolPosts = createServerFn({ method: "GET" })
    .inputValidator(z.object({ symbol: z.string() }))
    .handler(async ({ data }) => {
        const { getPostsBySymbol } = await import("@/server/data-access/posts");
        return getPostsBySymbol(data.symbol);
    });

export const getFeedPosts = createServerFn({ method: "GET" })
    .handler(async () => {
        const { getAllPosts } = await import("@/server/data-access/posts");
        return getAllPosts();
    });

export const getPost = createServerFn({ method: "GET" })
    .inputValidator(z.object({ id: z.string() }))
    .handler(async ({ data }) => {
        const { getPostById } = await import("@/server/data-access/posts");
        return getPostById(data.id);
    });

export const getPostsByUserId = createServerFn({ method: "GET" })
    .inputValidator(z.string())
    .handler(async ({ data }) => {
        // data is userId string
        const { getPostsByUserId } = await import("@/server/data-access/posts");
        return getPostsByUserId(data);
    });
