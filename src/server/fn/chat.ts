import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateFundChatResponse, type ChatMessage } from "../features/chat.server";

// Re-export types for consumers
export type { ChatMessage };

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
        return await generateFundChatResponse(
            data.fundName,
            data.context,
            data.messages as ChatMessage[]
        );
    });
