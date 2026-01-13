import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
    role: "user" | "model";
    content: string;
};

const MessageSchema = z.object({
    role: z.enum(["user", "model"]),
    content: z.string(),
});

/**
 * Chat about a stock with AI - allows follow-up questions after initial analysis
 */
export const chatWithStock = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            symbol: z.string(),
            context: z.string(), // The stock analysis context (moat, risks, etc.)
            messages: z.array(MessageSchema),
        })
    )
    .handler(async ({ data }) => {
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            throw new Error("Missing Gemini API Key");
        }

        const client = new GoogleGenAI({
            apiKey: geminiKey,
        });

        const systemInstruction = `You are an expert equity research analyst. You are discussing ${data.symbol} stock.
        
Here is the analysis context we've gathered:
${data.context}

Answer questions specifically about this stock, its business, valuation, risks, and catalysts. 
Be concise but thorough. Use data when available.
If asked about something not in the context, use your knowledge but note that it may not be current.`;

        const historyContents = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I'm ready to discuss this stock analysis. What would you like to know?" }]
            },
            ...data.messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.content }]
            }))
        ];

        // @ts-ignore
        const result = await client.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: historyContents,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Handle different response formats from the Gemini SDK
        let responseText = "";

        if (result?.text) {
            responseText = typeof result.text === 'function' ? result.text() : result.text;
        } else if (result?.response?.text) {
            responseText = typeof result.response.text === 'function' ? result.response.text() : result.response.text;
        } else if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = result.response.candidates[0].content.parts[0].text;
        } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
            responseText = result.candidates[0].content.parts[0].text;
        }

        if (!responseText) {
            console.error("Could not extract text from Gemini response:", JSON.stringify(result, null, 2));
            throw new Error("Failed to get response from AI");
        }

        return responseText;
    });
