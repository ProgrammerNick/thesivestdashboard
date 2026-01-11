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
    content: z.any(), // JSON content from Tiptap
    published: z.boolean().default(false),
    coverImage: z.string().optional(),
    attachments: z.array(z.object({
        url: z.string(),
        type: z.string(),
        filename: z.string(),
        size: z.number(),
    })).optional(),
});

export const createPost = createServerFn({ method: "POST" })
    .inputValidator(postSchema)
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request?.headers,
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        const [newPost] = await db
            .insert(post)
            .values({
                ...data,
                content: JSON.stringify(data.content), // Ensure content is stored as string
                userId: session.user.id,
                type: "thought", // Default type for now
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

        const [updatedPost] = await db
            .update(post)
            .set({
                ...data.data,
                content: data.data.content ? JSON.stringify(data.data.content) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(post.id, data.id))
            .returning();

        return updatedPost;
    });

export const getPost = createServerFn({ method: "GET" })
    .inputValidator(z.object({ slug: z.string() }))
    .handler(async ({ data }) => {
        const foundPost = await db.query.post.findFirst({
            where: eq(post.slug, data.slug),
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
