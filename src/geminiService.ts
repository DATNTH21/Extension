import * as vscode from 'vscode';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();
async function generateResponse(query: string, apiKey: string): Promise<string> {
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

/**
 * Generate unit tests from the provided code using the Gemini API.
 * 
 * @param code - The source code for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The generated unit tests as a string.
 */
export async function generateUnitTests(framework:string, code: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Given testing framework: ${framework}. Write unit test code for the following function, ensuring that all acceptance criteria are met. In the response, only include code; if it's not code, comment it out. Add a descriptive comment above the function to explain its purpose and functionality without using any Markdown formatting. Ensure that the response is in a plain text format, without any Markdown formatting. Function Code: `;
        // You can still call the Gemini API here for unit tests generation
        const response = await generateResponse(prompt + code, apiKey);
        return response; // Assuming the response contains the generated tests
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}

/**
 * Generate unit tests from the provided code using the Gemini API.
 * 
 * @param code - The source code for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The generated unit tests as a string.
 */
export async function generateFileName(code: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Generate a filename for testing the following function code: ${code}. Please provide only one recommended filename without space.`;
        // You can still call the Gemini API here for unit tests generation
        const response = await generateResponse(prompt, apiKey);
        return response; // Assuming the response contains the generated tests
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}

/**
 * Generate unit tests from the provided code using the Gemini API.
 * 
 * @param extension - The extension of file (source code) for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The generated unit tests as a string.
 */
export async function getTestingFrameworks(extension: string, apiKey: string){
    try {
        const prompt = `Given that the file extension is .${extension}, please list all frameworks for writing unit test source code, without any explanations. If none exist, return 'none', esle rerurn format 'a, b, c'.`
        // You can still call the Gemini API here for unit tests generation
        const response = String(await generateResponse(prompt, apiKey));
        if (response !== 'none') {
            const frameworksArray = response.split(",").map(item => item.trim()); // Split and trim items
            return frameworksArray; // Return the array of frameworks
        }
        return [];
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to get testing frameworks, ${errorMessage}`);
        return [];
    }
}

/**
 * Generate unit tests from the provided code using the Gemini API.
 * 
 * @param extension - The extension of file (source code) for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The generated unit tests as a string.
 */
export async function getRecommendedTestingFrameworks(extension: string, apiKey: string){
    try {
        const prompt = `Given that the file extension is .${extension}, Provide the best framework for writing unit test source code, without any explanations. If none exist, return 'none'.`
        // You can still call the Gemini API here for unit tests generation
        const response = String(await generateResponse(prompt, apiKey));
        return response; // Return the array of frameworks
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to get testing frameworks, ${errorMessage}`);
        return [];
    }
}

/**
 * Validate unit tests against acceptance criteria using the Gemini API.
 * 
 * @param acceptanceCriteria - The criteria against which the tests are validated.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The validation results.
 */
export async function validateTests(acceptanceCriteria: string, apiKey: string): Promise<string> {
    try {
        const acceptvalues = "Validate the following unit tests against the provided acceptance criteria and ensure they meet the following requirements: ";
        const response = generateResponse(acceptvalues + acceptanceCriteria, apiKey);
        return response; // Assuming the response contains the validation results
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}
