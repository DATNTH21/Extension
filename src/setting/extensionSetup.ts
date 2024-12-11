import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

let generateResponse: (query: string, apiKey: string) => Promise<string>; 
dotenv.config();

export async function initializeLLM(context: vscode.ExtensionContext) {
    const selectedLLM = context.workspaceState.get<string>("selectedLLM");
    
    if (selectedLLM === 'chatgpt') {
        try {
            const chatgptResponse = await import('../llms/chatgptResponse');
            generateResponse = chatgptResponse.generateResponse;
            vscode.window.showErrorMessage('Loaded ChatGPT module');
        } catch (err) {
            console.error('Failed to load ChatGPT module:', err);
            vscode.window.showErrorMessage('Failed to load ChatGPT module');
        }
    } else if (selectedLLM === 'gemini') {
        try {
            const geminiResponse = await import('../llms/geminiResponse');
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

