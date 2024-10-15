import * as vscode from 'vscode';
import { initializeLLM, generateUnitTests, getRecommendedTestingFrameworks, getTestingFrameworks, generateFileName } from './service';
import * as fs from 'fs/promises';
import path from 'path';

export function activate(context: vscode.ExtensionContext) {
    initializeLLM(context);
    // Registering the command to generate unit tests for a file
    const genUnitTestFileCommand = vscode.commands.registerCommand('generateUnitTestFile', async () => {
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

        let selectedLLM = context.workspaceState.get("selectedLLM");

        if (!selectedLLM) {
            selectedLLM = await showSelectionList(['chatgpt', 'gemini']);
        }

        if (selectedLLM) {
            context.workspaceState.update("selectedLLM", selectedLLM);
            const apiKey = await getApiKey(context, String(selectedLLM));
            if (apiKey) {
                const fileUri = uri[0];
                const filePath = fileUri.fsPath;

                try {
                    // Read the file content
                    const content = await fs.readFile(filePath, { encoding: 'utf8' });
                    const extension = path.extname(filePath).slice(1); // Get the extension without the dot
                    const frameworks: string[] = await getTestingFrameworks(extension, String(apiKey));
                    
                    if (frameworks.length > 0) { // Check if the array is not empty
                        const selectedFramework = await showSelectionList(frameworks);
                        if (selectedFramework !== 'none') {
                            vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);

                            // Generate unit tests using the selected framework
                            const unitTests = String(await generateUnitTests(String(selectedFramework), content, String(apiKey)));

                            // Create a new test file name
                            const testFileName = `${path.basename(filePath, path.extname(filePath))}_test.${extension}`; // Change extension as needed

                            // Create the test file with the generated unit tests
                            await createTestFile(testFileName, unitTests);
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
        }
    });

    // Registering the command to generate unit tests for a folder
    const genUnitTestFolderCommand = vscode.commands.registerCommand('generateUnitTestFolder', async () => {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Select a folder',
            canSelectFolders: true,
        });

        if (!folderUri || folderUri.length === 0) {
            vscode.window.showErrorMessage("No folder selected.");
            return;
        }

        let selectedLLM = context.workspaceState.get("selectedLLM");
        if (!selectedLLM) {
            selectedLLM = await showSelectionList(['chatgpt', 'gemini']);
        }

        if (selectedLLM) {
            context.workspaceState.update("selectedLLM", selectedLLM);
            const apiKey = await getApiKey(context, String(selectedLLM));
            if (apiKey) {
                const folderPath = folderUri[0].fsPath;
                const folderName = path.basename(folderPath); // Get the name of the folder
                const parentFolderPath = path.dirname(folderPath); // Get the parent folder path
                try {
                    const files = await fs.readdir(folderPath);
                    const testFolderPath = path.join(parentFolderPath, `${folderName}_test`); // Create a test folder path

                    // Create the test folder if it doesn't exist
                    await fs.mkdir(testFolderPath, { recursive: true });

                    for (const file of files) {
                        const filePath = path.join(folderPath, file);
                        const extension = path.extname(file).slice(1); // Get the extension without the dot

                        // Only process files (skip directories)
                        const stat = await fs.stat(filePath);
                        if (stat.isFile()) {
                            // Read the file content
                            const content = await fs.readFile(filePath, { encoding: 'utf8' });
                            const framework = await getRecommendedTestingFrameworks(extension, String(apiKey));

                            if (framework !== 'none') {
                                // Generate unit tests using the selected framework
                                const unitTests = String(await generateUnitTests(framework, content, String(apiKey)));

                                // Create a new test file name
                                const testFileName = `${path.basename(file, path.extname(file))}_test.${extension}`; // Change extension as needed
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
                    vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
                }
            }
        }
    });

    // Registering the command to generate unit tests for selected code
    const genUnitTestSelectedCommand = vscode.commands.registerCommand('generateUnitTestSelected', async () => {
        let selectedLLM = context.workspaceState.get("selectedLLM");

        if (!selectedLLM) {
            selectedLLM = await showSelectionList(['chatgpt', 'gemini']);
        }
        if (selectedLLM) {
            context.workspaceState.update("selectedLLM", selectedLLM);
            const apiKey = await getApiKey(context, String(selectedLLM));
            if (apiKey) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    const selectedText = editor.document.getText(selection);
                    if (selectedText) {
                        // Get the file extension
                        const fileExtension = path.extname(editor.document.fileName).slice(1); // Get the extension without the dot
                        const frameworks: string[] = await getTestingFrameworks(fileExtension, String(apiKey));
                        const selectedFramework = await showSelectionList(frameworks);

                        if (selectedFramework !== 'none') {
                            vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);

                            // Generate unit tests using the selected framework
                            const unitTests = String(await generateUnitTests(String(selectedFramework), selectedText, String(apiKey)));
                            // Create a new test file name
                            const testFileName = String(await generateFileName(selectedText, String(apiKey)));

                            // Create the test file with the generated unit tests
                            await createTestFileForSelectedCode(testFileName, unitTests);
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
        }
    });

    // Command to reset API key
    const resetAPICommand = vscode.commands.registerCommand('resetAPI', async () => {
        let selectedLLM = await showSelectionList(['chatgpt', 'gemini']);
        let apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API key:',
            placeHolder: 'API Key'
        });

        context.workspaceState.update(selectedLLM+ "ApiKey", apiKey);
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
 * Gets the API key for the selected LLM, prompting the user if necessary.
 * 
 * @param context - The VSCode extension context.
 * @param selectedLLM - The selected LLM identifier.
 * @returns The API key or undefined if the user cancels.
 */
async function getApiKey(context: vscode.ExtensionContext, selectedLLM: string) {
    let apiKey = context.workspaceState.get(`${selectedLLM}ApiKey`);
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your API key:',
            placeHolder: 'API Key',
        });
        if (apiKey) {
            context.workspaceState.update(`${selectedLLM}ApiKey`, apiKey);
        }
    }
    return apiKey;
}

/**
 * Create a test file with the given name and content.
 * 
 * @param testFileName - The name of the test file.
 * @param unitTests - The content to write to the test file.
 */
async function createTestFile(testFileName: string, unitTests: string) {
    const currentWorkspaceFolders = vscode.workspace.workspaceFolders;
    if (currentWorkspaceFolders) {
        const folderPath = currentWorkspaceFolders[0].uri.fsPath; // Get the first workspace folder path
        const testFilePath = path.join(folderPath, testFileName);
        await fs.writeFile(testFilePath, unitTests, { encoding: 'utf8' });
    }
}

/**
 * Create a test file for the selected code with the given name and content.
 * 
 * @param testFileName - The name of the test file.
 * @param unitTests - The content to write to the test file.
 */
async function createTestFileForSelectedCode(testFileName: string, unitTests: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const folderPath = path.dirname(editor.document.fileName); // Get the directory of the current file
        const testFilePath = path.join(folderPath, testFileName);
        await fs.writeFile(testFilePath, unitTests, { encoding: 'utf8' });
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
