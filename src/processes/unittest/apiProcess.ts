import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM } from '../../setting/extensionSetup';
import { retryOn429 } from '../../utils/fix429';
import { extractCode } from '../../utils/extractCode';
const generateResponse = initializeLLM();

export async function genMockingApitest(
    programmingLanguage: string,
    framework: string,
    source: string
): Promise<string> {
    try {
        // Load the prompt template
        const promptTemplate = `Generate the unit test for all API endpoints in {LANGUAGE} using the testing framework: {framework}.
The test should not call the real API but should use mocking to simulate API behavior. The test should:
Create a mock request to the API endpoint.
Use a mock server or a suitable mocking mechanism to handle the request.
Ensure the API handler processes the request and returns a response.
Assert that the response contains the expected status code (e.g., 200 OK), all cases: wrong and right.
Decode and verify the response body matches mock data.
Validate specific fields in the response.
Based on the following code:
{Code}
Noted: Output only be {LANGUAGE} code , if explain anything, comment it.`;

        // Replace placeholders with actual values
        const input = promptTemplate
            .replace('{LANGUAGE}', programmingLanguage)
            .replace('{framework}', framework)
            .replace('{Code}', source);

        // Generate API test using LLM with retry mechanism
        const apiTestCode = await retryOn429(async () => (await generateResponse)(input));

        return String(extractCode(apiTestCode));
    } catch (error) {
        console.error('Error generating API test:', error);
        throw error;
    }
}
