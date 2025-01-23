"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fa = require("fs");
// Function to read and parse the JSON file
var readApiTestCases = function (filePath) {
    try {
        var rawData = fa.readFileSync(filePath, 'utf-8');
        var testCases_1 = JSON.parse(rawData);
        return testCases_1;
    }
    catch (error) {
        console.error('Error reading or parsing the file:', error);
        return null;
    }
};
// Function to extract test cases for a specific HTTP method
var getTestCasesByMethod = function (method, testCases) {
    if (testCases) {
        return testCases[method] || null;
    }
    return null;
};
// Example usage
var filePath = './prompts/api_testing/api_cases.json'; // Path to your JSON file
var testCases = readApiTestCases(filePath);
// Get all test cases for "GET" method
var getTestCases = getTestCasesByMethod('GET', testCases);
if (getTestCases) {
    console.log('GET Test Cases:', getTestCases);
}
else {
    console.log('No test cases found for GET method.');
}
