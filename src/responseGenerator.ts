import { generateResponse } from './geminiResponse';
import * as path from 'path';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';

export async function getCodeReviewResponse(code: string, apiKey: string): Promise<string> {
    const codeReviewPrompt = `Review the following code for completeness and syntax correctness: ${code}. Respond with "valid" if it is correct not explain anything, or "non valid" if it is incorrect, providing a brief reason for the invalidity.`;
    
    try {
        const validCode = await generateResponse(codeReviewPrompt, apiKey);
        return validCode.replace(/\s+/g, '');
    } catch (error) {
        console.error("Error while generating response:", error);
        throw error;
    }
}

export async function getFrameworkList(language: string, apiKey: string): Promise<string[]> {
    const getFrameworkListPrompt = `Provide a list of top 5 popular testing frameworks for ${language}. Format the response as a comma-separated list (a, b, c) without any explanations.`;
    
    try {
        const response = await generateResponse(getFrameworkListPrompt, apiKey);
        const frameworks = response.split(",");
        return frameworks;
    } catch (error) {
        console.error("Error while fetching framework list:", error);
        throw error;
    }
}

export async function splitCodeToFunctions(code: string, apiKey: string): Promise<string[]> {
    const splitCodePrompt = `Prompt: You are an AI code formatting assistant. Your task is to separate the following code into multiple mini functions (not including library, defined variables;) and format it into a single string (plain text), where each function is separated by :>. Please provide the output without any additional information or context, just return the formatted string. Here's the code:${code}`;
    
    try {
        const responseString = await generateResponse(splitCodePrompt, apiKey);
        
        // Tách các hàm dựa trên định dạng ":>"
        const functions = responseString.split(":>");
        
        // Loại bỏ các khoảng trắng dư thừa ở đầu và cuối mỗi hàm
        return functions.map(func => func.trim());
    } catch (error) {
        console.error("Error while splitting code into functions:", error);
        throw error;
    }
}

export async function getFunctionTypes(language: string, func: string, apiKey: string): Promise<string[]> {
    const getFunctionTypesPrompt = `Provide a comprehensive list of function types in ${language} for my code. Include all relevant categories, such as pure functions, anonymous functions, higher-order functions, and any other types specific to the language. Respond in the format array: function type 01, function type 02, function type 03, ... without explanations or hierarchies. Here's the code: ${func}`;
    
    try {
        const functionTypesRes = await generateResponse(getFunctionTypesPrompt, apiKey);
        
        // Xử lý phản hồi để tách danh sách loại hàm
        const functionTypes = functionTypesRes.replace(/^array:\s*/, '').split(', ').map(item => item.trim());
        
        return functionTypes;
    } catch (error) {
        console.error("Error while fetching function types:", error);
        throw error;
    }
}

export async function getFunctionTypeFocusKeys(type: string, apiKey: string): Promise<Array<{ focusKey: string; testCases: Array<string> }>> {
    const functionTypeFocusPrompt = `Provide a structured TypeScript (Array<{ focusKey: string; testCases: Array<string> }>) array containing test focus keys and associated test cases specifically for the function types ${type}. Each focus key should include relevant test cases that outline the different aspects to be tested. Not explain anything.`;

    try {
        const focusKeysResponse = await generateResponse(functionTypeFocusPrompt, apiKey);
        
        // Chuyển đổi chuỗi phản hồi thành một mảng cấu trúc
        const focusKeys: Array<{ focusKey: string; testCases: Array<string> }> = JSON.parse(focusKeysResponse);
        
        return focusKeys;
    } catch (error) {
        console.error("Error while fetching function type focus keys:", error);
        throw error;
    }
}

export async function generateTestingCode(
    language: string,
    selectedFramework: string,
    func: string,
    type: string,
    focusKeys: { focusKey: string; testCases: Array<string> },
    apiKey: string
): Promise<string> {
    const focusKeysString = JSON.stringify(focusKeys); // Chuyển đổi focus keys thành chuỗi JSON
    
    const functionalPrompt = `Generate testing code based on the following input:
    Language: ${language}
    Framework: ${selectedFramework}
    Code: ${func}
    Function Type: ${type}
    Coverage All Test Focus: ${focusKeysString}. In the response, only include code; if it's not code, comment it out. Add a descriptive comment above the function to explain its purpose and functionality without using any Markdown formatting. Ensure that the response is in a plain text format, without any Markdown formatting.`;

    try {
        const unitTest = await generateResponse(functionalPrompt, apiKey);
        return unitTest;
    } catch (error) {
        console.error("Error while generating testing code:", error);
        throw error;
    }
}

export async function detectLanguages(code: string, apiKey: string): Promise<string[]> {
    const detectedLanguagesPrompt = `List the detected programming languages for the following code: ${code}. Respond only with a comma-separated list without explanations.`;
    
    try {
        const response = await generateResponse(detectedLanguagesPrompt, apiKey);
        // Split the response by commas and trim any extra spaces
        const languages = response.split(',').map(lang => lang.trim());
        return languages;
    } catch (error) {
        console.error("Error while detecting languages:", error);
        throw error;
    }
}
