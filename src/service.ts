import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

let generateResponse: (query: string, apiKey: string) => Promise<string>; // Declare the function type
dotenv.config();

export async function initializeLLM(context: vscode.ExtensionContext) {
    const selectedLLM = context.workspaceState.get<string>("selectedLLM");
    
    if (selectedLLM === 'chatgpt') {
        try {
            const chatgptResponse = await import('./chatgptResponse');
            generateResponse = chatgptResponse.generateResponse;
            vscode.window.showErrorMessage('Loaded ChatGPT module');
        } catch (err) {
            console.error('Failed to load ChatGPT module:', err);
            vscode.window.showErrorMessage('Failed to load ChatGPT module');
        }
    } else if (selectedLLM === 'gemini') {
        try {
            const geminiResponse = await import('./geminiService');
            generateResponse = geminiResponse.generateResponse;
            vscode.window.showErrorMessage('Failed to load Gemini module');
        } catch (err) {
            console.error('Failed to load Gemini module:', err);
            vscode.window.showErrorMessage('Failed to load Gemini module');
        }
    } else {
        vscode.window.showErrorMessage('No valid LLM selected. Please select either ChatGPT or Gemini.');
    }
    
}

/**
 * Generate unit tests from the provided code using the selected API.
 * 
 * @param framework - The testing framework to be used.
 * @param code - The source code for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the API.
 * @returns The generated unit tests as a string.
 */
export async function generateUnitTests(framework: string, code: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Given testing framework: ${framework}. Write unit test code for the following function, ensuring that all acceptance criteria are met. In the response, only include code; if it's not code, comment it out. Add a descriptive comment above the function to explain its purpose and functionality without using any Markdown formatting. Ensure that the response is in a plain text format, without any Markdown formatting. Function Code: `;
        const response = await generateResponse(prompt + code, apiKey);
        return response; // Assuming the response contains the generated tests
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}

/**
 * Generate a filename for the provided function code.
 * 
 * @param code - The source code for which to generate a filename.
 * @param apiKey - The API key for authenticating with the API.
 * @returns The generated filename as a string.
 */
export async function generateFileName(code: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Generate a filename for testing the following function code: ${code}. Please provide only one recommended filename include extension without space.`;
        const response = await generateResponse(prompt, apiKey);
        return response; // Assuming the response contains the generated filename
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}

/**
 * Get testing frameworks based on the file extension.
 * 
 * @param extension - The extension of the file (source code).
 * @param apiKey - The API key for authenticating with the API.
 * @returns An array of testing frameworks.
 */
export async function getTestingFrameworks(extension: string, apiKey: string): Promise<string[]> {
    try {
        const prompt = `Given that the file extension is .${extension}, please list all frameworks for writing unit test source code, without any explanations. If none exist, return 'none', else return format 'a, b, c'.`;
        const response = await generateResponse(prompt, apiKey);
        if (response !== 'none') {
            const frameworksArray = response.split(",").map(item => item.trim()); // Split and trim items
            return frameworksArray; // Return the array of frameworks
        }
        return [];
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to get testing frameworks: ${errorMessage}`);
        return [];
    }
}

/**
 * Get recommended testing frameworks based on the file extension.
 * 
 * @param extension - The extension of the file (source code).
 * @param apiKey - The API key for authenticating with the API.
 * @returns The best recommended framework as a string.
 */
export async function getRecommendedTestingFrameworks(extension: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Given that the file extension is .${extension}, provide the best framework for writing unit test source code, without any explanations. If none exist, return 'none'.`;
        const response = await generateResponse(prompt, apiKey);
        return response; // Return the recommended framework
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to get recommended testing frameworks: ${errorMessage}`);
        return '';
    }
}

/**
 * Validate unit tests against acceptance criteria using the selected API.
 * 
 * @param acceptanceCriteria - The criteria against which the tests are validated.
 * @param apiKey - The API key for authenticating with the API.
 * @returns The validation results.
 */
export async function validateTests(acceptanceCriteria: string, apiKey: string): Promise<string> {
    try {
        const prompt = `Validate the following unit tests against the provided acceptance criteria and ensure they meet the following requirements: ${acceptanceCriteria}`;
        const response = await generateResponse(prompt, apiKey);
        return response; // Assuming the response contains the validation results
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to validate tests: ${errorMessage}`);
        return '';
    }
}
