import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
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
    ownershipConcentration: string;
    positionSizingLogic: string;
    cashPosition: string;
    holdings: {
        symbol: string;
        name: string;
        percent: number;
    }[];
};

export const searchFund = createServerFn({ method: "POST" })
    .inputValidator(z.string().min(1))
    .handler(async ({ data: query }: { data: string }) => {
        console.log("searchFund called with query:", query);
        if (!query) {
            throw new Error("Query parameter required");
        }

        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            console.error("Missing Gemini API Key");
            throw new Error("Server configuration error: Gemini Key Missing");
        }

        try {
            const client = new GoogleGenAI({ apiKey: geminiKey });

            const prompt = `
            SYSTEM PROMPT: You are a Senior Investment Strategist at a top-tier asset manager. Your goal is to analyze a hedge fund or mutual fund's portfolio and narrative to determine their hidden market conviction and provide actionable insights.

            USER PROMPT: 
            Please use Google Search to find the **Recent 13F filing (holdings)** and **Most recent Quarterly Investor Letter** for "${query}".
            
            Based on the found data, perform the following comprehensive analysis:

            1. **The 'Why' behind the 'What'**: Look at their top 5 largest holdings. Based on their letter, what is the specific economic 'bet' they are making (e.g., secular AI growth, interest rate sensitivity, or a distressed turnaround)?
            
            2. **Risk Appetite**: Are they 'Risk-On' or 'Defensive'? Look for clues like increased cash positions, high-beta tech exposure vs. low-beta staples, or the use of put options/hedges.
            
            3. **Contrarian Signals**: Identify any major position that goes against the current market consensus. Why might they be right, and what is the 'pain point' where they would be forced to admit they are wrong?
            
            4. **Market View**: Synthesize their commentary to explain how they view the macro environment (inflation, GDP, etc.) and how that translates to their current sector weighting.

            5. **Ownership Concentration**: Calculate what percentage of the total portfolio the top 10 holdings represent. Is this fund highly concentrated (e.g., 60%+ in top 10) or diversified? What does this tell us about their conviction level?

            6. **Position Sizing Logic**: If available in their commentary, explain WHY certain positions are larger than others. Is it higher conviction, better risk/reward, or liquidity constraints? Quote any relevant commentary if found.

            7. **Cash Position**: What is their current cash allocation (if disclosed)? Is it higher or lower than historical norms? This signals whether they are defensive/waiting for opportunities or fully invested.

            Return the data in the specified JSON format. Write in plain English that a retail investor can understand - avoid jargon where possible.
            - Map "The Why" to 'convictionThesis'.
            - Map "Risk Appetite" and "Contrarian Signals" to 'recentActivity' or 'strategy'.
            - Map "Market View" to 'performanceOutlook' or 'strategy'.
            - Map Ownership Concentration analysis to 'ownershipConcentration'.
            - Map Position Sizing Logic to 'positionSizingLogic'.
            - Map Cash Position analysis to 'cashPosition'.
            - Ensure 'holdings' array is populated with real data found from the search.
            `;

            // @ts-ignore
            const result = await client.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            fundName: { type: "STRING" },
                            strategy: {
                                type: "STRING",
                                description: "2-3 sentence summary of investment strategy in plain English",
                            },
                            recentActivity: {
                                type: "STRING",
                                description: "Commentary on recent purchases/sales and the reasoning behind them.",
                            },
                            performanceOutlook: {
                                type: "STRING",
                                description: "Analysis of relative out/underperformance and its causes.",
                            },
                            convictionThesis: {
                                type: "STRING",
                                description: "Why the fund believes in its top holdings - the core investment thesis.",
                            },
                            ownershipConcentration: {
                                type: "STRING",
                                description: "What percentage of the portfolio is in the top 10 holdings? Is this concentrated or diversified, and what does it mean?",
                            },
                            positionSizingLogic: {
                                type: "STRING",
                                description: "Why are certain positions larger? Include any manager commentary on position sizing if available.",
                            },
                            cashPosition: {
                                type: "STRING",
                                description: "Current cash allocation and what it signals about the fund's market outlook.",
                            },
                            holdings: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        symbol: { type: "STRING" },
                                        name: { type: "STRING" },
                                        percent: { type: "NUMBER" },
                                    },
                                    required: ["symbol", "name", "percent"],
                                },
                            },
                        },
                        required: ["fundName", "strategy", "holdings", "recentActivity", "performanceOutlook", "convictionThesis", "ownershipConcentration", "positionSizingLogic", "cashPosition"],
                    },
                },
            });

            const responseText = result.text;

            if (!responseText) {
                console.error("Empty response from Gemini", JSON.stringify(result, null, 2));
                throw new Error("Empty response from Gemini");
            }

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
