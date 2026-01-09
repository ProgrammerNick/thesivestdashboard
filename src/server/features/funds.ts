import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Resource } from "sst";
import { z } from "zod";
import { DynamicRetrievalMode } from "@google/generative-ai";
import { getWebRequest } from "vinxi/http";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { aiAnalysis } from "@/db/schema";


export type FundData = {
    fundName: string;
    strategy: string;
    recentActivity: string;
    performanceOutlook: string;
    convictionThesis: string;
    holdings: {
        symbol: string;
        name: string;
        percent: number;
    }[];
};

export const searchFund = createServerFn({ method: "POST" }).inputValidator(z.string().min(1))
    .handler(async ({ data: query }: { data: string }) => {
        if (!query) {
            throw new Error("Query parameter required");
        }

        // Access env var directly in server function
        const geminiKey = Resource.GEMINI_API_KEY.value;
        if (!geminiKey) {
            console.error("Missing Gemini API Key");
            throw new Error("Server configuration error");
        }

        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                // 1. Update the model string
                model: "gemini-3-pro-preview",

                // 2. Updated Tools syntax (Grounding with Google Search)
                // Note: In Gemini 3, 'googleSearchRetrieval' is the preferred schema
                tools: [
                    {
                        google_search: {}
                    } as any
                ],

                generationConfig: {
                    responseMimeType: "application/json",
                    // Your existing responseSchema remains the same
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            fundName: { type: SchemaType.STRING },
                            strategy: {
                                type: SchemaType.STRING,
                                description: "2-3 sentence summary of investment strategy",
                            },
                            recentActivity: {
                                type: SchemaType.STRING,
                                description: "Commentary on recent purchases/sales and the reasoning behind them.",
                            },
                            performanceOutlook: {
                                type: SchemaType.STRING,
                                description: "Analysis of relative out/underperformance and its causes.",
                            },
                            convictionThesis: {
                                type: SchemaType.STRING,
                                description: "Why the fund believes in its top holdings.",
                            },
                            holdings: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        symbol: { type: SchemaType.STRING },
                                        name: { type: SchemaType.STRING },
                                        percent: { type: SchemaType.NUMBER },
                                    },
                                    required: ["symbol", "name", "percent"],
                                },
                            },
                        },
                        required: ["fundName", "strategy", "holdings", "recentActivity", "performanceOutlook", "convictionThesis"],
                    },
                },
            });

            const prompt = `Search for the latest available 13F portfolio holdings, shareholder letters, and news for "${query}". 
            1. Find the top 5-10 largest holdings by percentage.
            2. Analyze recent 13F changes to identify buying/selling activity. Explain the reasoning if available.
            3. Look for reasons explaining recent outperformance or underperformance.
            4. Identify the core thesis for their largest positions (why they believe in them).
            Return the data in the specified JSON format. Ensure percentages are numbers (e.g. 5.5).`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const data = JSON.parse(responseText) as FundData;

            // Save to history if user is logged in
            try {
                const request = getWebRequest();
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (session?.user?.id) {
                    await db.insert(aiAnalysis).values({
                        userId: session.user.id,
                        type: "fund", // or infer from query/context
                        query: query,
                        result: JSON.stringify(data),
                    });
                }
            } catch (err) {
                console.error("Failed to save history:", err);
                // Don't fail the request if history saving fails
            }

            return data;
        } catch (error) {
            console.error("Gemini search failed:", error);
            throw new Error(`Gemini Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
