import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from './geminiResponse';

import {getCodeStruct, getTestScope, getConstructors, getAuxiliaryMethods, getChainToPrivateMethods, getMockingSetup}  from './experiencePre';
import {getTestStruct, getCoverageReport, checkUncovered} from './experiencePost';

export async function genUnittest(programminglanguage: string, framework: string, source: string, apiKey: string): Promise<string> {
    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getPromptFile = path.join(__dirname, 'prompts/process/genUnittest.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');

    const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
    source = fa.readFileSync(fileCode, 'utf8');
    
    // PreProcessing:
    const testscope = await getTestScope(source, apiKey);
    const constructors = await getConstructors(source, apiKey);
    const auxiliarymethods = await getAuxiliaryMethods(source, apiKey);
    const chainedmethods = await getChainToPrivateMethods(source, apiKey);
    const mockingsetup = await getMockingSetup(source, apiKey);
    const sourcestructure = await getCodeStruct(source,apiKey);

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
        const filePathOut = path.join(__dirname, 'Input/unittestcsharp.txt');
        await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
        return unittest;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

genUnittest('C#','NUnit' , '', '');

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