import { createServerFn } from "@tanstack/react-start";
import { post, postAttachment } from "@/db/schema";
import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import { getRequest } from "@tanstack/react-start/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const postSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    slug: z.string().optional(),
    content: z.union([z.string(), z.any()]), // Accept markdown string or Tiptap JSON
    published: z.boolean().default(false),
    coverImage: z.string().optional(),
    attachments: z.array(z.object({
        url: z.string(),
        type: z.string(),
        filename: z.string(),
        size: z.number(),
    })).optional(),
    // Fields for research.tsx trades
    type: z.enum(["trade", "thought", "thesis", "update", "close_trade", "market_outlook", "quarterly_letter"]).optional(),
    symbol: z.string().optional(),
    buyPrice: z.number().optional(),
    targetPrice: z.number().optional(),
    stopLoss: z.number().optional(),
    referencePostId: z.string().optional(),
    closePrice: z.number().optional(),
});


export const createPost = createServerFn({ method: "POST" })
    .inputValidator(postSchema)
    .handler(async ({ data }) => {
        const request = getRequest();
        let session = await auth.api.getSession({
            headers: request?.headers,
        });

        // Dev fallback matching auth-guard.ts
        if (!session) {
            session = {
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
            } as any;
        }

        if (!session) {
            throw new Error("Unauthorized");
        }

        const [newPost] = await db
            .insert(post)
            .values({
                title: data.title,
                subtitle: data.subtitle,
                slug: data.slug,
                coverImage: data.coverImage,
                published: data.published ?? false,
                publishedAt: data.published ? new Date() : null,
                // Handle content: if string (markdown), store as-is; if object (Tiptap), stringify
                content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
                userId: session.user.id,
                type: data.type || "thought",
                // Trade-specific fields
                symbol: data.symbol,
                buyPrice: data.buyPrice?.toString(),
                buyDate: data.buyPrice ? new Date() : null,
                targetPrice: data.targetPrice?.toString(),
                stopLoss: data.stopLoss?.toString(),
            })
            .returning();

        if (data.attachments && data.attachments.length > 0) {
            await db.insert(postAttachment).values(
                data.attachments.map((att) => ({
                    postId: newPost.id,
                    url: att.url,
                    type: att.type,
                    filename: att.filename,
                    size: att.size,
                }))
            );
        }

        return newPost;
    });

export const updatePost = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            id: z.string(),
            data: postSchema.partial(),
        })
    )
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request?.headers,
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const existingPost = await db.query.post.findFirst({
            where: eq(post.id, data.id),
        });

        if (!existingPost || existingPost.userId !== session.user.id) {
            throw new Error("Unauthorized");
        }

        const updateValues: Record<string, any> = {
            updatedAt: new Date(),
        };

        // Copy simple string fields
        if (data.data.title !== undefined) updateValues.title = data.data.title;
        if (data.data.subtitle !== undefined) updateValues.subtitle = data.data.subtitle;
        if (data.data.slug !== undefined) updateValues.slug = data.data.slug;
        if (data.data.coverImage !== undefined) updateValues.coverImage = data.data.coverImage;
        if (data.data.published !== undefined) updateValues.published = data.data.published;
        if (data.data.type !== undefined) updateValues.type = data.data.type;
        if (data.data.symbol !== undefined) updateValues.symbol = data.data.symbol;

        // Handle content
        if (data.data.content !== undefined) {
            updateValues.content = typeof data.data.content === 'string'
                ? data.data.content
                : JSON.stringify(data.data.content);
        }

        // Convert numeric fields to strings for DB
        if (data.data.buyPrice !== undefined) updateValues.buyPrice = data.data.buyPrice.toString();
        if (data.data.targetPrice !== undefined) updateValues.targetPrice = data.data.targetPrice.toString();
        if (data.data.stopLoss !== undefined) updateValues.stopLoss = data.data.stopLoss.toString();
        if (data.data.closePrice !== undefined) updateValues.closePrice = data.data.closePrice?.toString();

        const [updatedPost] = await db
            .update(post)
            .set(updateValues)
            .where(eq(post.id, data.id))
            .returning();

        return updatedPost;
    });

export const getPost = createServerFn({ method: "GET" })
    .inputValidator(z.object({
        id: z.string().optional(),
        slug: z.string().optional()
    }).refine(data => data.id || data.slug, { message: "Either id or slug is required" }))
    .handler(async ({ data }) => {
        const foundPost = await db.query.post.findFirst({
            where: data.id ? eq(post.id, data.id) : eq(post.slug, data.slug!),
            with: {
                user: true,
                attachments: true,
            },
        });
        return foundPost;
    });

export const getMyPosts = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    const session = await auth.api.getSession({
        headers: request?.headers,
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    const posts = await db.query.post.findMany({
        where: eq(post.userId, session.user.id),
        orderBy: [desc(post.updatedAt)],
    });

    return posts;
});

// Get all published posts for the community feed
export const getFeedPosts = createServerFn({ method: "GET" }).handler(async () => {
    const posts = await db.query.post.findMany({
        where: eq(post.published, true),
        orderBy: [desc(post.updatedAt)],
        with: {
            user: true,
        },
        limit: 50,
    });
    return posts;
});

// Get posts for a specific stock symbol
export const getSymbolPosts = createServerFn({ method: "GET" })
    .inputValidator(z.object({ symbol: z.string() }))
    .handler(async ({ data }) => {
        // For now, return empty array - can be extended to filter by symbol tag
        const posts = await db.query.post.findMany({
            where: eq(post.published, true),
            orderBy: [desc(post.updatedAt)],
            with: {
                user: true,
            },
            limit: 10,
        });
        return posts;
    });

// Get user's research posts for job applications
export const getMyResearchPosts = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    const session = await auth.api.getSession({
        headers: request?.headers,
    });

    if (!session) {
        return [];
    }

    const posts = await db.query.post.findMany({
        where: eq(post.userId, session.user.id),
        orderBy: [desc(post.updatedAt)],
    });

    return posts;
});

// Get user's open trades (placeholder for now)
export const getUserOpenTrades = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    const session = await auth.api.getSession({
        headers: request?.headers,
    });

    if (!session) {
        return [];
    }

    // Placeholder - can be extended with actual trade tracking
    return [];
});

export const deletePost = createServerFn({ method: "POST" })
    .inputValidator(z.object({ id: z.string() }))
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request?.headers,
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        const existingPost = await db.query.post.findFirst({
            where: eq(post.id, data.id),
        });

        if (!existingPost || existingPost.userId !== session.user.id) {
            throw new Error("Unauthorized");
        }

        await db.delete(post).where(eq(post.id, data.id));
        return { success: true };
    });
