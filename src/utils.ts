import * as vscode from 'vscode';

/**
 * Shows an error message to the user in the VS Code status bar.
 * @param message - The error message to display.
 */
export function showError(message: string) {
    vscode.window.showErrorMessage(`Error: ${message}`);
}

/**
 * Shows an information message to the user in the VS Code status bar.
 * @param message - The information message to display.
 */
export function showInfo(message: string) {
    vscode.window.showInformationMessage(`Info: ${message}`);
}

/**
 * Reads the content of a file at the specified path.
 * @param filePath - The path to the file to read.
 * @returns A promise that resolves to the content of the file.
 */
export async function readFileContent(filePath: string): Promise<string> {
    try {
        const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
        return content.toString();
    } catch (err) {
        throw new Error(`Failed to read file at ${filePath}: ${(err as Error).message}`);
    }
}

/**
 * Writes content to a file at the specified path.
 * @param filePath - The path to the file to write.
 * @param content - The content to write to the file.
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
    try {
        await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(content, 'utf-8'));
    } catch (err) {
        throw new Error(`Failed to write file at ${filePath}: ${(err as Error).message}`);
    }
}

/**
 * Generates a random file name for the generated test file.
 * @param originalFileName - The name of the original file.
 * @returns A new test file name.
 */
export function generateTestFileName(originalFileName: string): string {
    const baseName = originalFileName.replace(/\.[^/.]+$/, ""); // Remove extension
    return `${baseName}.test.js`; // Change the extension as needed
}
