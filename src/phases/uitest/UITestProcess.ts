import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { sleep } from '../../utils/sleep';
import { extractCode } from '../../utils/extractCode';
import { initializeLLM } from '../../setting/extensionSetup';

const generateResponse = initializeLLM();

// Generate a UI testing script for the given code snippets using the specified testing tool.
//                     The script must:
//                     Detect and test all UI elements present in the provided code.
//                     Cover rendering, interactions, and behaviors relevant to the detected UI.
//                     Handle different UI types (web, mobile, or Windows) based on the provided code.
//                     Simulate user interactions (clicks, inputs, gestures, keyboard navigation, etc.).
//                     Include assertions to verify expected UI behavior.
//                     Manage asynchronous operations (e.g., animations, loading states, delayed UI updates).
//                     Test edge cases and error handling (invalid inputs, missing fields, unexpected actions).
//                     Detect if the UI interacts with APIs (fetching, submitting, or processing data).
//                     Mock API responses to test UI behavior under different conditions (success, failure, timeout).
//                     Follow best practices for the selected testing tool and language.
//                     Use modular and maintainable test functions to ensure reusability.

//                     Testing Tool: ${tool}
//                     Script language: ${language}
//                     Code: ${source}  

export async function genUITestScript(tool: string, language: string, source: string): Promise<string> {
    const prompt = `Generate a UI testing script for the given code snippets using the specified testing tool.
                    The script must:
                    Detect and fully test all UI elements present in the provided code. Write fully implemented test cases for each detected component and feature, do not leave placeholders or add comments suggesting more tests—write them.
                    Cover rendering, interactions, and behaviors relevant to the detected UI.
                    Handle different UI types (web, mobile, or Windows) based on the provided code.
                    Simulate user interactions (clicks, inputs, gestures, keyboard navigation, etc.).
                    Include assertions to verify expected UI behavior.
                    Manage asynchronous operations (e.g., animations, loading states, delayed UI updates).
                    Test edge cases and error handling (invalid inputs, missing fields, unexpected actions).
                    Detect if the UI interacts with APIs (fetching, submitting, or processing data).
                    Make sure to mock API responses to test UI behavior under different conditions (success, failure, timeout).
                    Follow best practices for the selected testing tool and language.
                    Use modular and maintainable test functions to ensure reusability.
                    Insert comments or placeholders for required pre-processing steps (e.g., login, setup, navigation, data seeding) if needed.

                    Testing Tool: ${tool}
                    Script language: ${language}
                    Code: ${source}
                    Respond only with the file without any explanations.`;

    try {
        const uittest = (await generateResponse)(prompt);
        console.log("Generated testing script");
        return String(extractCode(await uittest)); // Ensure unittest is a string before extraction
    } catch (err) {
        console.error('Error generating testing script:', err);
        throw err;
    }
}