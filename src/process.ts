import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from './llms/geminiResponse';
import { sleep } from './utils/sleep';
import {getCodeStruct, getTestScope, getConstructors, getAuxiliaryMethods, getChainToPrivateMethods, getMockingSetup}  from './phases/experiencePre';
import {getTestStruct, getCoverageReport, checkUncovered} from './phases/experiencePost';

export async function genUnittest(programminglanguage: string, framework: string, source: string, apiKey: string): Promise<string> {
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
        Based on the source:
        In cases need to test random functions and values, choose the Distribution method to write tests for those cases.
        In cases need to verify fixed results, choose the Mock method to write tests for those cases.
        In cases need to ensure validity, choose the Range method to write tests for those cases.
        Order of priority: Range > Distribution > Mock.
        Ensure high test coverage (close to 100%) for the given source code (test cover functions, branches, conditions, cases in source structure)

        Output: Test Code ready run, not include Source code (it is in other file so call from other file).
        `

    // const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
    // source = fa.readFileSync(fileCode, 'utf8');
    
    // PreProcessing:
    let testscope: any;
    let constructors: any;
    let auxiliarymethods: any;
    let chainedmethods: any;
    let mockingsetup: any;
    let sourcestructure: any;
    let attempt = 0;
    let maxRetries=5;
    
    try {
        testscope = await getTestScope(source, apiKey);
        console.log("processing..10%");
        try {
            constructors = await getConstructors(source, apiKey);
            console.log("processing..30%");
            try {
                auxiliarymethods = await getAuxiliaryMethods(source, apiKey);
                console.log("processing..50%");
                try {
                    chainedmethods = await getChainToPrivateMethods(source, apiKey);
                    console.log("processing..70%");
                    try {
                        mockingsetup = await getMockingSetup(source, apiKey);
                        console.log("processing..90%");
                        try {
                            sourcestructure = await getCodeStruct(source, apiKey);
                            console.log("processing..98%");
                        } catch (error) {
                            console.error("Error in getCodeStruct:", error);
                        }
                    } catch (error) {
                        console.error("Error in getMockingSetup:", error);
                    }
                } catch (error) {
                    console.error("Error in getChainToPrivateMethods:", error);
                }
            } catch (error) {
                console.error("Error in getAuxiliaryMethods:", error);
            }
        } catch (error) {
            console.error("Error in getConstructors:", error);
        }
    } catch (error) {
        console.error("Error in getTestScope:", error);
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

    try{
        const unittest = await generateResponse(input, apiKey);
        console.log("processing..100%");
        // const filePathOut = path.join(__dirname, 'Input/unittestcsharp.txt');
        // await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
        return unittest;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

// genUnittest('C#','NUnit' , '', '');

export async function improveUnittest(programminglanguage: string, framework: string, source: string, test: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getPromptFile = path.join(__dirname, 'prompts/process/improveUnittest.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');

    const fileTest = path.join(__dirname, 'Input/unittest.txt');
    test = fa.readFileSync(fileTest, 'utf8');
    
    const fileCode = path.join(__dirname, 'Input/source.txt');
    source = fa.readFileSync(fileCode, 'utf8');

    // PostProcessing:
    // const teststruct = await getTestStruct(source, test, apiKey);
    const coveragereport = await getCoverageReport(source, test, apiKey);
    const uncovered = await checkUncovered(source, test, apiKey);
    
    const input = prompt.replace('{programminglanguage}', programminglanguage)
    .replace('{framework}', framework)
    .replace('{sourcecode}', source)
    .replace('{unittest}', test)
    .replace('{report}', coveragereport)
    .replace('{improvereport}', uncovered);

    try{
        const unittest = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Input/improved_unittest.txt');
        await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
        return unittest;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

// improveUnittest('Java','JUnit 5' , '', '', '');