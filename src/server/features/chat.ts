import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            tools: [
                {
                    google_search: {}
                } as any
            ],
        });

        // Construct the chat history with system context
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `You are an expert financial analyst. You are discussing the investment strategy of ${data.fundName}. 
          Here is the context of our analysis so far:
          ${data.context}
          
          Answer questions specifically about this fund, its holdings, and its strategy. Use Google Search if you need specific up-to-date news or prices that aren't in the context.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to discuss the fund's strategy and holdings based on the provided context." }],
                },
                ...data.messages.slice(0, -1).map((m) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                })),
            ],
        });

        const lastMessage = data.messages[data.messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        return response.text();
    });
