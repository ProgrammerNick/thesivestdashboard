import { GoogleGenAI } from "@google/genai";
import { Resource } from "sst";
import { retryGeminiCall } from "../utils/gemini-retry";
import * as fs from "fs/promises";
import * as path from "path";

export interface StockDiscoveryResult {
    symbol: string;
    name: string;
    thematicFit: string;
    marketView: string; // "Consensus vs Reality" / "What the market is missing"
    catalysts: string[];
}

export interface DiscoveryOptions {
    query: string;
    style?: string;      // e.g. "Thematic", "Contrarian"
    sector?: string;     // e.g. "Technology", "Energy"
    marketCap?: string;  // e.g. "Small Cap", "Large Cap"
}

export async function discoverStocks(options: DiscoveryOptions): Promise<StockDiscoveryResult[]> {
    const logPath = path.join(process.cwd(), "debug-discovery.log");
    // Default abstract query if empty but filters exist
    const { query, style, sector, marketCap } = options;

    await fs.appendFile(logPath, `[${new Date().toISOString()}] Request: ${JSON.stringify(options)}\n`);

    if (!query && !style && !sector) throw new Error("At least one criteria is required");

    let geminiKey = process.env.GEMINI_API_KEY;
    try {
        geminiKey = Resource.GEMINI_API_KEY.value;
    } catch (e) {
        console.warn("Failed to get Resource.GEMINI_API_KEY", e);
    }

    if (!geminiKey) {
        throw new Error("Missing Gemini API Key");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        // Debug logging
        console.log(`[Discovery] Generating ideas for: ${JSON.stringify(options)}`);

        const prompt = `You are a legendary hedge fund analyst known for finding alpha in overlooked places. 
        
        The user is looking for stock ideas with the following strictly enforced criteria:
        
        ${style ? `- **Investment Style**: ${style}` : ''}
        ${sector ? `- **Sector/Industry**: ${sector}` : ''}
        ${marketCap ? `- **Market Cap**: ${marketCap}` : ''}
        ${query ? `- **Specific Concept/Context**: "${query}"` : ''}

        Your task is to:
        1.  Analyze these constraints deeply.
        2.  Identify 3-5 specific public companies (US or major global) that BEST fit these specific criteria.
        3.  Focus on "Variant View" - what is the market missing? Why is the stock mispriced?
        4.  Return a structured list of these stocks.

        Return ONLY a JSON object with a "stocks" array. Each item must have:
        - symbol: string (Ticker)
        - name: string (Company Name)
        - thematicFit: string (Why it fits the user's specific concept & sector constraints perfectly)
        - marketView: string (The "Variant Perception" - what the consensus gets wrong vs reality)
        - catalysts: string[] (List of 2-3 specific upcoming events or triggers)
        `;

        const result = await retryGeminiCall(async () => {
            // @ts-ignore
            return await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: {
                        type: "OBJECT",
                        properties: {
                            stocks: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        symbol: { type: "STRING" },
                                        name: { type: "STRING" },
                                        thematicFit: { type: "STRING" },
                                        marketView: { type: "STRING" },
                                        catalysts: {
                                            type: "ARRAY",
                                            items: { type: "STRING" }
                                        }
                                    },
                                    required: ["symbol", "name", "thematicFit", "marketView", "catalysts"]
                                }
                            }
                        }
                    }
                }
            });
        }, { maxRetries: 3 });

        const responseText = result.text;

        await fs.appendFile(logPath, `[${new Date().toISOString()}] Raw Response: ${responseText?.substring(0, 100)}...\n`);

        if (!responseText) throw new Error("Empty response from Gemini");

        // Clean up markdown code blocks just in case
        const cleanJson = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");

        const data = JSON.parse(cleanJson);
        return data.stocks || [];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await fs.appendFile(logPath, `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`);
        console.error("Discovery failed:", error);
        throw new Error(`Failed to generate stock ideas: ${errorMessage}`);
    }
}
