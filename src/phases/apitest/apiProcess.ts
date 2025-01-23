import * as path from 'path';
import { promises as fs } from 'fs';
import { initializeLLM } from '../../setting/extensionSetup';
import { getAPIsDetails } from './getAPIsDetails';
import { getTestCasesByMethod } from '../../utils/parseApiTestCases';
const generateResponse = initializeLLM();

export async function genApitest(programminglanguage: string, framework: string, source: string): Promise<string> {
    const prompt = `Input Parameters:
    Programming Language: {programminglanguage}
    Framework: {framework}
    API Details: {apidetails}
    Test cases: {testcase}
    Output: API Testing code ready to run`;

    let input = prompt.replace('{programminglanguage}', programminglanguage)
        .replace('{framework}', framework);

    try {
        const apis = await getAPIsDetails(programminglanguage, source);
        let apitest = '';  // Initialize apitest here

        // Use for...of to handle async operations in a loop
        for (let api of apis) {
            const testcase = getTestCasesByMethod(api.method);

            // Replace placeholders in input for each API
            let apiInput = input.replace('testcase', testcase).replace('apidetails', JSON.stringify(api));

            // Generate the test case and append it to the result
            const apiTestResult = await (await generateResponse)(apiInput);
            apitest += apiTestResult.toString();
        }
        
        return apitest;
    } catch (error) {
        console.error('Error generating API test cases:', error);
        throw new Error(`Failed to generate API test cases. ${error}`);
    }
}
