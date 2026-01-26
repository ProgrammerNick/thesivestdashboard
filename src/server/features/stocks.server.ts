/**
 * Stock Analysis Business Logic
 * Contains the AI-powered stock research functionality
 */

import { GoogleGenAI } from "@google/genai";
import { Resource } from "sst";
import { retryGeminiCall } from "../utils/gemini-retry";
import * as fs from "fs/promises";
import * as path from "path";

export type Catalyst = {
    event: string;
    date: string;
    impact: string;
};

export type ComparableCompany = {
    ticker: string;
    name: string;
    peRatio: string;
    evEbitda: string;
    premium: string;
};

export type StockData = {
    symbol: string;
    companyName: string;
    businessSummary: string;
    moatAnalysis: string;
    keyRisks: string[];
    growthCatalysts: string;
    financialHealth: string;
    valuationCommentary: string;
    capitalAllocation: string;
    earningsQuality: string;
    shortInterest?: string | null;
    upcomingCatalysts: Catalyst[];
    comparableMultiples: ComparableCompany[];
};

/**
 * Generate stock analysis using Gemini AI
 */
export async function generateStockAnalysis(query: string): Promise<StockData> {
    if (!query) {
        throw new Error("Query parameter required");
    }

    // Debug logging
    const logPath = path.join(process.cwd(), "debug-stocks.log");
    await fs.appendFile(logPath, `[${new Date().toISOString()}] Analyzing: ${query}\n`);

    let geminiKey = process.env.GEMINI_API_KEY;

    try {
        geminiKey = Resource.GEMINI_API_KEY.value;
    } catch (e) {
        await fs.appendFile(logPath, `[${new Date().toISOString()}] Failed to get Resource.GEMINI_API_KEY: ${e}\n`);
    }

    if (!geminiKey) {
        const error = "Missing Gemini API Key";
        await fs.appendFile(logPath, `[${new Date().toISOString()}] ${error}\n`);
        console.error(error);
        throw new Error("Server configuration error: Gemini Key Missing");
    }

    if (!geminiKey) {
        console.error("Missing Gemini API Key");
        throw new Error("Server configuration error: Gemini Key Missing");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const prompt = `You are a senior equity research analyst. Analyze the stock "${query}" and provide an institutional-grade investment summary.

        Use Google Search to find the latest financial data, SEC filings, short interest data, and analyst commentary.

        Provide a comprehensive analysis covering:

        1. **Business Model**: How does this company make money? (2-3 sentences, plain English)

        2. **Moat / Competitive Advantage**: What protects this business from competition? (network effects, switching costs, brand, patents, scale, etc.)

        3. **Key Risks**: List the top 3 risks as separate items in an array.

        4. **Growth Catalysts**: What are the near-term drivers that could push the stock higher?

        5. **Financial Health**: Comment on profitability (margins), balance sheet strength, and debt levels.

        6. **Valuation Context**: Is the stock expensive or cheap? Compare current P/E, EV/EBITDA to its 5-year average.

        7. **Capital Allocation**: How does management deploy capital? Are they shareholder-friendly?

        8. **Earnings Quality**: Is earnings growth real? Compare operating cash flow to net income.

        9. **Short Interest**: ONLY include this if short interest is notable (>5% of float or significantly above/below historical norms). If it's unremarkable, return null. Otherwise explain what it signals.

        10. **Upcoming Catalysts**: Return as an ARRAY of objects. Each object should have: event (what), date (when - approximate if needed), impact (bullish/bearish/neutral and why).

        11. **Comparable Multiples**: Return as an ARRAY of 3-4 competitor objects. Each should have: ticker, name, peRatio (as string like "25.3x"), evEbitda (as string like "15.2x"), premium (brief note on why they trade at premium/discount vs subject stock).

        Write in plain English. Return data in the specified JSON format.`;

        // Wrap the API call in retry logic
        const result = await retryGeminiCall(async () => {
            // @ts-ignore
            return await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                    responseJsonSchema: {
                        type: "OBJECT",
                        properties: {
                            symbol: { type: "STRING" },
                            companyName: { type: "STRING" },
                            businessSummary: {
                                type: "STRING",
                                description: "How the company makes money (2-3 sentences in plain English)."
                            },
                            moatAnalysis: {
                                type: "STRING",
                                description: "Competitive advantages protecting the business."
                            },
                            keyRisks: {
                                type: "ARRAY",
                                items: { type: "STRING" },
                                description: "Top 3 risks as separate list items."
                            },
                            growthCatalysts: {
                                type: "STRING",
                                description: "Near-term drivers of revenue and earnings growth."
                            },
                            financialHealth: {
                                type: "STRING",
                                description: "Comment on profitability, margins, and debt levels."
                            },
                            valuationCommentary: {
                                type: "STRING",
                                description: "Is it expensive or cheap vs history and peers?"
                            },
                            capitalAllocation: {
                                type: "STRING",
                                description: "How management deploys capital. Are they shareholder-friendly?"
                            },
                            earningsQuality: {
                                type: "STRING",
                                description: "Is earnings growth real? Compare cash flow to net income."
                            },
                            shortInterest: {
                                type: "STRING",
                                nullable: true,
                                description: "Only include if notable (>5% of float). Otherwise null."
                            },
                            upcomingCatalysts: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        event: { type: "STRING", description: "What is happening" },
                                        date: { type: "STRING", description: "When (approximate if needed)" },
                                        impact: { type: "STRING", description: "Bullish/Bearish/Neutral and why" }
                                    },
                                    required: ["event", "date", "impact"]
                                },
                                description: "Upcoming events that could move the stock."
                            },
                            comparableMultiples: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        ticker: { type: "STRING" },
                                        name: { type: "STRING" },
                                        peRatio: { type: "STRING", description: "e.g. 25.3x" },
                                        evEbitda: { type: "STRING", description: "e.g. 15.2x" },
                                        premium: { type: "STRING", description: "Why they trade at premium/discount" }
                                    },
                                    required: ["ticker", "name", "peRatio", "evEbitda", "premium"]
                                },
                                description: "3-4 competitors for valuation comparison."
                            }
                        },
                        required: ["symbol", "companyName", "businessSummary", "moatAnalysis", "keyRisks", "growthCatalysts", "financialHealth", "valuationCommentary", "capitalAllocation", "earningsQuality", "upcomingCatalysts", "comparableMultiples"],
                    },
                },
            });
        }, { maxRetries: 3 });

        // Extract text from response - text is a getter property
        const responseText = result.text;

        if (!responseText) {
            await fs.appendFile(logPath, `[${new Date().toISOString()}] Empty response from Gemini\n`);
            throw new Error("Empty response from Gemini");
        }

        const cleanJson = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        console.log("Gemini Stock Analysis Result:", cleanJson.substring(0, 200) + "...");

        await fs.appendFile(logPath, `[${new Date().toISOString()}] Success. Parsing JSON...\n`);

        return JSON.parse(cleanJson) as StockData;
    } catch (error) {
        await fs.appendFile(logPath, `[${new Date().toISOString()}] Error: ${error instanceof Error ? error.message : String(error)}\n`);
        console.error("Gemini stock search failed:", error);
        throw new Error(`Gemini Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
