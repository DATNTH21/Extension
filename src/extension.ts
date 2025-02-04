import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import path from 'path';

import { createTestFile } from './utils/file_utils';
import {
    detectLanguages,
    getCodeReviewResponse,
    getFrameworkList,
    splitCodeToFunctions,
    getProgrammingLanguages,
    getRecommendFramework,
    generateFileName,
    detectFramework,
    getRecommendTool
} from './utils/responseGenerator';
import { highlightCodeFunc, disableHighlight } from './utils/highlight';
import { showSelectionList } from './utils/showselection';
import { getFolderTree } from './utils/getFolderTree';

import { genUnittest, identifyMocking } from './phases/unittest/unitProcess'
import { genApitest } from './phases/apitest/apiProcess';
import { genUITestScript } from './phases/uitest/UITestProcess';

const configuration = vscode.workspace.getConfiguration();
const apis = configuration.get<Record<string, string>>('llmExtension.apis');
const llm = String(apis?.llm_active);


export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.toggleFeature', () => {

    });

    context.subscriptions.push(disposable);

    if (llm == "" || llm == "gemini" && String(apis?.gemini) == "" || llm == "gpt" && String(apis?.gpt) == "") {
        vscode.window.showInformationMessage("Please select your LLM type and provide the corresponding API key.");
        vscode.commands.executeCommand('configureApisCmd');
    }

    let isHighlightingEnabled = false; // State variable to track the mode
    // Create a button in the status bar
    const highlightButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    highlightButton.text = 'Highlight Mock';
    highlightButton.command = 'toggleHighlight';
    highlightButton.show();
    const togglebutton = vscode.commands.registerCommand('toggleHighlight', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        if (isHighlightingEnabled) {
            // Disable highlight logic
            highlightButton.text = 'Highlight Mock';
            isHighlightingEnabled = false;

            // Add logic to remove highlights
            disableHighlight();
            vscode.window.showInformationMessage('Highlighting disabled');
        } else {
            // Enable highlight logic
            highlightButton.text = 'Disable Highlight';
            isHighlightingEnabled = true;

            // Highlight mocking code
            const codeToHighlight = await identifyMocking(String(editor.document.getText()));
            highlightCodeFunc(editor, codeToHighlight);
            vscode.window.showInformationMessage('Highlighting enabled');
        }
    });


    const configureApisCmd = vscode.commands.registerCommand('configureApis', async () => {
        // Retrieve the existing `llmExtension.apis` settings
        const existingApis = configuration.get<Record<string, string>>('llmExtension.apis') || {};

        if (Object.keys(existingApis).length === 0) {
            // Define default APIs
            const defaultApis = {
                "llm_active": "gemini",
                "gpt": "your-api-key-here",
                "gemini": "AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw"
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

        const fileUri = uri[0];
        const filePath = fileUri.fsPath;
        try {
            const code = await fs.readFile(filePath, { encoding: 'utf8' });

            const code_status = await getCodeReviewResponse(code);
            // const languages = await detectLanguages(code);
            const framework = await detectFramework(code);
            const classes = await splitCodeToFunctions(code);

            // const selectedLanguage = await showSelectionList(languages);
            const selectedFrameworks = await showSelectionList(framework);
            // const frameworks = await getFrameworkList(String(selectedLanguage));

            const tools = await getRecommendTool(String(selectedFrameworks), code);
            //const selectedFramework = await showSelectionList(frameworks);

            const selectedTools = await showSelectionList(tools);

            // Create a new test file name
            let unittests: string[] = []; // Use an array to collect unit tests
            try {
                // for (const c of classes) {
                const testingCodes = await genUITestScript(String(selectedFrameworks), String(selectedTools), code);

                if (testingCodes) {
                    // unittests.push(testingCodes)
                    createTestFile(filePath, testingCodes);
                    vscode.window.showInformationMessage(`Unit tests generated and saved`);
                } else {
                    vscode.window.showErrorMessage('No unit tests were generated.');
                }
                //}
                // const rawunittest = unittests.join('\n');

            }
            catch (error) {
                vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
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
                    const language = await getProgrammingLanguages(extension);

                    if (language !== 'none') {
                        // Generate unit tests using the selected framework
                        const framework = await getRecommendFramework(language, content);
                        const unitTests = String(await genUnittest(language, framework, content));

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

    });

    // Registering the command to generate unit tests for selected code
    const genUnitTestSelectedCommand = vscode.commands.registerCommand('generateUnitTestSelected', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText) {
                // Get the file extension
                // const fileExtension = path.extname(editor.document.fileName).slice(1); // Get the extension without the dot
                const languages = await detectLanguages(selectedText);
                const selectedLanguage = await showSelectionList(languages);

                const frameworks = await getFrameworkList(String(selectedLanguage));
                vscode.window.showInformationMessage(String(frameworks));
                const selectedFramework = await showSelectionList(frameworks);

                if (selectedFramework !== 'none') {
                    // vscode.window.showInformationMessage(`You selected: ${selectedFramework}`);

                    // Generate unit tests using the selected framework
                    const unitTests = await genUnittest(String(selectedLanguage), String(selectedFramework), selectedText);

                    // Create a new test file name
                    const testFileName = String(await generateFileName(selectedText));

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
                    } catch (err) {
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

    });

    const genApiTestFileCommand = vscode.commands.registerCommand('generateApiTestFile', async () => {
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

        const fileUri = uri[0];
        const filePath = fileUri.fsPath;
        try {
            const code = await fs.readFile(filePath, { encoding: 'utf8' });

            const code_status = await getCodeReviewResponse(code);
            const languages = await detectLanguages(code);
            const classes = await splitCodeToFunctions(code);

            const selectedLanguage = await showSelectionList(languages);
            const frameworks = await getFrameworkList(String(selectedLanguage));

            const selectedFramework = await showSelectionList(frameworks);

            // Create a new test file name
            // let unittests: string[] = []; // Use an array to collect unit tests
            try {
                // for (const c of classes) {
                const testingCodes = await genApitest(String(selectedLanguage), String(selectedFramework), code);

                if (testingCodes) {
                    // unittests.push(testingCodes)
                    createTestFile(filePath, testingCodes);
                    vscode.window.showInformationMessage(`Unit tests generated and saved`);
                } else {
                    vscode.window.showErrorMessage('No unit tests were generated.');
                }
                //}
                // const rawunittest = unittests.join('\n');

            }
            catch (error) {
                vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
        }

    });
    context.subscriptions.push(
        configureApisCmd,
        genUnitTestFolderCommand,
        genUnitTestFileCommand,
        genUnitTestSelectedCommand,
        genApiTestFileCommand
    );
}



// This method is called when your extension is deactivated
export function deactivate() {
}
