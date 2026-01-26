import { Resource } from "sst";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { retryGeminiCall } from "../utils/gemini-retry";

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
        let geminiKey = process.env.GEMINI_API_KEY;

        try {
            geminiKey = Resource.GEMINI_API_KEY.value;
        } catch (e) {
            console.warn("Resource.GEMINI_API_KEY not found, falling back to env");
        }

        if (!geminiKey) {
            throw new Error("Missing Gemini API Key");
        }

        const ai = new GoogleGenAI({
            apiKey: geminiKey,
        });

        const systemInstruction = `You are an expert equity research analyst. You are discussing ${data.symbol} stock.
        
Here is the analysis context we've gathered:
${data.context}

Answer questions specifically about this stock, its business, valuation, risks, and catalysts. 
Be concise but thorough. Use data when available.
If asked about something not in the context, use your knowledge but note that it may not be current.

IMPORTANT FORMATTING INSTRUCTIONS:
- Use standard Markdown formatting.
- **ALWAYS use "###" headers** for distinct sections (e.g., ### Strategy, ### Financial Health, ### Risks).
- Do NOT run these sections together in one paragraph. Separate them with double newlines.
- Use bullet points for lists, using a hyphen (-) or asterisk (*).
- Use **bold** for key terms and emphasis.
- Keep the response visual, structured, and easy to scan.
- **Be extremely concise.** Avoid conversational filler (e.g., "Here is the analysis", "Good question").
- Structure your answer with short paragraphs.`;

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

        // Use retry logic for Gemini API calls
        const result = await retryGeminiCall(async () => {
            // @ts-ignore
            return await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: historyContents,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
        }, { maxRetries: 3 });

        // Extract text from response - text is a getter property
        const responseText = result.text;

        if (!responseText) {
            console.error("Could not extract text from Gemini response:", JSON.stringify(result, null, 2));
            throw new Error("Failed to get response from AI");
        }

        return responseText;
    });

