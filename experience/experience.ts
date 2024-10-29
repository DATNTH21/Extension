//// TEST
// Import the generateResponse function from geminiService
import { generateResponse } from './geminiResponse';
import * as path from 'path';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';

// Function to write unit test content to a file
async function writeUnitTest(filePath: string, unit_test: string): Promise<void> {
    try {
        await fs.writeFile(filePath, unit_test);
        console.log('File written successfully');
    } catch (error) {
        console.error(`Failed to write file: ${(error as Error).message}`);
    }
}

// Function to read file content from a specified file path
async function readFileContent(filePath: string): Promise<string> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data; // Return the file content
    } catch (error) {
        console.error(`Failed to read file: ${(error as Error).message}`);
        throw error; // Re-throw the error for further handling if needed
    }
}

interface FunctionTuple {
    name: string;
    code: string;
}
function processString(input: string): string[] {
    // Remove the first and last lines (the backticks)
    const cleanedInput = input.split('\n').slice(1, -1).join('\n');

    // Split the string by ':>'
    const result = cleanedInput.split(':>').map(line => line.trim()).filter(line => line.length > 0);

    return result;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Use the function
async function main() {
    const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    const filePath = './basic.txt';
    try {
        const code = await readFileContent(filePath);
        const language = 'C++';
        // const code_review =`Review the following code for completeness and syntax correctness: ${code}. Respond with "valid" if it is correct not explain anything, or "non valid" if it is incorrect, providing a brief reason for the invalidity.`;
        // const validCode = await generateResponse(code_review, apiKey);
        try{
            //if(validCode.replace(/\s+/g, '') == 'valid'){
                // const get_framework_list = `Provide a list of top 5 popular testing frameworks for ${language}. Format the response as a comma-separated list (a, b, c) without any explanations.`
                // const frameworks = await generateResponse(get_framework_list, apiKey);
                //console.log(frameworks);
                try{
                    // const splited_code = `Prompt: You are an AI code formatting assistant. Your task is to seperate the following code to many min functions (not including library, defined variables;) format it into a single string (plain text), where each function is separated by :>
                    // // Please provide the output without any additional information or context, just return the formatted string.
                    // // Here's the code:${code}`;
                    // const responseString = await generateResponse(splited_code, apiKey);
                    // const functions = processString(responseString);
                    let currentIndex01 = 0;
                    while (currentIndex01 < functions.length) {
                        const func = functions[currentIndex01];
                        console.log("**CODE: \n" +func +"\n");
                        if(currentIndex01 == 0){
                            try{
                                // const get_function_types =  `Provide a comprehensive list of function types in ${language} for my code. Include all relevant categories, such as pure functions, anonymous functions, higher-order functions, and any other types specific to the language. Respond in the format array: function type 01, function type 02, function type 03, ... without explanations or hierarchies.
                                // // Here's the code: ${func}`;
                                // const function_types_res = await generateResponse(get_function_types, apiKey);
                                // const function_types = function_types_res.replace(/^array:\s*/, '').split(', ').map(item => item.trim());
                                console.log("**TYPES:\n" + function_types +"\n");
                                let currentIndex02 = 0;
                                while (currentIndex02 < function_types.length) {
                                    const type = function_types[currentIndex02];
                                    console.log("***TYPE:\n" + type +"\n");
                                    const functiontype_focus = `Provide a structured TypeScript (Array<{ focusKey: string; testCases: Array<string> }>) array containing test focus keys and associated test cases specifically for the function types ${type}. Each focus key should include relevant test cases that outline the different aspects to be tested. Not explain anything` 
                                    
                                    let focuskeys ='';
                                    let attempt = 0;
                                    const maxRetries = 5;
                                    while (attempt < maxRetries) {            
                                        try{
                                            // focuskeys = await generateResponse(functiontype_focus, apiKey);
                                            //console.log("***FOCUS KEY:\n"+focuskeys);
                                            currentIndex02++;
                                            attempt = maxRetries;
                                        }
                                        catch (error: any) { // Using 'any' type for error to avoid type issues
                                            if (error.status === 429) {
                                                attempt++;
                                                const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                                                console.log(`Rate limit exceeded. Attempt ${attempt} for item "${currentIndex02}". Waiting for ${waitTime / 1000} seconds...`);
                                                await delay(waitTime); // Wait before retrying the same item
                                            } else {
                                                console.error(`Error processing "${currentIndex02++}":`, error);
                                                currentIndex02++; // Move to the next item for other errors
                                                break; // Exit retry loop for other errors
                                            }
                                        }
                                    }
                                    const functional_prompt = `Generate testing code based on the following input:
                                    Language: ${language}
                                    Framework: ${selectedframework},
                                    Code: ${func}
                                    Function Type: ${type}
                                    Coverage All Test Focus: ${focuskeys}. In the response, only include code; if it's not code, comment it out. Add a descriptive comment above the function to explain its purpose and functionality without using any Markdown formatting. Ensure that the response is in a plain text format, without any Markdown formatting.`
                                    const unit_test = await generateResponse(functional_prompt, apiKey);

                                    let attempt01 = 0;
                                    console.log("***FOCUS KEY:\n"+focuskeys);
                                    while (attempt01 < maxRetries) {            
                                        try{
                                            const unit_test = await generateResponse(functional_prompt, apiKey);
                                            await fs.writeFile("focus.txt", "CODE:\n" +func+"\n"+focuskeys);
                                            await fs.writeFile("test.txt", unit_test);
                                            //console.log("***FOCUS KEY:\n"+focuskeys);
                                            currentIndex02++;
                                            attempt01 = maxRetries;
                                        }
                                        catch (error: any) { // Using 'any' type for error to avoid type issues
                                            if (error.status === 429) {
                                                attempt01++;
                                                const waitTime = Math.pow(2, attempt01) * 1000; // Exponential backoff
                                                console.log(`Rate limit exceeded. Attempt ${attempt01} for item "${currentIndex02}". Waiting for ${waitTime / 1000} seconds...`);
                                                await delay(waitTime); // Wait before retrying the same item
                                            } else {
                                                console.error(`Error processing "${currentIndex02++}":`, error);
                                                currentIndex02++; // Move to the next item for other errors
                                                break; // Exit retry loop for other errors
                                            }
                                        }
                                    }    

                            }
                            }
                        
                            catch (error){
                                console.error("Error when split code!", error);
                            }
                            break;
                        }
                        currentIndex01++;
                    }
                }
                catch{

                }
            }
            else{
    
            }
    
        }
        catch (error){
            console.error("Error when get frameworks list!", error);
        }
    } catch (error) {
        console.error("Error when valid code!", error);
    }
}

// Execute the main function
main();
