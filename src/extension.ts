import * as vscode from 'vscode';
import { generateUnitTests, getRecommendedTestingFrameworks, getTestingFrameworks, generateFileName} from './geminiService';
import * as fs from 'fs/promises';
import path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Registering the command to generate unit tests
    const genUnitTestFileCommand = vscode.commands.registerCommand('gemini.generateUnitTestFile', async () => {
        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'All Files': ['*'],
            },
        });
        
        if (!uri || uri.length === 0) {
            vscode.window.showErrorMessage("No file selected.");
            return;
        }

        let apiKey = context.workspaceState.get("geminiApiKey");
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Gemini API key:',
                placeHolder: 'API Key'
            });
        }

        if (apiKey) {
            context.workspaceState.update("geminiApiKey", apiKey);
            const fileUri = uri[0];
            const filePath = fileUri.fsPath;

            try {
                // Read the file content
                const content = await fs.readFile(filePath, { encoding: 'utf8' });
                const extension = String(filePath.split('.').pop());
                const frameworks: string[] = await getTestingFrameworks(extension, String(apiKey));
                if (frameworks.length > 0) { // Check if the array is not empty
                    const selectedFramework = await showSelectionList(frameworks);

                    if (selectedFramework != 'none') {
                        vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);
                        
                        // Generate unit tests using the selected framework
                        const unitTests = String(await generateUnitTests(String(selectedFramework), content, String(apiKey)));

                        // Create a new test file name
                        const testFileName = `${filePath.replace(/\.[^/.]+$/, "")}_test.${extension}`; // Change extension as needed
                        
                        // Create the test file with the generated unit tests
                        createTestFile(testFileName, unitTests);

                        vscode.window.showInformationMessage(`Unit tests generated and saved to ${testFileName}`);
                    } else {
                        vscode.window.showInformationMessage('No appropriate framework available for this code.');
                    }
                } else {
                    vscode.window.showInformationMessage('No frameworks available for the selected extension.');
                }
                
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
            }
        }
    });
    const genUnitTestFolderCommand = vscode.commands.registerCommand('gemini.generateUnitTestFolder', async () => {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select a folder',
            canSelectFolders: true,
        });
        
        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("No folder selected.");
            return;
        }
    
        let apiKey = context.workspaceState.get("geminiApiKey");
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Gemini API key:',
                placeHolder: 'API Key'
            });
        }
    
        if (apiKey) {
            context.workspaceState.update("geminiApiKey", apiKey);
            const folderPath = folderUri[0].fsPath;
            const folderName = path.basename(folderPath); // Get the name of the folder
            const parentFolderPath = path.dirname(folderPath); // Get the parent folder path
            try {
                const files = await fs.readdir(folderPath);
                const testFolderPath = `${parentFolderPath}/${folderName}_test`; // Create a test folder path
    
                // Create the test folder if it doesn't exist
                await fs.mkdir(testFolderPath, { recursive: true });
    
                for (const file of files) {
                    const filePath = path.join(folderPath, file);
                    const extension = String(file.split('.').pop());
    
                    // Only process files (skip directories)
                    const stat = await fs.stat(filePath);
                    if (stat.isFile()) {
                        // Read the file content
                        const content = await fs.readFile(filePath, { encoding: 'utf8' });
                        const framework = await getRecommendedTestingFrameworks(extension, String(apiKey));

                        if (framework !== 'none') {
                            // Generate unit tests using the selected framework
                            const unitTests = String(await generateUnitTests(String(framework), content, String(apiKey)));

                            // Create a new test file name
                            const testFileName = `${file.replace(/\.[^/.]+$/, "")}_test.${extension}`; // Change extension as needed
                            const testFilePath = path.join(testFolderPath, testFileName);
                            // Create the test file with the generated unit tests
                            await fs.writeFile(testFilePath, unitTests, { encoding: 'utf8' });
                            vscode.window.showInformationMessage(`Unit tests generated and saved to ${testFilePath}`);
                        } else {
                            vscode.window.showInformationMessage(`No appropriate framework available for ${file}.`);
                        }
                        
                    }
                }
                
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Failed to generate unit tests : ${errorMessage}`);
            }
        }
    });
    const genUnitTestSelectedCommand = vscode.commands.registerCommand('gemini.generateUnitTestSelected', async () => {
        let apiKey = context.workspaceState.get("geminiApiKey");
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Gemini API key:',
                placeHolder: 'API Key'
            });
        }

        if (apiKey) {
            context.workspaceState.update("geminiApiKey", apiKey);
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                if (selectedText) {
                    // Get the file extension
                    const fileExtension = editor.document.fileName.split('.').pop();
                    const frameworks: string[] = await getTestingFrameworks(String(fileExtension), String(apiKey));
                    const selectedFramework = await showSelectionList(frameworks);

                    if (selectedFramework != 'none') {
                        vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);
                        
                        // Generate unit tests using the selected framework
                        const unitTests = String(await generateUnitTests(String(selectedFramework), selectedText, String(apiKey)));
                        // Create a new test file name
                        const testFileName =  String(await generateFileName(String(selectedText), String(apiKey)));
                        
                        // Create the test file with the generated unit tests
                        createTestFileForSelectedCode(testFileName, unitTests);

                        vscode.window.showInformationMessage(`Unit tests generated and saved to ${testFileName}`);
                    } else {
                        vscode.window.showInformationMessage('No appropriate framework available for this code.');
                    }
                } else {
                    vscode.window.showInformationMessage('No code selected for unit test generation.');
                }
            } else {
                vscode.window.showInformationMessage('No active editor.');
            }
                
        }
    });
    
    const resetAPICommand = vscode.commands.registerCommand('gemini.resetAPI', async () => {
        let apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API key:',
            placeHolder: 'API Key'
        });
        context.workspaceState.update("geminiApiKey", apiKey);

    });
    
    context.subscriptions.push(genUnitTestFolderCommand, genUnitTestFileCommand, genUnitTestSelectedCommand, resetAPICommand);
}

/**
 * Show a selection list in a VSCode extension from an array of items.
 * 
 * @param items - The array of items to display in the selection list.
 * @returns The selected item or undefined if the selection was canceled.
 */
async function showSelectionList(items: string[]): Promise<string | undefined> {
    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a framework',
        canPickMany: false // Change to true if you want to allow multiple selections
    });

    return selection; // Return the selected item or undefined if canceled
}



/**
 * Creates a test file with the provided name and content.
 * 
 * @param fileName - The name of the file to create.
 * @param content - The content to write to the file.
 */
async function createTestFileForSelectedCode(fileName: string, content: string) {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        // Get the full path of the currently opened file
        const filePath = editor.document.uri.fsPath;
        fileName = fileName.replace(/\s+/g, '');
        // Use path.dirname to get the directory path
        const directoryPath = path.dirname(filePath);
        // Create the full path for the test file
        const testFilePath = vscode.Uri.file(path.join(directoryPath, fileName));
        try {
            await fs.writeFile(testFilePath.fsPath, content, { encoding: 'utf8' });
            await vscode.workspace.fs.writeFile(testFilePath, Buffer.from(content, 'utf8'));
            vscode.window.showInformationMessage(`Test file created: ${fileName}`);
        } catch (err) {
            const errorMessage = (err as Error).message;
            console.error(`Error creating test file: ${errorMessage}`); // Log the error to the console
            vscode.window.showErrorMessage(`Failed to create test file: ${errorMessage}`);
        }
    } else {
        vscode.window.showErrorMessage('No active editor detected. Please open a file first.');
    }
}
/**
 * Creates a test file with the provided name and content.
 * 
 * @param fileName - The name of the file to create.
 * @param content - The content to write to the file.
 */
async function createTestFile(fileName: string, content: string) {
    try {
        await fs.writeFile(fileName, content); // Use the full path for writing the file
        const document = await vscode.workspace.openTextDocument(fileName);
        vscode.window.showTextDocument(document);
    } catch (err) {
        const errorMessage = (err as Error).message;
        vscode.window.showErrorMessage(`Failed to create test file: ${errorMessage}`);
    }
}

export function deactivate() {}
