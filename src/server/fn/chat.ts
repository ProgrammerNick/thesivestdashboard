import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const MessageSchema = z.object({
    role: z.enum(["user", "model"]),
    content: z.string(),
});

export const chatWithFund = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            fundName: z.string(),
            context: z.string(), // The fund analysis context (summary, thesis, etc.)
            messages: z.array(MessageSchema),
        })
    )
    .handler(async ({ data }) => {
        let geminiKey = process.env.GEMINI_API_KEY;

        if (!geminiKey) {
            throw new Error("Missing Gemini API Key");
        }

        const client = new GoogleGenAI({
            apiKey: geminiKey,
        });

        // Simulating chat by passing history as contents
        const systemInstruction = `You are an expert financial analyst. You are discussing the investment strategy of ${data.fundName}. 
        Here is the context of our analysis so far:
        ${data.context}
        
        Answer questions specifically about this fund, its holdings, and its strategy. Use Google Search if you need specific up-to-date news or prices that aren't in the context.`;

        // This SDK usually supports 'systemInstruction' in config, or we prepend a user message.
        // We will prepend a user message for safety.

        // Map existing messages to SDK content format
        const historyContents = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to discuss the fund's strategy and holdings based on the provided context." }]
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

        // @ts-ignore
        const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text?.() || "";
        return responseText;
    });
