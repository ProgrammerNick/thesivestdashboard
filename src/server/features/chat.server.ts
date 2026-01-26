/**
 * Chat Business Logic
 * Contains the AI-powered chat functionality for fund discussions
 */

import { Resource } from "sst";
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

    // Simulating chat by passing history as contents
    const systemInstruction = `You are an expert financial analyst. You are discussing the investment strategy of ${fundName}. 
    Here is the context of our analysis so far:
    ${context}
    
    Answer questions specifically about this fund, its holdings, and its strategy. Use Google Search if you need specific up-to-date news or prices that aren't in the context.
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    - Use standard Markdown formatting.
    - **ALWAYS use "###" headers** for distinct sections (e.g., ### Strategy, ### Performance, ### Holdings).
    - Do NOT run these sections together. Separate them with double newlines.
    - Use bullet points for lists.
    - Use **bold** for key terms and emphasis.
    - Keep the response visual and easy to scan.`;

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
