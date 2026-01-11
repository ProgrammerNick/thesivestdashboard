import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
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
        console.log("searchFund called with query:", query);
        if (!query) {
            throw new Error("Query parameter required");
        }

        // Access env var directly in server function
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            console.error("Missing Gemini API Key in searchFund");
            throw new Error("Server configuration error: Missing Gemini API Key");
        }
        console.log("Gemini Key starts with:", geminiKey.substring(0, 4));

        try {
            const genAI = new GoogleGenerativeAI(geminiKey);


            const modelOriginal = genAI.getGenerativeModel({
                model: "gemini-3-flash-preview",
                tools: [
                    {
                        googleSearch: {}
                    } as any
                ],

                generationConfig: {
                    responseMimeType: "application/json",
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

            const prompt = `
            SYSTEM PROMPT: You are a Senior Investment Strategist. Your goal is to analyze a hedge fund’s portfolio and narrative to determine their hidden market conviction.

            USER PROMPT: 
            Please use Google Search to find the **Recent 13F filing (holdings)** and **Most recent Quarterly Investor Letter** for "${query}".
            
            Based on the found data, perform the following analysis:

            1. **The 'Why' behind the 'What'**: Look at their top 5 largest holdings. Based on their letter, what is the specific economic 'bet' they are making (e.g., secular AI growth, interest rate sensitivity, or a distressed turnaround)?
            
            2. **Risk Appetite**: Are they 'Risk-On' or 'Defensive'? Look for clues like increased cash positions, high-beta tech exposure vs. low-beta staples, or the use of put options/hedges.
            
            3. **Contrarian Signals**: Identify any major position that goes against the current market consensus. Why might they be right, and what is the 'pain point' where they would be forced to admit they are wrong?
            
            4. **Market View**: Synthesize their commentary to explain how they view the macro environment (inflation, GDP, etc.) and how that translates to their current sector weighting.

            Return the data in the specified JSON format.
            - Map "The Why" to 'convictionThesis'.
            - Map "Risk Appetite" and "Contrarian Signals" to 'recentActivity' or 'strategy'.
            - Map "Market View" to 'performanceOutlook' or 'strategy'.
            - Ensures 'holdings' array is populated with real data found from the search.
            `;

            const result = await modelOriginal.generateContent(prompt);
            const responseText = result.response.text();
            console.log("Gemini Response:", responseText.substring(0, 100));
            // Strip markdown block if present
            const cleanJson = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            const data = JSON.parse(cleanJson) as FundData;

            // Save to history if user is logged in
            try {
                const request = getRequest();
                const session = await auth.api.getSession({
                    headers: request.headers,
                });

                if (session?.user?.id) {
                    await db.insert(aiAnalysis).values({
                        userId: session.user.id,
                        type: "fund",
                        query: query,
                        result: JSON.stringify(data),
                    });
                }
            } catch (err) {
                console.error("Failed to save history:", err);
            }

            return data;
        } catch (error) {
            console.error("Gemini search failed:", error);
            throw new Error(`Gemini Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
