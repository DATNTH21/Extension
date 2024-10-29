import { promises as fs } from 'fs';

// Function to write unit test content to a file
async function writeUnitTest(filePath: string, unit_test: string): Promise<void> {
    try {
        await fs.writeFile(filePath, unit_test);
        console.log('File written successfully');
    } catch (error) {
        console.error(`Failed to write file: ${(error as Error).message}`);
    }
}

// Function to read file content from a specified file path
async function readFileContent(filePath: string): Promise<string> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data; // Return the file content
    } catch (error) {
        console.error(`Failed to read file: ${(error as Error).message}`);
        throw error; // Re-throw the error for further handling if needed
    }
}
