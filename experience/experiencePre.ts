//// TEST
// Import the generateResponse function from geminiService
import { 
    detectLanguages,
    getCodeReviewResponse, 
    getFrameworkList, 
    splitCodeToFunctions, 
    getFunctionTypes, 
    getFunctionTypeFocusKeys, 
    generateTestingCode 
} from './responseGenerator';
import * as fa from 'fs';
import {readFileContent, createTestFile} from './file_utils'
import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from './geminiResponse';



// Use the function
export async function getTestScope(source: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getTestScope.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');

    const fileCode = path.join(__dirname, 'Input/source.txt');
    source = fa.readFileSync(fileCode, 'utf8');

    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/preprocessing/TestScope.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

export async function getCodeStruct(source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const fileCode = path.join(__dirname, 'Input/source.txt');
    const fileTest = path.join(__dirname, 'Input/test90.txt');
    source = fa.readFileSync(fileCode, 'utf8');
    test = fa.readFileSync(fileTest,'utf8');

    const getTestCoveragePromptFile = path.join(__dirname, 'prompts/preprocessing/getTestStruct.txt');
    const prompt = fa.readFileSync(getTestCoveragePromptFile, 'utf8');
    var input = prompt.replace('{Sourcecode}', source);
    input = input.replace('{Testcode}', test);
    console.log(input);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/preprocessing/StructTest.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}            


getTestScope('','');