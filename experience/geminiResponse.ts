import * as vscode from 'vscode';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();
export async function generateResponse(query: string, apiKey: string): Promise<string> {
    // Google Generative AI configuration
    const configuration = new GoogleGenerativeAI(apiKey); // Use non-null assertion since we expect this to be defined
    const modelId = "text-embedding-004";

    // Define safety settings for content generation
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    // Retrieve the generative model
    const generativeModel = configuration.getGenerativeModel({
        model: "gemini-1.5-flash", // Use your desired model here
        safetySettings,
    });

    // Generate the response
    const result = await generativeModel.generateContent(`Question: ${query}`);
    return result.response.text(); // Assuming this returns the response text
}