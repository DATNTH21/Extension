import { generateResponse } from './geminiResponse';

export async function getCodeReviewResponse(code: string, apiKey: string): Promise<string> {
    const codeReviewPrompt = `Review the following code for completeness and syntax correctness: ${code}. Respond with "valid" if it is correct not explain anything, or "non valid" if it is incorrect, providing a brief reason for the invalidity.`;
    
    try {
        const validCode = await generateResponse(codeReviewPrompt, apiKey);
        return validCode.replace(/\s+/g, '');
    } catch (error) {
        console.error("Error while generating response:", error);
        throw error;
    }
}

export async function detectLanguages(code: string, apiKey: string): Promise<string[]> {
    const detectedLanguagesPrompt = `List the detected programming languages for the following code: ${code}. Respond only with a comma-separated list without explanations.`;
    
    try {
        const response = await generateResponse(detectedLanguagesPrompt, apiKey);
        // Split the response by commas and trim any extra spaces
        const languages = response.split(',').map(lang => lang.trim());
        return languages;
    } catch (error) {
        console.error("Error while detecting languages:", error);
        throw error;
    }
}

export async function getFrameworkList(language: string, apiKey: string): Promise<string[]> {
    const getFrameworkListPrompt = `Provide a list of top 5 popular testing frameworks for ${language}. Format the response as a comma-separated list (a, b, c) without any explanations.`;
    
    try {
        const response = await generateResponse(getFrameworkListPrompt, apiKey);
        const frameworks = response.split(",");
        return frameworks;
    } catch (error) {
        console.error("Error while fetching framework list:", error);
        throw error;
    }
}


