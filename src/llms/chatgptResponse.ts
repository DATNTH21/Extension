import OpenAI from 'openai';
// import * as dotenv from 'dotenv';
import * as vscode from 'vscode';

const configuration = vscode.workspace.getConfiguration();
const apis = configuration.get<Record<string, string>>('llmExtension.apis');

const apiKey = String(apis?.gpt);

// Function to generate a response from OpenAI based on a given prompt
export async function generateResponse(prompt: string): Promise<string> {
    // Create a new instance of OpenAI with your API key
    const openai = new OpenAI({
        apiKey: apiKey,  // Use your OpenAI API key here
    });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // Specify the model to use
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000, // Maximum number of tokens to generate
            temperature: 0.7,  // Controls randomness: lower is more deterministic
        });
        return response?.choices?.[0]?.message?.content?.trim() || 'No response generated';
    } catch (error) {
        vscode.window.showErrorMessage(`Error generating response: ${(error as Error).message}`);
        return '';
    }
}

