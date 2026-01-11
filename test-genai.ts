
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: "test" });
// @ts-ignore
console.log("Has generateContent:", !!client.models.generateContent);
// @ts-ignore
if (client.models.generateContent) {
    // @ts-ignore
    console.log("Arity:", client.models.generateContent.length);
}
