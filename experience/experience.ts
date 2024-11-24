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
export async function getCodeStruct(source: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    const getCodeCoveragePromptFile = path.join(__dirname, 'prompts/getCodeStruct.txt');
    const fileCode = path.join(__dirname, 'Input/source.txt');
    const prompt = fa.readFileSync(getCodeCoveragePromptFile, 'utf8');
    source = fa.readFileSync(fileCode, 'utf8');
    const input = prompt + '\n' + source;
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/StructCode.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

export async function getTestStruct(source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const fileCode = path.join(__dirname, 'Input/source.txt');
    const fileTest = path.join(__dirname, 'Input/test90.txt');
    source = fa.readFileSync(fileCode, 'utf8');
    test = fa.readFileSync(fileTest,'utf8');

    const getTestCoveragePromptFile = path.join(__dirname, 'prompts/getTestStruct.txt');
    const prompt = fa.readFileSync(getTestCoveragePromptFile, 'utf8');
    var input = prompt.replace('{Sourcecode}', source);
    input = input.replace('{Testcode}', test);
    console.log(input);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/StructTest.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}            

export async function getCoverageReport(source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getCoveragePromptFile = path.join(__dirname, 'prompts/getCoverage.txt');
    const prompt = fa.readFileSync(getCoveragePromptFile, 'utf8');
    const CodeStruct = await getCodeStruct(source,apiKey);
    const TestStruct = await getTestStruct(source, test, apiKey);

    var input = prompt.replace('sourceCode', CodeStruct);
    input = input.replace('testCode', TestStruct);
    console.log(input);

    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/TestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}       

export async function checkUncovered(source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    const getPromptFile = path.join(__dirname, 'prompts/checkUncovered.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    const fileCode = path.join(__dirname, 'Input/source.txt');
    const fileTest = path.join(__dirname, 'Input/test90.txt');
    source = fa.readFileSync(fileCode, 'utf8');
    test = fa.readFileSync(fileTest,'utf8');
    const report = await getCoverageReport(source, test, apiKey);
    // const uncovered = await generateResponse('Get uncovered (keep format json) from: '+ report, apiKey);
    // console.log(uncovered);
    
    var input = prompt.replace('{sourcecode}', source);
    input = input.replace('{testcode}', test);
    input = input.replace('{report}', report);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/CheckedTestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}     

export async function checkUncoverage(source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    const getPromptFile = path.join(__dirname, 'prompts/checkCoverage.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    const fileCode = path.join(__dirname, 'Input/source.txt');
    const fileTest = path.join(__dirname, 'Input/test90.txt');
    source = fa.readFileSync(fileCode, 'utf8');
    test = fa.readFileSync(fileTest,'utf8');
    const report = await getCoverageReport(source, test, apiKey);
    // const uncovered = await generateResponse('Get uncovered (keep format json) from: '+ report, apiKey);
    // console.log(uncovered);
    
    var input = prompt.replace('{sourcecode}', source);
    input = input.replace('{testcode}', test);
    // input = input.replace('{report}', report);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/CheckedCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}     
// Execute the main function
// getCodeCoverage('','');
// getTestCoverage('','' ,'' );
// getCoverageReport('', '', '');
// checkUncovered('', '', '');
checkUncoverage('', '', '');