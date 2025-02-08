import * as path from 'path';
import { promises as fs } from 'fs';
import { initializeLLM } from '../../setting/extensionSetup';
import { getAPIsDetails } from './getAPIsDetails';
import { getTestCasesByMethod } from '../../utils/parseApiTestCases';
import { createTestFile } from '../../utils/file_utils';

const generateResponse = initializeLLM();
export async function genApitest(filepath: string, programminglanguage: string, framework: string, source: string): Promise<string[]> {
    const prompt = `Input Parameters:
    Programming Language: {programminglanguage}
    Framework: {framework}
    API Details: {apidetails}
    Test cases: {testcase}
    Output: API Testing code which be ready to run`;
    const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
  
    let input = prompt.replace('{programminglanguage}', programminglanguage)
        .replace('{framework}', framework);
  
    try {
        const apis = await getAPIsDetails(programminglanguage, source);
        let apitest: string[] = []; 
        // Use for...of to handle async operations in a loop
        for (let api of apis) {
            const testcase = getTestCasesByMethod(api.method);
  
            // Replace placeholders in input for each API
            let apiInput = input.replace('testcase', testcase).replace('apidetails', api);
  
            // Generate the test case and append it to the result
            const apiTestResult = await (await generateResponse)(apiInput);
            
            apitest.push(apiTestResult)
        }
        return apitest;
    } catch (error) {
        console.error('Error generating API test cases:', error);
        throw new Error(`Failed to generate API test cases. ${error}`);
    }
  }
  
