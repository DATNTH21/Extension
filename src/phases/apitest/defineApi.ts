import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM } from '../../setting/extensionSetup';
import { retryOn429 } from '../../utils/fix429';
import { extractCode } from '../../utils/extractCode';

const generateResponse = initializeLLM();

export async function defineApi(path_code: string): Promise<string> {
    try {
        // Load the API definition prompt template
        const promptTemplate = `Given the source code of a project, please identify all API endpoints defined in the code.
        This code may include files such as controllers, routes, and handlers, which contain logic for processing HTTP requests.
        * Input Example:
        ** Code:
        // routes.go
            r.HandleFunc("/books", GetBooksHandler).Methods("GET")
            r.HandleFunc("/books/{id}", GetBookByIDHandler).Methods("GET")
            r.HandleFunc("/books", CreateBookHandler).Methods("POST")
        * Output Example:
        {
        "api_endpoints": [
            {
            "method": "GET",
            "path": "/books",
            "handler_function": "GetBooksHandler",
            },
            {
            "method": "GET",
            "path": "/books/{id}",
            "handler_function": "GetBookByIDHandler",
            },
            {
            "method": "POST",
            "path": "/books",
            "handler_function": "CreateBookHandler",
            }
        ]
        }
        or return 'none' if not any api.
        with this Input: {Code}, Output (json or 'none')?`

        // Read source code from the given file path
        const sourceCode = await fs.readFile(path_code, 'utf8');

        // Prepare the input by replacing placeholders
        const input = promptTemplate.replace('{Code}', sourceCode);

        // Call the LLM with retry mechanism for handling rate limits
        const rawResponse = await retryOn429(async () => (await generateResponse)(input));
        
        // Extract the JSON output from the response
        const apiList = extractCode(rawResponse) || 'none';

        // Define output file path and ensure directories exist
        const outputFilePath = path.join(__dirname, 'Output/api_testing/ApiList.txt');
        await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

        // Write the extracted API list to the output file
        await fs.writeFile(outputFilePath, apiList, 'utf8');

        return apiList;
    } catch (error) {
        console.error('Error defining API:', error);
        throw error;
    }
}
