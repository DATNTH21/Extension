import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import path from 'path';
import { createTestFile } from './utils/file_utils';
import { initializeLLM } from './setting/extensionSetup';
import { 
    detectLanguages,
    getCodeReviewResponse, 
    getFrameworkList, 
    splitCodeToFunctions, 
    getProgrammingLanguages,
    getRecommendFramework,
    generateFileName
} from './utils/responseGenerator';
import {ApiItem, getWebviewContent, updateWebview, saveQueue} from './UI/webcontent'
import {genUnittest} from './process'
import {extractCode} from './utils/extractCode'

const apiKeyString = String("AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw");
const configuration = vscode.workspace.getConfiguration();
const apis = configuration.get<Record<string, string>>('llmExtension.apis');
vscode.window.showInformationMessage(JSON.stringify(apis, null, 2));

export function activate(context: vscode.ExtensionContext) {
    const configureApisCmd = vscode.commands.registerCommand('configureApis', async () => {    
        // Retrieve the existing `llmExtension.apis` settings
        const existingApis = configuration.get<Record<string, string>>('llmExtension.apis') || {};
    
        if (Object.keys(existingApis).length === 0) {
            // Define default APIs
            const defaultApis = {
                "openai": "your-api-key-here",
                "gemini": "your-api-key-here"
                };
    
            // Update the settings with default values
            await configuration.update('llmExtension.apis', defaultApis, vscode.ConfigurationTarget.Global);
    
            vscode.window.showInformationMessage(
                "Default API configuration added to settings.json. Edit it as needed."
            );
        }
        // Open the settings.json file
        await vscode.commands.executeCommand('workbench.action.openSettingsJson');
    });
        

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
            // context.workspaceState.update("selectedLLM", selectedLLM);
            const apiKey = await getApiKey(context, String(selectedLLM));
            if (apiKey) {
                const apiKeyString = String("AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw");
                const fileUri = uri[0];
                const filePath = fileUri.fsPath;
                try {
                    const code = await fs.readFile(filePath, { encoding: 'utf8' });
                    const code_status = await getCodeReviewResponse(code, apiKeyString);
                    vscode.window.showInformationMessage(code_status);
                    const languages = await detectLanguages(code, apiKeyString);
                    const selectedLanguage = await showSelectionList(languages);
                    if(code_status){
                        const classes = await splitCodeToFunctions(code, apiKeyString);
                        // vscode.window.showInformationMessage(String(functions));
                        const frameworks = await getFrameworkList(String(selectedLanguage), apiKeyString);
                        vscode.window.showInformationMessage(String(frameworks));
                        const selectedFramework = await showSelectionList(frameworks);

                        // Create a new test file name
                        let unittests: string[] = []; // Use an array to collect unit tests
                        try {
                            // for (const c of classes) {
                            const testingCodes = await genUnittest(String(selectedLanguage), String(selectedFramework), code, apiKeyString);
                                
                                // unittests.push(...testingCodes); // Ensure testingCodes is defined
                                    // }
                                //}
                            //}
                            // const finalUnitTests = unittests.join('\n');
                            // vscode.window.showInformationMessage(`Unit tests: ${testingCodes}`);
                            const finalUnitTests = extractCode(testingCodes);
                            if (finalUnitTests) {
                                vscode.window.showInformationMessage(`Unit tests generated and saved`);
                                createTestFile(filePath, finalUnitTests);
                            } else {
                                vscode.window.showErrorMessage('No unit tests were generated.');
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
                        }

                    }
                    else{
                        vscode.window.showErrorMessage(`Code is not valid`);
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
                            const language = await getProgrammingLanguages(extension, String(apiKey));

                            if (language !== 'none') {
                                // Generate unit tests using the selected framework
                                const framework = await getRecommendFramework(language, content, String(apiKey));
                                const unitTests = String(await genUnittest(language, framework, content, String(apiKey)));
                                const finalUnitTests = String(extractCode(unitTests));

                                // Create a new test file name
                                const testFileName = `${path.basename(file, path.extname(file))}_test.${extension}`; // Change extension as needed
                                const testFilePath = path.join(testFolderPath, testFileName);
                                // Create the test file with the generated unit tests
                                await fs.writeFile(testFilePath, finalUnitTests, { encoding: 'utf8' });
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
                        const languages = await detectLanguages(selectedText, apiKeyString);
                        const selectedLanguage = await showSelectionList(languages);
    
                        const frameworks = await getFrameworkList(String(selectedLanguage), apiKeyString);
                        vscode.window.showInformationMessage(String(frameworks));
                        const selectedFramework = await showSelectionList(frameworks);

                        if (selectedFramework !== 'none') {
                            // vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);

                            // Generate unit tests using the selected framework
                            const unitTests = await genUnittest(String(selectedLanguage), String(selectedFramework), selectedText, apiKeyString);

                            // Create a new test file name
                            const testFileName = String(await generateFileName(selectedText, String(apiKey)));

                            // Create the test file with the generated unit tests
                            vscode.window.showInformationMessage(`Unit tests generated and saved to ${testFileName}`);
                            
                            // Get the full path of the currently opened file
                            const filePath = editor.document.uri.fsPath;
                            const fileName = testFileName.replace(/\s+/g, '');
                            // Use path.dirname to get the directory path
                            const directoryPath = path.dirname(filePath);
                            // Create the full path for the test file
                            const testFilePath = vscode.Uri.file(path.join(directoryPath, fileName));
                            try {
                                await fs.writeFile(testFilePath.fsPath, unitTests, { encoding: 'utf8' });
                                await vscode.workspace.fs.writeFile(testFilePath, Buffer.from(unitTests, 'utf8'));
                                vscode.window.showInformationMessage(`Test file created: ${fileName}`);
                            }catch (err) {
                            const errorMessage = (err as Error).message;
                            console.error(`Error creating test file: ${errorMessage}`); // Log the error to the console
                            vscode.window.showErrorMessage(`Failed to create test file: ${errorMessage}`);
                        }
                    }
                         else {
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

    

    context.subscriptions.push(
    configureApisCmd,
    genUnitTestFolderCommand, 
    genUnitTestFileCommand,
    // genUnitTestSelectedCommand, 
    );
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



// This method is called when your extension is deactivated
export function deactivate() {}
