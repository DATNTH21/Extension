import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { initializeLLM } from '../../setting/extensionSetup';
import { getCodeStruct } from './experiencePre';


export async function getTestStruct(source: string, test: string): Promise<string> {    
    const generateResponse = await initializeLLM();

    const getTestCoveragePromptFile = path.join(__dirname, 'prompts/postprocessing/getTestStruct.txt');
    const prompt = fa.readFileSync(getTestCoveragePromptFile, 'utf8');
    
    let input = prompt.replace('{Sourcecode}', source);
    input = input.replace('{Testcode}', test);
    
    try {
        const result = await generateResponse(input);  // Await generateResponse
        const filePathOut = path.join(__dirname, 'Output/postprocessing/StructTest.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    } catch (err) {
        console.error('Error generating test structure:', err);
        throw err;
    }
}

export async function getCoverageReport(source: string, test: string): Promise<string> {    
    const generateResponse = await initializeLLM();

    const getCoveragePromptFile = path.join(__dirname, 'prompts/postprocessing/getCoverage.txt');
    const prompt = fa.readFileSync(getCoveragePromptFile, 'utf8');
    
    const CodeStruct = await getCodeStruct(source);
    const TestStruct = await getTestStruct(source, test);

    let input = prompt.replace('sourceCode', CodeStruct);
    input = input.replace('testCode', TestStruct);

    try {
        const result = await generateResponse(input);  // Await generateResponse
        const filePathOut = path.join(__dirname, 'Output/postprocessing/TestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    } catch (err) {
        console.error('Error generating coverage report:', err);
        throw err;
    }
}       

export async function checkUncovered(source: string, test: string): Promise<string> {
    const generateResponse = await initializeLLM();

    const getPromptFile = path.join(__dirname, 'prompts/postprocessing/checkUncovered.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    
    const report = await getCoverageReport(source, test);
    
    let input = prompt.replace('{sourcecode}', source);
    input = input.replace('{testcode}', test)
                .replace('{report}', report);
    
    try {
        const result = await generateResponse(input);  // Await generateResponse
        const filePathOut = path.join(__dirname, 'Output/postprocessing/CheckedTestCoverage.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    } catch (err) {
        console.error('Error checking uncovered coverage:', err);
        throw err;
    }
}
