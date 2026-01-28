/**
 * Chart Insights Server Functions
 * AI-powered chart analysis and technical insights
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { Resource } from "sst";

/**
 * Generate AI-powered chart insight for a stock
 */
export const generateChartInsight = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            symbol: z.string(),
            companyName: z.string(),
            currentPrice: z.number(),
            priceChange: z.number().optional(),
            priceChangePercent: z.number().optional(),
            existingContext: z.string().optional(), // Existing research context
        })
    )
    .handler(async ({ data }) => {
        let geminiKey = process.env.GEMINI_API_KEY;

        try {
            geminiKey = Resource.GEMINI_API_KEY.value;
        } catch (e) {
            console.warn("Resource.GEMINI_API_KEY not found, falling back to env");
        }

        if (!geminiKey) {
            throw new Error("Missing Gemini API Key");
        }

        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const prompt = `
You are an expert technical analyst. Analyze the stock ${data.symbol} (${data.companyName}) and provide a concise chart insight.

Current Data:
- Symbol: ${data.symbol}
- Company: ${data.companyName}
- Current Price: $${data.currentPrice.toFixed(2)}
${data.priceChange ? `- Recent Change: ${data.priceChange > 0 ? '+' : ''}$${data.priceChange.toFixed(2)} (${data.priceChangePercent?.toFixed(2)}%)` : ''}

${data.existingContext ? `Existing Research Context:\n${data.existingContext}` : ''}

Please use Google Search to find the latest price action, news, and technical indicators for ${data.symbol}.

Provide a brief, actionable chart insight including:

### 📊 Technical Summary
- Current trend direction (bullish/bearish/neutral)
- Key support and resistance levels
- Recent volume patterns

### 🎯 Key Levels to Watch
- Immediate support: $X
- Immediate resistance: $X
- Major levels: $X - $X

### 💡 Insight
One paragraph synthesizing the technical picture with any fundamental catalysts.

Keep the response concise and actionable. Use bullet points and bold key numbers.
`;

        // @ts-ignore
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const responseText = result.text;

        if (!responseText) {
            throw new Error("Failed to get response from AI");
        }

        return responseText;
    });
