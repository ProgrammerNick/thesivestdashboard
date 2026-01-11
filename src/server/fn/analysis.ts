import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { aiAnalysis } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const getAnalysisHistory = createServerFn({ method: "GET" })
    .inputValidator(z.object({ userId: z.string() }))
    .handler(async ({ data: { userId } }) => {
        // Security check: Only allow viewing own history?
        // User requested "people to have their own panel on history".
        // Usually private.
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || session.user.id !== userId) {
            // Return empty or throw? For now return empty to avoid leaking if generic profile.
            // Actually, we probably want to support public sharing later?
            // But for now, act as private.
            if (session?.user.id !== userId) return [];
        }

        const history = await db.select().from(aiAnalysis)
            .where(eq(aiAnalysis.userId, userId))
            .orderBy(desc(aiAnalysis.createdAt));

        return history;
    });

export const deleteAnalysis = createServerFn({ method: "POST" })
    .inputValidator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data: { id } }) => {
        const request = getRequest();
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const [existing] = await db.select().from(aiAnalysis)
            .where(eq(aiAnalysis.id, id))
            .limit(1);

        if (!existing) {
            throw new Error("Analysis not found");
        }

        if (existing.userId !== session.user.id) {
            throw new Error("Unauthorized");
        }

        await db.delete(aiAnalysis).where(eq(aiAnalysis.id, id));
        return { success: true };
    });
