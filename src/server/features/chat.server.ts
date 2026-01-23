/**
 * Chat Business Logic
 * Contains the AI-powered chat functionality for fund discussions
 */

import { GoogleGenAI } from "@google/genai";

export type ChatMessage = {
    role: "user" | "model";
    content: string;
};

/**
 * Generate a chat response about a fund using Gemini AI
 */
export async function generateFundChatResponse(
    fundName: string,
    context: string,
    messages: ChatMessage[]
): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        throw new Error("Missing Gemini API Key");
    }

    const ai = new GoogleGenAI({
        apiKey: geminiKey,
    });

    // Simulating chat by passing history as contents
    const systemInstruction = `You are an expert financial analyst. You are discussing the investment strategy of ${fundName}. 
    Here is the context of our analysis so far:
    ${context}
    
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
        ...messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.content }]
        }))
    ];

    // @ts-ignore
    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: historyContents,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    // Extract text from response - text is a getter property
    const responseText = result.text;

    if (!responseText) {
        console.error("Could not extract text from Gemini response:", JSON.stringify(result, null, 2));
        throw new Error("Failed to get response from AI");
    }

    return responseText;
}
