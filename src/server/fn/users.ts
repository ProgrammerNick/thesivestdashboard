import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { db } from "@/db/index";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

// Update user profile
export const updateUserProfile = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            bio: z.string().max(280).optional(),
            investingStyle: z.enum([
                "Value",
                "Growth",
                "Momentum",
                "Dividend",
                "Index",
                "Quantitative",
                "Day Trading"
            ]).optional().nullable(),
            experienceLevel: z.enum([
                "Beginner",
                "Intermediate",
                "Advanced",
                "Professional"
            ]).optional().nullable(),
            location: z.string().max(100).optional(),
            website: z.string().max(200).optional(),
            linkedin: z.string().max(200).optional(),
            twitter: z.string().max(50).optional(),
            image: z.string().optional().nullable(),
            premiumContentEnabled: z.boolean().optional(),
            featuredPostId: z.string().optional().nullable(),
        })
    )
    .handler(async ({ data }) => {
        const request = getRequest();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session || !session.user) {
            throw new Error("Not authenticated");
        }

        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        };

        if (data.bio !== undefined) updateData.bio = data.bio || null;
        if (data.investingStyle !== undefined) updateData.investingStyle = data.investingStyle || null;
        if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel || null;
        if (data.location !== undefined) updateData.location = data.location || null;
        if (data.website !== undefined) updateData.website = data.website || null;
        if (data.linkedin !== undefined) updateData.linkedin = data.linkedin || null;
        if (data.twitter !== undefined) updateData.twitter = data.twitter || null;
        if (data.image !== undefined) updateData.image = data.image || null;
        if (data.premiumContentEnabled !== undefined) updateData.premiumContentEnabled = data.premiumContentEnabled;
        if (data.featuredPostId !== undefined) updateData.featuredPostId = data.featuredPostId || null;

        await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, session.user.id));

        return { success: true };
    });

// Get user profile by ID (public)
export const getUserProfile = createServerFn({ method: "GET" })
    .inputValidator(z.object({ userId: z.string() }))
    .handler(async ({ data }) => {
        const result = await db
            .select({
                id: user.id,
                name: user.name,
                displayName: user.displayName,
                image: user.image,
                bio: user.bio,
                investingStyle: user.investingStyle,
                experienceLevel: user.experienceLevel,
                location: user.location,
                website: user.website,
                twitter: user.twitter,
                verified: user.verified,
            })
            .from(user)
            .where(eq(user.id, data.userId))
            .limit(1);

        return result[0] || null;
    });
