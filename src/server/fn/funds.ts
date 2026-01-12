import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import {
    generateFundAnalysis,
    saveFundAnalysisToHistory,
    type FundData
} from "../features/funds.server";

// Re-export types for consumers
export type { FundData };

export const searchFund = createServerFn({ method: "POST" })
    .inputValidator(z.string().min(1))
    .handler(async ({ data: query }: { data: string }) => {
        const data = await generateFundAnalysis(query);

        // Save to history if user is logged in
        try {
            const request = getRequest();
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            if (session?.user?.id) {
                await saveFundAnalysisToHistory(session.user.id, query, data);
            }
        } catch (err) {
            console.error("Failed to save history:", err);
        }

        return data;
    });
