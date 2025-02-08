import * as path from 'path';
import { promises as fs } from 'fs';


// Function to read file content from a specified file path
export async function readFileContent(filePath: string): Promise<string> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data; // Return the file content
    } catch (error) {
        console.error(`Failed to read file: ${(error as Error).message}`);
        throw error; // Re-throw the error for further handling if needed
    }
}


export async function createTestFile(filePath: string, finalUnitTests: string): Promise<string> {
    try {
        // Extract the file extension (without the dot)
        const extension = path.extname(filePath).slice(1);

        // Create a new test file name
        const testFileName = `${path.basename(filePath, path.extname(filePath))}_test.${extension}`;

        // Determine the folder path of the original file
        const folderPath = path.dirname(filePath);

        // Create the full path for the test file
        const testFilePath = path.join(folderPath, testFileName);

        // Write the final unit tests to the new test file
        await fs.writeFile(testFilePath, finalUnitTests, { encoding: 'utf8' });

        console.log(`Test file created at: ${testFilePath}`);
        return testFilePath;
    } catch (error) {
        console.error("Failed to create test file:", error);
        throw error;
    }
}

export async function createTestFiles(filePath: string, finalUnitTests: string): Promise<string> {
    try {
        // Extract the file extension (without the dot)
        const extension = path.extname(filePath).slice(1);

        // Create a new test file name
        const testFileName = `${path.basename(filePath, path.extname(filePath))}_test.${extension}`;

        // Determine the folder path of the original file
        const folderPath = path.dirname(filePath);

        // Create the full path for the test file
        const testFilePath = path.join(folderPath, testFileName);

        // Write the final unit tests to the new test file
        await fs.writeFile(testFilePath, finalUnitTests, { encoding: 'utf8' });

        console.log(`Test file created at: ${testFilePath}`);
        return testFilePath;
    } catch (error) {
        console.error("Failed to create test file:", error);
        throw error;
    }
}

