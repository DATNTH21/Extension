import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { sleep } from '../../utils/sleep';
import { extractCode } from '../../utils/extractCode';
import { initializeLLM } from '../../setting/extensionSetup';

const generateResponse = initializeLLM();

export async function genUITestScript(tool: string, language: string, source: string): Promise<string> {
    const prompt = `Generate a UI testing script for the following code snippet using the specified testing tool. The script should test all UI elements, interactions, and behaviors detected in the code. Ensure full coverage, including rendering, user interactions, and edge cases. Use best practices for the selected testing tool. Respond only with the file without any explanations.

                    Testing Tool: ${tool}
                    Script language: ${language}
                    Code: ${source}  
    `;

    try {
        const uittest = (await generateResponse)(prompt);
        console.log("Generated testing script");
        return String(extractCode(await uittest)); // Ensure unittest is a string before extraction
    } catch (err) {
        console.error('Error generating testing script:', err);
        throw err;
    }
}
