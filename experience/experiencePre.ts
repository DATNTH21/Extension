import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from './geminiResponse';



// Use the function
export async function getTestScope(source: string, apiKey: string): Promise<string> {    
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getTestScope.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/unittest/preprocessing/TestScope.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

export async function getConstructors(source: string, apiKey: string): Promise<string> {    
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getConstructors.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/unittest/preprocessing/Constructors.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

export async function getAuxiliaryMethods(source: string, apiKey: string): Promise<string> {    
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getAuxiliaryMethods.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/unittest/preprocessing/AuxiliaryMethods.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}           
export async function getChainToPrivateMethods(source: string, apiKey: string): Promise<string> {    
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getChainToPrivateMethods.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/unittest/preprocessing/ChainToPrivateMethods.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}           

export async function getMockingSetup(source: string, apiKey: string): Promise<string> {
    const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getMockingSetup.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    var input = prompt.replace('{sourcecode}', source);
    try{
        const result = await generateResponse(input, apiKey);
        const filePathOut = path.join(__dirname, 'Output/unittest/preprocessing/MockingSetup.txt');
        await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}           
export async function getCodeStruct(source: string, apiKey: string): Promise<string> {
    const getCodeCoveragePromptFile = path.join(__dirname, 'prompts/preprocessing/getCodeStruct.txt');
    const prompt = fa.readFileSync(getCodeCoveragePromptFile, 'utf8');
    const input = prompt + '\n' + source;
    try{
        const result = await generateResponse(input, apiKey);
        // const filePathOut = path.join(__dirname, 'Output/postprocessing/StructCode.txt');
        // await fs.writeFile(filePathOut, result, { encoding: 'utf8' });
        return result;
    }                                   
    catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}            

// const testscope = getTestScope('','');
// const constructors = getConstructors('','');
// const auxiliarymethods = getAuxiliaryMethods('','');
// const chainedmethods = getChainToPrivateMethods('','');
// const mockingsetup = getMockingSetup('','');

