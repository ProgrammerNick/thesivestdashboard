import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discoverStocks, type StockDiscoveryResult } from "../features/discovery.server";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { getOrCreateChatSession, addChatMessage } from "./chat-history";

// Re-export type
export type { StockDiscoveryResult };

export const discoverStocksFn = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        query: z.string().optional().default(""),
        style: z.string().optional(),
        sector: z.string().optional(),
        marketCap: z.string().optional()
    }))
    .handler(async ({ data: input }) => {
        const results = await discoverStocks(input);

        // Auto-save to history if user is logged in
        try {
            const request = getRequest();
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            if (session?.user?.id) {
                // Generate a descriptive title
                const titleParts = [];
                if (input.style) titleParts.push(input.style);
                if (input.sector && input.sector !== "Any") titleParts.push(input.sector);
                if (input.marketCap && input.marketCap !== "Any") titleParts.push(input.marketCap);
                const title = `Idea Lab: ${titleParts.join(" / ") || "Custom Search"}`;

                // Create unique context ID based on inputs to allow re-runs to create NEW sessions or update
                // Actually for Discovery, we might want a new session every time or group by criteria.
                // Let's create a NEW session usually, or just use criteria string as contextId.
                const contextId = `discovery-${Date.now()}`;

                const chatSession = await getOrCreateChatSession({
                    data: {
                        userId: session.user.id,
                        type: "discovery",
                        contextId: contextId,
                        title: title,
                    }
                });

                if (chatSession.isNew || chatSession.messages.length === 0) {
                    // Format results as markdown
                    let markdown = `## ${title}\n\n`;
                    if (input.query) markdown += `> **Context**: "${input.query}"\n\n`;

                    markdown += `Here are the high-conviction opportunities identified:\n\n`;

                    results.forEach(stock => {
                        markdown += `### ${stock.symbol} - ${stock.name}\n`;
                        markdown += `**Thesis Fit**: ${stock.thematicFit}\n\n`;
                        markdown += `**Variant View**: ${stock.marketView}\n\n`;
                        markdown += `**Catalysts**:\n`;
                        stock.catalysts.forEach(c => markdown += `- ${c}\n`);
                        markdown += `\n---\n`;
                    });

                    markdown += `\nWhich of these would you like to analyze in depth?`;

                    await addChatMessage({
                        data: {
                            sessionId: chatSession.id,
                            role: "model",
                            content: markdown
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Failed to save discovery history:", err);
            // Don't fail the request if history saving fails
        }

        return results;
    });
