import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../../db/index";
import { chatSession, chatMessage } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// Types for the chat history
export type ChatSessionType = "fund" | "stock" | "fund-intelligence";

export interface ChatSessionWithMessages {
    id: string;
    userId: string;
    type: string;
    contextId: string;
    title: string;
    preview: string | null;
    createdAt: Date;
    updatedAt: Date;
    messages: {
        id: string;
        role: string;
        content: string;
        createdAt: Date;
    }[];
}

// Get all chat sessions for a user, optionally filtered by type
export const getChatSessions = createServerFn({ method: "GET" })
    .inputValidator(
        z.object({
            userId: z.string(),
            type: z.enum(["fund", "stock", "fund-intelligence"]).optional(),
            limit: z.number().optional().default(20),
        })
    )
    .handler(async ({ data }) => {
        const conditions = [eq(chatSession.userId, data.userId)];

        if (data.type) {
            conditions.push(eq(chatSession.type, data.type));
        }

        const sessions = await db
            .select()
            .from(chatSession)
            .where(and(...conditions))
            .orderBy(desc(chatSession.updatedAt))
            .limit(data.limit);

        return sessions;
    });

// Get a single chat session with all its messages
export const getChatSession = createServerFn({ method: "GET" })
    .inputValidator(
        z.object({
            sessionId: z.string(),
        })
    )
    .handler(async ({ data }) => {
        const session = await db
            .select()
            .from(chatSession)
            .where(eq(chatSession.id, data.sessionId))
            .limit(1);

        if (!session[0]) {
            return null;
        }

        const messages = await db
            .select()
            .from(chatMessage)
            .where(eq(chatMessage.sessionId, data.sessionId))
            .orderBy(chatMessage.createdAt);

        return {
            ...session[0],
            messages,
        } as ChatSessionWithMessages;
    });

// Create a new chat session
export const createChatSession = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            userId: z.string(),
            type: z.enum(["fund", "stock", "fund-intelligence"]),
            contextId: z.string(),
            title: z.string(),
        })
    )
    .handler(async ({ data }) => {
        const newSession = await db
            .insert(chatSession)
            .values({
                userId: data.userId,
                type: data.type,
                contextId: data.contextId,
                title: data.title,
            })
            .returning();

        return newSession[0];
    });

// Add a message to a chat session
export const addChatMessage = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            sessionId: z.string(),
            role: z.enum(["user", "model"]),
            content: z.string(),
        })
    )
    .handler(async ({ data }) => {
        // Add the message
        const newMessage = await db
            .insert(chatMessage)
            .values({
                sessionId: data.sessionId,
                role: data.role,
                content: data.content,
            })
            .returning();

        // Update session preview and timestamp
        const previewText = data.content.slice(0, 100) + (data.content.length > 100 ? "..." : "");
        await db
            .update(chatSession)
            .set({
                preview: previewText,
                updatedAt: new Date(),
            })
            .where(eq(chatSession.id, data.sessionId));

        return newMessage[0];
    });

// Delete a chat session (and all its messages via cascade)
export const deleteChatSession = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            sessionId: z.string(),
        })
    )
    .handler(async ({ data }) => {
        await db.delete(chatSession).where(eq(chatSession.id, data.sessionId));
        return { success: true };
    });

// Get or create a session for continuing a conversation
export const getOrCreateChatSession = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            userId: z.string(),
            type: z.enum(["fund", "stock", "fund-intelligence"]),
            contextId: z.string(),
            title: z.string(),
        })
    )
    .handler(async ({ data }) => {
        // Check for existing recent session with same context
        const existing = await db
            .select()
            .from(chatSession)
            .where(
                and(
                    eq(chatSession.userId, data.userId),
                    eq(chatSession.type, data.type),
                    eq(chatSession.contextId, data.contextId)
                )
            )
            .orderBy(desc(chatSession.updatedAt))
            .limit(1);

        if (existing[0]) {
            // Return existing session with messages
            const messages = await db
                .select()
                .from(chatMessage)
                .where(eq(chatMessage.sessionId, existing[0].id))
                .orderBy(chatMessage.createdAt);

            return {
                ...existing[0],
                messages,
                isNew: false,
            };
        }

        // Create new session
        const newSession = await db
            .insert(chatSession)
            .values({
                userId: data.userId,
                type: data.type,
                contextId: data.contextId,
                title: data.title,
            })
            .returning();

        return {
            ...newSession[0],
            messages: [],
            isNew: true,
        };
    });
