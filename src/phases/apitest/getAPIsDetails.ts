import * as fs from 'fs';
import * as path from 'path';

import { initializeLLM } from '../../setting/extensionSetup';
import { retryOn429 } from '../../utils/fix429';
import { extractCode } from '../../utils/extractCode';
const generateResponse = initializeLLM();

export async function getAPIsDetails(programminglanguage: string, source: string): Promise<any[]> {
    // apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getPromptFile = path.join(__dirname, 'prompts/api_testing/getAPIsDetails.txt');
    const prompt = `Analyze the provided {PROGRAMMING LANGUAGE} code for API definitions in the SOURCE CODE. Extract the following details for each API endpoint:
        1. HTTP METHOD: The HTTP verb used (e.g., GET, POST, PUT, PATCH, DELETE).

        2. URL: The endpoint's relative URL.

        3. HEADERS: Any required headers for the request (if mentioned in the code).

        4. REQUEST BODY: The JSON structure for the request body (if applicable).

        5. Response: The type of response the API returns.

        Format Output Example:
        {
        "apis": [
        {
            "method": "GET",
            "url": "/api/books",
            "headers": null,
            "request_body": null, 
            "response": [
                { 
                    "id": 1, 
                    "title": "Book Title",
            
                    "author": "Author Name",
                    "publishedYear": 2023
                }
            ],
            "description": "Retrieves a list of all books."
        },..
        ]
        }

        Source Code: {sourcecode}
        Output?
        `;

    // const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
    // source = fs.readFileSync(fileCode, 'utf8');
    
    const input = prompt.replace('{PROGRAMMING LANGUAGE}', programminglanguage)
    .replace('{sourcecode}', source);
     try {
            const result = await retryOn429(async () => {
                return (await generateResponse)(input);
            });
            const jsonString = extractCode(result);
            if(jsonString!= null){
                const parsedJson = JSON.parse(jsonString);
                const apisArray = parsedJson.apis;
                if(apisArray){
                    return Promise.resolve(apisArray);
                }
            }
            return [];
            
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}            