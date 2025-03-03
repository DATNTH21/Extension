import * as vscode from 'vscode';
import { retryOn429 } from './fix429';
import { initializeLLM } from '../setting/extensionSetup';
import { extractCode } from './extractCode';

const generateResponse = initializeLLM();

export async function getCodeReviewResponse(code: string): Promise<string> {
    const codeReviewPrompt = `Review the following code for completeness and syntax correctness: ${code}. Respond with "valid" if it is correct not explain anything, or "non valid" if it is incorrect, providing a brief reason for the invalidity.`;

    return retryOn429(async () => {
        const validCode = await (await generateResponse)(codeReviewPrompt);
        return validCode.replace(/\s+/g, '');
    });
}

export async function getFrameworkList(language: string, code: string): Promise<string[]> {
    const getFrameworkListPrompt = `Provide a list of top 5 popular testing frameworks(libraries) in ${language} and most suitable for test this code: ${code}
    . Format the response as a comma-separated list (a, b, c) without any explanations.`;

    return retryOn429(async () => {
        const response = await (await generateResponse)(getFrameworkListPrompt);
        return response.split(',').map(fw => fw.trim());
    });
}

export async function splitCodeToFunctions(code: string): Promise<string[]> {
    const splitCodePrompt = `Prompt: You are an AI code formatting assistant. Your task is to separate the following code into Class or Function code (not including library, defined variables;) and format it into a single string (plain text), where each one is separated by :>. Please provide the output without any additional information or context, just return the formatted string. Here's the code:${code}`;

    return retryOn429(async () => {
        const responseString = await (await generateResponse)(splitCodePrompt);
        return responseString.split(":>").map(func => func.trim());
    });
}

export async function getProgrammingLanguages(filename: string) {
    const detectedLanguagesPromptByFileName = `Given a file with a specific extension, identify the programming language of the file and determine if it supports unit testing. Return the language name if it's one that commonly supports unit testing, and return 'none' if the file extension does not correspond to a programming language that supports unit testing. 
 Supported programming languages for unit testing include, but are not limited to, JavaScript (Jest, Mocha), Python (PyTest, unittest), Java (JUnit), TypeScript (Jest), C# (NUnit, MSTest), Ruby (RSpec), Go (testing), PHP (PHPUnit), Swift (XCTest), Kotlin (JUnit), Scala (ScalaTest). If the extension doesn't correspond to any of these languages, return 'none' else return programming language name (not explain anything) Input filename: ${filename}`;
    return retryOn429(async () => {
        return await (await generateResponse)(detectedLanguagesPromptByFileName);
    });
}

export async function getRecommendFramework(language: string, code: string) {
    const recommendframework = `Given the following programming language and code, recommend the most suitable unit testing framework for this language. Only suggest one framework. If the language doesn't have a widely used testing framework, return 'none'. Provide the framework name without any extra explanation.
                                Programming Language: ${language}
                                Code: ${code}
                                Example input:
                                Programming Language: Python
                                Code:

                                python
                                Copy code
                                def add(a, b):
                                    return a + b
                                Example output:
                                unittest
                                Output (Not explain anything)?
                                `
    return retryOn429(async () => {
        return await (await generateResponse)(recommendframework);
    });
}

export async function detectLanguages(code: string): Promise<string[]> {
    const detectedLanguagesPrompt = `List the detected programming languages for the following code: ${code}. Respond only with a comma-separated list without explanations.`;

    return retryOn429(async () => {
        const response = await (await generateResponse)(detectedLanguagesPrompt);
        return response.split(',').map(lang => lang.trim());
    });
}
export async function generateFileName(code: string) {
    const createFilenamePrompt = `This is the source code: ${code}. Based on this code, suggest a suitable name for the corresponding test file. Notice: only filename, not anything`;
    return retryOn429(async () => {
        const response = await (await generateResponse)(createFilenamePrompt);
        return response.split(',').map(lang => lang.trim());
    });

}

// UITESTING
export async function getRecommendTool(code: string): Promise<string[]> {
    const recommendtool = `Analyze the provided frontend code and identify the most popular and suitable automated UI Test Automation tools that can be used, ordered from the most popular and suitable to the least. Format the response as a comma-separated list (e.g., a, b, c) without any explanations. 
                            Code: ${code}
                            `;
    return retryOn429(async () => {
        const response = await (await generateResponse)(recommendtool);
        return response.split(',').map(fw => fw.trim());
    });
}

export async function getUITestingScriptLanguage(tool: string): Promise<string> {
    const prompt = `Identify the most popular programming languages used for writing UI Testing scripts in the UI Test Automation tool ${tool}, ordered from most popular to least popular.  Return a JSON-formatted output with a key named "languages" without any explanations. `;
    return retryOn429(async () => {
        return String(extractCode(await (await generateResponse)(prompt)));
    });
}

export async function detectUIRelatedFiles(foldertree: string[]): Promise<string> {
    const prompt = `Given the following folder tree, identify all files relevant to UI functionality, including framework-specific components, dynamically generated UI, event handlers, and API-driven elements, that should be considered when generating a UI testing script. Ensure that files affecting web, mobile, or desktop UI are included as applicable.
                    Folder Tree: \n${foldertree.join('\n')}\n
                    Return a JSON-formatted output with a key named "files" without any explanations.`;

    return retryOn429(async () => {
        return String(extractCode(await (await generateResponse)(prompt)));
    });
}
