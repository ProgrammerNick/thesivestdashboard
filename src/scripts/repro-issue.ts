import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function testModel() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.error("No GEMINI_API_KEY found in environment");
        return;
    }

    console.log("Testing gemini-3-flash-preview with google_search (snake_case)...");

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        tools: [
            {
                google_search: {}
            } as any,
        ],
    });

    try {
        const result = await model.generateContent("What is the stock price of Microsoft?");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error with snake_case:", error);
    }
}

testModel();
