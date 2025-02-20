import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { sleep } from '../../utils/sleep';
import {
  getCodeStruct, getTestScope, getConstructors, getAuxiliaryMethods, 
  getChainToPrivateMethods, getMockingSetup
} from './experiencePre';
import { getTestStruct, getCoverageReport, checkUncovered } from './experiencePost';
import { extractCode } from '../../utils/extractCode';
import { initializeLLM } from '../../setting/extensionSetup';

const generateResponse = initializeLLM();

export async function genUnittest(programminglanguage: string, framework: string, source: string): Promise<string> {
    const prompt = `Input Parameters:
        Programming Language: {programminglanguage}
        Framework: {framework}
        Source Code: {source}
        Test Scope: {testscope}
        Constructors: {constructors}
        Auxiliary Methods: {auxiliarymethods}
        Chain to Private Methods: {chainedmethods}
        Mocking Setup: {mockingsetup}
        Source Structure: {sourcestructure}

        Generate the most comprehensive unittest for the provided source code, ensuring high coverage and a wide range of test cases. The tests should:
        Init object of class, use object to call methods in class (if necessary).
        Cover all public methods and auxiliary methods (if applicable).
        Mock external dependencies and provide necessary setups (base on above Mocking setup).
        Ensure branch coverage for all conditional statements.
        Use the provided constructors and auxiliary methods in the test setup.
        Include tests for edge cases, invalid inputs, and typical use cases.
        Each test case should be written as a separate function to ensure modularity and readability.
        Based on the source:
        In cases need to test random functions and values, choose the Distribution method to write tests for those cases.
        In cases need to verify fixed results, choose the Mock method to write tests for those cases.
        In cases need to ensure validity, choose the Range method to write tests for those cases.
        Order of priority: Range > Distribution > Mock.
        Ensure high test coverage (close to 100%) for the given source code (test cover functions, branches, conditions, cases in source structure)

        Output: Test Code ready run, not include Source code (it is in other file so call from other file).
    `;

    // PreProcessing:
    let testscope, constructors, auxiliarymethods, chainedmethods, mockingsetup, sourcestructure;
    
    try {
        testscope = await getTestScope(source);
        console.log("Got testscope");
        
        constructors = await getConstructors(source);
        console.log("Got constructors");
        
        auxiliarymethods = await getAuxiliaryMethods(source);
        console.log("Got auxiliarymethods");
        
        chainedmethods = await getChainToPrivateMethods(source);
        console.log("Got chainedmethods");
        
        mockingsetup = await getMockingSetup(source);
        console.log("Got mockingsetup");
        
        sourcestructure = await getCodeStruct(source);
        console.log("Got sourcestructure");
        
    } catch (error) {
        console.error("Error during preprocessing:", error);
        throw error;
    }

    const input = prompt.replace('{programminglanguage}', programminglanguage)
        .replace('{framework}', framework)
        .replace('{sourcecode}', source)
        .replace('{testscope}', testscope)
        .replace('{constructors}', constructors)
        .replace('{auxiliarymethods}', auxiliarymethods)
        .replace('{chainedmethods}', chainedmethods)
        .replace('{mockingsetup}', mockingsetup)
        .replace('{sourcestructure}', sourcestructure);

    try {
        const unittest = (await generateResponse)(input);
        console.log("Generated unittest");
        return String(extractCode(await unittest)); // Ensure unittest is a string before extraction
    } catch (err) {
        console.error('Error generating unit tests:', err);
        throw err;
    }
}

export async function improveUnittest(programminglanguage: string, framework: string, source: string, test: string): Promise<string> {

    const getPromptFile = path.join(__dirname, 'prompts/process/improveUnittest.txt');
    const prompt = await fs.readFile(getPromptFile, 'utf8');

    const fileTest = path.join(__dirname, 'Input/unittest.txt');
    test = await fs.readFile(fileTest, 'utf8');
    
    const fileCode = path.join(__dirname, 'Input/source.txt');
    source = await fs.readFile(fileCode, 'utf8');

    // PostProcessing:
    const coveragereport = await getCoverageReport(source, test);
    const uncovered = await checkUncovered(source, test);
    
    const input = prompt.replace('{programminglanguage}', programminglanguage)
        .replace('{framework}', framework)
        .replace('{sourcecode}', source)
        .replace('{unittest}', test)
        .replace('{report}', coveragereport)
        .replace('{improvereport}', uncovered);

    try {
        const unittest = await (await generateResponse)(input);
        const filePathOut = path.join(__dirname, 'Input/improved_unittest.txt');
        await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
        return unittest;
    } catch (err) {
        console.error('Error improving unit tests:', err);
        throw err;
    }
}
function extractBracketContent(data: string): string | null {
    let startIndex = data.indexOf('[');
    if (startIndex === -1) return null; // No opening bracket found

    let stack: string[] = [];
    let result = '';

    for (let i = startIndex; i < data.length; i++) {
        let char = data[i];
        result += char;

        if (char === '[') {
            stack.push(char);
        } else if (char === ']') {
            stack.pop();
            if (stack.length === 0) {
                return result; // Return when all brackets are matched
            }
        }
    }

    return null; // No matching closing bracket found
}

export async function identifyMocking(testcode: string): Promise<string[]> {

    const prompt = `Prompt:
    Given a block of code in any programming language, identify and return all lines 
    that be mocking or stubbing code. This includes lines where mocking frameworks
    or libraries (like unittest.mock in Python, Mockito in Java, Sinon in JavaScript, or similar) are used and both mocking frameworks import.
    Do not provide any additional explanation or analysis in the output, just the list of mocking-related lines.
    The returned result should be a JSON string representing an array containing the relevant lines of code (e.g., ["mocking code line 01", ...]).
    If no mocking code is found, return an empty array [] as a JSON string.

    ### Example:
    For the following Python test code:

    python
    import unittest
    from unittest.mock import patch, Mock

    class TestExample(unittest.TestCase):
        @patch('module.ClassName')
        def test_mocking_example(self, mock_class):
            mock_class.return_value = Mock()
            mock_class.return_value.method.return_value = "Mocked method"
            result = mock_class.return_value.method()
            self.assertEqual(result, "Mocked method")


    The result should be json format:

    [
        "from unittest.mock import patch, Mock",
        "@patch('module.ClassName')",
        "mock_class.return_value = Mock()",
        "mock_class.return_value.method.return_value = 'Mocked method'"
    ]


    If no mocking code is found, the output should be json format:

    []
    
    My Input Code Begin {code} End
    Output?`;
    
    const input = prompt.replace('{code}', testcode);
    console.log(testcode);
    try{
        const Mocking = await (await generateResponse)(input);
        if(Mocking){
            console.error('Error reading file:', Mocking);
        }
        const match = extractBracketContent(Mocking);
        if(match){
            const codeArray: string[] = JSON.parse(match);
            console.log('Got mocking test', codeArray);
            return codeArray;
        }
        return []
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            
