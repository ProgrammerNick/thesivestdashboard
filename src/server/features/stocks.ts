import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Resource } from "sst";
import { z } from "zod";

export type StockData = {
    symbol: string;
    companyName: string;
    businessSummary: string;
    moatAnalysis: string;
    keyRisks: string;
    growthCatalysts: string;
    financialHealth: string; // Brief comment on margins/balance sheet
    valuationCommentary: string; // Brief comment on P/E vs history etc.
};

export const searchStock = createServerFn({ method: "POST" }).inputValidator(z.string().min(1))
    .handler(async ({ data: query }: { data: string }) => {
        if (!query) {
            throw new Error("Query parameter required");
        }

        const geminiKey = Resource.GEMINI_API_KEY.value;
        if (!geminiKey) {
            console.error("Missing Gemini API Key");
            throw new Error("Server configuration error");
        }

        try {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                tools: [
                    {
                        google_search: {}
                    } as any
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            symbol: { type: SchemaType.STRING },
                            companyName: { type: SchemaType.STRING },
                            businessSummary: {
                                type: SchemaType.STRING,
                                description: "How the company makes money (2 sentences)."
                            },
                            moatAnalysis: {
                                type: SchemaType.STRING,
                                description: "Competitive advantages (network effect, switching costs, etc.)."
                            },
                            keyRisks: {
                                type: SchemaType.STRING,
                                description: "Top 2-3 risks to the thesis."
                            },
                            growthCatalysts: {
                                type: SchemaType.STRING,
                                description: "Future drivers of revenue/earnings."
                            },
                            financialHealth: {
                                type: SchemaType.STRING,
                                description: "Comment on profitability, margins, and debt."
                            },
                            valuationCommentary: {
                                type: SchemaType.STRING,
                                description: "Is it expensive or cheap relative to history/peers?"
                            }
                        },
                        required: ["symbol", "companyName", "businessSummary", "moatAnalysis", "keyRisks", "growthCatalysts", "financialHealth", "valuationCommentary"],
                    },
                },
            });

            const prompt = `Analyze the stock for "${query}". 
            Provide a professional investor-grade summary covering:
            1. Business Model
            2. Moat / Competitive Advantage
            3. Key Risks
            4. Growth Catalysts
            5. Financial Health
            6. Valuation Context
            Return the data in the specified JSON format.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return JSON.parse(responseText) as StockData;
        } catch (error) {
            console.error("Gemini stock search failed:", error);
            throw new Error(`Gemini Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
