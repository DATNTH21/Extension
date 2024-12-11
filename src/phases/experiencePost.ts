import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from '../llms/geminiResponse';
import { getCodeStruct } from './experiencePre';

// Use the function

export async function getTestStruct(source: string, test: string, apiKey: string): Promise<string> {    
    const getTestCoveragePromptFile = path.join(__dirname, 'prompts/postprocessing/getTestStruct.txt');
    const prompt = fa.readFileSync(getTestCoveragePromptFile, 'utf8');
    var input = prompt.replace('{Sourcecode}', source);
    input = input.replace('{Testcode}', test);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/postprocessing/StructTest.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}            

export async function getCoverageReport(source: string, test: string, apiKey: string): Promise<string> {    
    const getCoveragePromptFile = path.join(__dirname, 'prompts/postprocessing/getCoverage.txt');
    const prompt = fa.readFileSync(getCoveragePromptFile, 'utf8');
    
    const CodeStruct = await getCodeStruct(source,apiKey);
    const TestStruct = await getTestStruct(source, test, apiKey);

    var input = prompt.replace('sourceCode', CodeStruct);
    input = input.replace('testCode', TestStruct);

    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/postprocessing/TestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}       

export async function checkUncovered(source: string, test: string, apiKey: string): Promise<string> {
    const getPromptFile = path.join(__dirname, 'prompts/postprocessing/checkUncovered.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    const report = await getCoverageReport(source, test, apiKey);
    
    var input = prompt.replace('{sourcecode}', source);
    input = input.replace('{testcode}', test)
                .replace('{report}', report);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/postprocessing/CheckedTestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
    
}     

// Execute the main function
// getCodeCoverage('','');
// getTestCoverage('','' ,'' );
// getCoverageReport('', '', '');
// checkUncovered('', '', '');

