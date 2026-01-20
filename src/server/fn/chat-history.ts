import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../../db/index";
import { chatSession, chatMessage } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

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

// Update a chat session title
export const updateChatSessionTitle = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            sessionId: z.string(),
            title: z.string(),
        })
    )
    .handler(async ({ data }) => {
        await db
            .update(chatSession)
            .set({ title: data.title })
            .where(eq(chatSession.id, data.sessionId));
        return { success: true };
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

// Generate a smart summary for a chat session using AI
export const generateChatSummary = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            sessionId: z.string(),
            messages: z.array(
                z.object({
                    role: z.enum(["user", "model"]),
                    content: z.string(),
                })
            ),
        })
    )
    .handler(async ({ data }) => {
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            console.warn("Missing Gemini API Key - skipping summary generation");
            return null;
        }

        try {
            const client = new GoogleGenAI({
                apiKey: geminiKey,
            });

            // Take first 3 messages for summary context
            const contextMessages = data.messages.slice(0, 3);
            const conversationText = contextMessages
                .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
                .join("\n");

            const prompt = `Generate a short, descriptive title (max 6 words) for this financial research conversation. Focus on the main topic or question. Do not include quotes or punctuation at the end.

Conversation:
${conversationText}

Title:`;

            // @ts-ignore
            const result = await client.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            });

            let summary = "";
            if (result?.text) {
                summary = typeof result.text === "function" ? result.text() : result.text;
            } else if (result?.response?.text) {
                summary = typeof result.response.text === "function" ? result.response.text() : result.response.text;
            } else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
                summary = result.response.candidates[0].content.parts[0].text;
            } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
                summary = result.candidates[0].content.parts[0].text;
            }

            // Clean up the summary
            summary = summary.trim().replace(/^["']|["']$/g, "");

            if (summary) {
                // Update the session title
                await db
                    .update(chatSession)
                    .set({ title: summary })
                    .where(eq(chatSession.id, data.sessionId));

                return summary;
            }

            return null;
        } catch (error) {
            console.error("Failed to generate chat summary:", error);
            return null;
        }
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
        // Validate that user exists to prevent foreign key constraint error
        const { user: userTable } = await import("../../db/schema");

        try {
            const userExists = await db
                .select({ id: userTable.id })
                .from(userTable)
                .where(eq(userTable.id, data.userId))
                .limit(1);

            if (!userExists || userExists.length === 0) {
                console.warn(`User ${data.userId} not found in database. This might be a sync issue with Better Auth.`);

                // Instead of failing, return a temporary session that doesn't persist
                // This allows the chat to work even if database sync is delayed
                return {
                    id: `temp-${crypto.randomUUID()}`,
                    userId: data.userId,
                    type: data.type,
                    contextId: data.contextId,
                    title: data.title,
                    preview: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messages: [],
                    isNew: true,
                    isTemporary: true, // Flag to indicate this won't persist
                };
            }
        } catch (error) {
            console.error("Error validating user:", error);
            // Fall back to temporary session on error
            return {
                id: `temp-${crypto.randomUUID()}`,
                userId: data.userId,
                type: data.type,
                contextId: data.contextId,
                title: data.title,
                preview: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: [],
                isNew: true,
                isTemporary: true,
            };
        }

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
        try {
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
        } catch (error) {
            console.error("Failed to create chat session:", error);
            throw new Error(`Failed to create session: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
