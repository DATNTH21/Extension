import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

let generateResponse: (query: string) => Promise<string>; 
dotenv.config();
const configuration = vscode.workspace.getConfiguration();
const apis = configuration.get<Record<string, string>>('llmExtension.apis');

export async function initializeLLM(): Promise<typeof generateResponse> {
    let responseMessage = '';
    const selectedLLM = apis?.llm_active;

    if (!selectedLLM) {
        vscode.window.showErrorMessage('No LLM selected. Please choose a valid LLM.');
    }

    try {
        if (selectedLLM === 'gpt') {
            const chatgptResponse = await import('../llms/chatgptResponse');
            generateResponse = chatgptResponse.generateResponse;
            responseMessage = 'Loaded ChatGPT module';
            // vscode.window.showInformationMessage(responseMessage);  // Use Information Message for success
        } 
        else if (selectedLLM === 'gemini') {
            const geminiResponse = await import('../llms/geminiResponse');
            generateResponse = geminiResponse.generateResponse;
            responseMessage = 'Loaded Gemini module';
            // vscode.window.showInformationMessage(responseMessage);  // Use Information Message for success
        } else {
            responseMessage = 'No valid LLM selected. Please select either ChatGPT or Gemini.';
            // vscode.window.showErrorMessage(responseMessage);
        }
    } catch (err) {
        console.error('Failed to load LLM module:', err);
        vscode.window.showErrorMessage('Failed to load LLM module.');
    }

    return generateResponse;
}
