import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { sleep } from '../../utils/sleep';
import { extractCode } from '../../utils/extractCode';
import { initializeLLM } from '../../setting/extensionSetup';
import { getUIBehaviour, getUIComponentStruct, getUIState } from './getUIInformation';

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
    let UIComponent, UIBehaviour, UIState;

    try {
        UIComponent = await getUIComponentStruct(source);
        console.log("Got UI Component Structure");
        UIBehaviour = await getUIBehaviour(source);
        console.log("Got UI Behaviours and Events")
        UIState = await getUIState(source);
        console.log("Got UI State");
    } catch (error) {
        console.error("Error during processing:", error);
        throw error;
    }

    const prompt = `Generate a UI testing script for the given code snippets using the specified testing tool.
                    The script must:
                    Detect and fully test all UI elements present in the provided code.
                    Cover rendering, interactions, and behaviors relevant to the detected UI.
                    Handle different UI types (web, mobile, or Windows) based on the provided code.
                    Simulate user interactions (clicks, inputs, gestures, keyboard navigation, etc.).
                    Make sure to include assertions to verify expected UI behavior.
                    Manage asynchronous operations (e.g., animations, loading states, delayed UI updates).
                    Test edge cases and error handling (invalid inputs, missing fields, unexpected actions).
                    Detect if the UI interacts with APIs (fetching, submitting, or processing data).
                    Make sure to mock API responses to test UI behavior under different conditions (success, failure, timeout).
                    Make sure to include required pre-processing steps (e.g., login, setup, navigation, data seeding) if needed.

                    Testing Tool: ${tool}
                    Script language: ${language}
                    Code: ${source}
                    UI Component Structure: ${UIComponent}
                    UI Behaviors and Events: ${UIBehaviour}
                    UI State and Data flows: ${UIState} 
                    Follow best practices for the selected testing tool and language.
                    Use modular and maintainable test functions to ensure reusability.
                    Write fully implemented test cases for each detected component and feature, try your best to avoid leaving placeholders or add comments suggesting.
                    Respond only with the file without any explanations.`;

    try {
        const uittest = (await generateResponse)(prompt);
        console.log("Generated UI testing script");
        return String(extractCode(await uittest)); // Ensure unittest is a string before extraction
    } catch (err) {
        console.error('Error generating testing script:', err);
        throw err;
    }
}