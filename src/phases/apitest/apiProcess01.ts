import * as path from 'path';
import { promises as fs } from 'fs';
import { initializeLLM } from '../../setting/extensionSetup';
import { getAPIsDetails } from './getAPIsDetails';
import { getTestCasesByMethod } from '../../utils/parseApiTestCases';
import { createTestFile } from '../../utils/file_utils';
import { extractCode } from '../../utils/extractCode';
import { createTestFileS } from '../../utils/file_utils';
import { defineRelativeFiles } from './defineRelativeFiles';
import { processFiles } from '../../utils/processFiles';
import { getTree } from '../../utils/getTree';

const generateResponse = initializeLLM();
export async function genApitest(project: string, programminglanguage: string, framework: string, apis: any): Promise<string> {
    const prompt = `Write test code that calls the all real APIs and validates the response based on the given details. Not mocking route or server.
## Input Parameters:
- Programming Language: {programminglanguage}
- Framework/Library: {framework}
- The API List Details: {apidetails}

## Requirements:
- The test **must send real HTTP requests** to the actual API URL.
- Use {framework}'s **HTTP client** (e.g., requests for Python, http.Client for Go, etc.).
- Ensure the test **does not use mocks or in-memory testing**.
- Include **assertions** to validate HTTP status codes, response body structure, and key fields.
- Handle errors properly, and ensure the response is parsed correctly.
- The output should be **fully executable code**, ready to run.
### Example Output:
package Tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAddBookRealAPI(t *testing.T) {
	apiURL := "http://localhost:8080/books" // Change to actual API URL

	// Create a new book
	newBook := map[string]interface{}{
		"id":     "1",
		"title":  "The Lord of the Rings",
		"author": "J.R.R. Tolkien",
		"price":  30.99,
	}

	// Convert to JSON
	requestBody, err := json.Marshal(newBook)
	assert.NoError(t, err)

	// Create HTTP request
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(requestBody))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	// Send request to real API
	client := &http.Client{}
	resp, err := client.Do(req)
	assert.NoError(t, err)
	defer resp.Body.Close()

	// Check HTTP status
	assert.Equal(t, http.StatusCreated, resp.StatusCode, "Expected HTTP 201 Created")

	// Read response body
	bodyBytes, err := io.ReadAll(resp.Body)
	assert.NoError(t, err)

	// Debug: Print response body to check actual output
	fmt.Printf("Response Body: %s\n", string(bodyBytes))

	// Decode response body
	var responseBook map[string]interface{}
	err = json.Unmarshal(bodyBytes, &responseBook)
	assert.NoError(t, err)

	// Check if response contains the expected fields
	assert.Contains(t, responseBook, "title", "Response should contain 'title'")
	assert.Contains(t, responseBook, "author", "Response should contain 'author'")
	assert.Contains(t, responseBook, "price", "Response should contain 'price'")

	// Validate response data
	assert.Equal(t, newBook["title"], responseBook["title"], "title should match")
	assert.Equal(t, newBook["author"], responseBook["author"], "author should match")
	assert.Equal(t, newBook["price"], responseBook["price"], "price should match")

	// 🔥 Verify book exists in API (GET request)
	getResp, err := http.Get(apiURL + "/1") // Assuming API supports fetching by id
	assert.NoError(t, err)
	defer getResp.Body.Close()

	// Read GET response body
	getBodyBytes, err := io.ReadAll(getResp.Body)
	assert.NoError(t, err)
	fmt.Printf("Book from GET API: %s\n", string(getBodyBytes))

	// Decode GET response
	var getBook map[string]interface{}
	err = json.Unmarshal(getBodyBytes, &getBook)
	assert.NoError(t, err)

	// Validate book data from GET response
	assert.Equal(t, newBook["title"], getBook["title"], "GET API title should match")
	assert.Equal(t, newBook["author"], getBook["author"], "GET API author should match")
	assert.Equal(t, newBook["price"], getBook["price"], "GET API price should match")
}

## Output:
- API Testing code that **calls the real APIs**.
- Include comments if necessary, but do not add explanations outside the code.
`;
  
    let input = prompt.replace('{programminglanguage}', programminglanguage)
        .replace('{framework}', framework);

    try {
        // const testcase = getTestCasesByMethod(api.method);
        // Replace placeholders in input for each API
        let apiInput = input.replace('apidetails', apis);
        // Generate the test case and append it to the result
        const apiTestResult = await (await generateResponse)(apiInput);
        const cleanedCode = extractCode(apiTestResult);
        return String(cleanedCode);
    } catch (error) {
        console.error('Error generating API test cases:', error);
        throw new Error(`Failed to generate API test cases. ${error}`);
    }
  }
  
