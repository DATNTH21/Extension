import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import path from 'path';

import { createTestFile, createTestFileS } from './utils/file_utils';
import {
    detectLanguages,
    getCodeReviewResponse,
    getFrameworkList,
    splitCodeToFunctions,
    getProgrammingLanguages,
    getRecommendFramework,
    generateFileName,
    getRecommendTool,
    getUITestingScriptLanguage,
    detectUIRelatedFiles
} from './utils/responseGenerator';
import { highlightCodeFunc, disableHighlight } from './utils/highlight';
import { showSelectionList } from './utils/showselection';
import { folderTree, getFolderTree } from './utils/getFolderTree';

import { getTree } from './utils/getTree';

import { genUnittest, identifyMocking } from './phases/unittest/unitProcess'
import { genApitest } from './phases/apitest/apiProcess01';
import { defineApi } from './phases/apitest/defineApi';
import { defineRelativeFiles } from './phases/apitest/defineRelativeFiles';
import { processFiles } from './utils/processFiles';
import { genUITestScript } from './phases/uitest/UITestProcess';
import { getAPIsDetails } from './phases/apitest/getAPIsDetails';
import { getTestCasesByMethod } from './utils/parseApiTestCases';
import { extractCode } from './utils/extractCode';
import { genMockingApitest } from './phases/apitest/apiProcess';

const configuration = vscode.workspace.getConfiguration();
const apis = configuration.get<Record<string, string>>('llmExtension.apis');
const llm = String(apis?.llm_active);

class TaskStatusProvider implements vscode.TreeDataProvider<TaskItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | null | undefined> =
        new vscode.EventEmitter<TaskItem | null | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TaskItem | null | undefined> = this._onDidChangeTreeData.event;

    private tasks: TaskItem[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadTaskStatus(); // ✅ Load saved task status on start
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    updateTaskStatus(projectName: string, taskName: string, status: string) {
        const taskKey = `taskStatus_${projectName}`;
        let projectTasks = this.context.workspaceState.get<{ [task: string]: string }>(taskKey, {});

        projectTasks[taskName] = status;
        this.context.workspaceState.update(taskKey, projectTasks); // ✅ Save task status

        this.loadTaskStatus(); // Refresh the tree
    }

    loadTaskStatus() {
        const projectName = vscode.workspace.name || 'default_project';
        const taskKey = `taskStatus_${projectName}`;
        const projectTasks = this.context.workspaceState.get<{ [task: string]: string }>(taskKey, {});

        this.tasks = Object.entries(projectTasks).map(([taskName, status]) => new TaskItem(taskName, status));
        this.refresh();
    }

    getTreeItem(element: TaskItem): vscode.TreeItem {
        return element;
    }

    getChildren(): TaskItem[] {
        return this.tasks;
    }
}

class TaskItem extends vscode.TreeItem {
    constructor(label: string, status: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = status;
    }
}


export function activate(context: vscode.ExtensionContext) {
    const taskStatusProvider = new TaskStatusProvider(context);

    vscode.window.registerTreeDataProvider('taskStatusView', taskStatusProvider);

    // ✅ Register command to update task status
    vscode.commands.registerCommand('myExtension.updateTaskStatus', (taskName: string, status: string) => {
        const projectName = vscode.workspace.name || 'default_project';
        taskStatusProvider.updateTaskStatus(projectName, taskName, status);
    });

    // ✅ Refresh tasks when extension starts
    vscode.commands.executeCommand('myExtension.refreshTasks');


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
        const fileName = path.basename(filePath);

        const taskName = `Unittest: File ${fileName}`;

        try {
            const code = await fs.readFile(filePath, { encoding: 'utf8' });

            const code_status = await getCodeReviewResponse(code);
            const languages = await detectLanguages(code);
            const classes = await splitCodeToFunctions(code);

            const selectedLanguage = await showSelectionList(languages);
            const frameworks = await getFrameworkList(String(selectedLanguage), code);

            const selectedFramework = await showSelectionList(frameworks);

            // Create a new test file name
            let unittests: string[] = []; // Use an array to collect unit tests
            try {
                vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'In Progress');

                const testingCodes = await genUnittest(String(selectedLanguage), String(selectedFramework), code);

                if (testingCodes) {
                    // unittests.push(testingCodes)
                    createTestFile(filePath, testingCodes);
                    vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Completed');

                    vscode.window.showInformationMessage(`Unit tests generated and saved`);
                } else {
                    vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
                    vscode.window.showErrorMessage('No unit tests were generated.');
                }

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
        const taskName = `Unittest: Folder ${folderName}`;

        try {
            const files = await fs.readdir(folderPath);
            const testFolderPath = path.join(parentFolderPath, `${folderName}_test`); // Create a test folder path


            // Create the test folder if it doesn't exist
            await fs.mkdir(testFolderPath, { recursive: true });
            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'In Progress');
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
            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Completed');

        } catch (err) {
            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
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
            const filePath = editor.document.uri.fsPath;
            if (selectedText) {
                // Get the file extension
                // const fileExtension = path.extname(editor.document.fileName).slice(1); // Get the extension without the dot
                const languages = await detectLanguages(selectedText);
                const selectedLanguage = await showSelectionList(languages);

                const frameworks = await getFrameworkList(String(selectedLanguage), selectedText);
                vscode.window.showInformationMessage(String(frameworks));
                const selectedFramework = await showSelectionList(frameworks);

                // Create a new test file name
                const testFileName = String(await generateFileName(selectedText));
                const fileName = testFileName.replace(/\s+/g, '');

                const taskName = `Unittest: ${fileName}`;

                if (selectedFramework !== 'none') {
                    // Get the full path of the currently opened file

                    vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'In Progress');
                    // Generate unit tests using the selected framework
                    const unitTests = await genUnittest(String(selectedLanguage), String(selectedFramework), selectedText);


                    // Create the test file with the generated unit tests
                    vscode.window.showInformationMessage(`Unit tests generated and saved to ${fileName}`);

                    // Use path.dirname to get the directory path
                    const directoryPath = path.dirname(filePath);
                    // Create the full path for the test file
                    const testFilePath = vscode.Uri.file(path.join(directoryPath, fileName));

                    try {
                        await fs.writeFile(testFilePath.fsPath, unitTests, { encoding: 'utf8' });

                        await vscode.workspace.fs.writeFile(testFilePath, Buffer.from(unitTests, 'utf8'));
                        vscode.window.showInformationMessage(`Test file created: ${fileName}`);
                        vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Completed');
                    } catch (err) {
                        vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
                        const errorMessage = (err as Error).message;
                        console.error(`Error creating test file: ${errorMessage}`); // Log the error to the console
                        vscode.window.showErrorMessage(`Failed to create test file: ${errorMessage}`);
                    }
                }
                else {
                    vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
                    vscode.window.showInformationMessage('No appropriate framework available for this code.');
                }
            }
            else {
                vscode.window.showInformationMessage('No code selected for unit test generation.');
            }
        }
        else {
            vscode.window.showInformationMessage('No active editor.');
        }

    });

    const genApiTestFileCommand = vscode.commands.registerCommand('generateApiTestFile', async () => {
        const project = await vscode.window.showOpenDialog({
            canSelectFolders: true, // Enable folder selection
            canSelectFiles: false,  // Disable file selection
            canSelectMany: false,   // Allow only one folder to be selected
            openLabel: 'Select Project',
        });
        if (!project || project.length === 0) {
            vscode.window.showErrorMessage("No project selected.");
            return;
        }
        const projectUri = project[0];
        const folderPath = projectUri.fsPath;


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

        const fileName = path.basename(filePath);

        const taskName = `Live API: ${fileName}`;

        try {
            const code = await fs.readFile(filePath, { encoding: 'utf8' });

            const languages = await detectLanguages(code);
            const selectedLanguage = await showSelectionList(languages);

            const frameworks = await getFrameworkList(String(selectedLanguage), code);
            const selectedFramework = await showSelectionList(frameworks);

            const apis = await getAPIsDetails(String(selectedLanguage), code);
            const tree = getTree(folderPath);
            const extension = path.extname(filePath).slice(1);
            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'In Progress');
            const testingCodes = await genApitest(folderPath, String(selectedLanguage), String(selectedFramework), apis);
            const filename = path.basename(filePath, path.extname(filePath));

            createTestFileS(folderPath, filename + '_test.' + extension, testingCodes);

            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Completed');

        } catch (err) {
            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
        }

    });

    const genMockingApiTestFileCommand = vscode.commands.registerCommand('generateMockApiTestFile', async () => {
        const project = await vscode.window.showOpenDialog({
            canSelectFolders: true, // Enable folder selection
            canSelectFiles: false,  // Disable file selection
            canSelectMany: false,   // Allow only one folder to be selected
            openLabel: 'Select Project',
        });
        if (!project || project.length === 0) {
            vscode.window.showErrorMessage("No project selected.");
            return;
        }
        const projectUri = project[0];
        const folderPath = projectUri.fsPath;

        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: 'Select Api Routes',
            filters: { 'All Files': ['*'] },
            defaultUri: projectUri,  // Set default path to selected folder
        });

        if (!uri || uri.length === 0) {
            vscode.window.showErrorMessage("No file selected.");
            return;
        }

        const fileUri = uri[0];
        const filePath = fileUri.fsPath;

        const code = await fs.readFile(filePath, { encoding: 'utf8' });

        // const code_status = await getCodeReviewResponse(code);
        const languages = await detectLanguages(code);
        // const classes = await splitCodeToFunctions(code);

        const selectedLanguage = await showSelectionList(languages);
        const frameworks = await getFrameworkList(String(selectedLanguage), code);

        const selectedFramework = await showSelectionList(frameworks);
        const fileName = path.basename(filePath);

        const taskName = `API Mocking: ${fileName}`;

        try {
            const tree = getTree(folderPath);
            // console.log(`Tree: `, tree);
            const api = await defineApi(filePath);
            if (api != `none`) {
                // console.log(`Api:`, api);
                const files = await defineRelativeFiles(api, tree);
                if (files) {
                    const code = processFiles(files, folderPath);
                    try {
                        vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'In Progress');
                        const testingCodes = await genMockingApitest(String(selectedLanguage), String(selectedFramework), code);
                        if (testingCodes) {
                            createTestFile(filePath, testingCodes);
                            vscode.window.showInformationMessage(`Testing Code generated and saved`);
                            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Completed');
                        } else {
                            vscode.commands.executeCommand('myExtension.updateTaskStatus', taskName, 'Failed');
                            vscode.window.showErrorMessage('No Api tests were generated.');
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
                    }
                }
            }
            else {
                vscode.window.showErrorMessage('No Api in this file');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate api tests: ${errorMessage}`);
        }

    });

    const genUITestingScript = vscode.commands.registerCommand('generateUITestingScript', async () => {
        let allFilePaths = [];

        while (true) {
            const uris = await vscode.window.showOpenDialog({
                title: "Select Files (Multiple Selections Allowed)",
                canSelectMany: true,
                canSelectFiles: true,
                canSelectFolders: false,
                openLabel: "Select Files",
                filters: { 'All Files': ['*'] },
            });

            if (uris && uris.length > 0) {
                allFilePaths.push(...uris.map(uri => uri.fsPath));
            }

            const continueSelection = await vscode.window.showQuickPick(
                ["Select More Files", "Done"],
                { placeHolder: "Do you want to select more files?" }
            );

            if (continueSelection !== "Select More Files") {
                break;
            }
        }

        if (allFilePaths.length === 0) {
            vscode.window.showErrorMessage("No files selected.");
            return;
        }

        try {

            let code = "";
            for (const filePath of allFilePaths) {
                try {
                    const content = await fs.readFile(filePath, "utf8");
                    const fileName = path.basename(filePath);
                    code += `=== ${fileName} ===\n${content}\n\n`; // Append file name and content
                } catch (error) {
                    vscode.window.showErrorMessage(`Error reading ${filePath}: ${String(error)}`);
                }
            }
            // const frameworks = await detectFramework(code);
            // const selectedFramework = await showSelectionList(frameworks);
            const tools = await getRecommendTool(code);
            const selectedTool = await showSelectionList(tools);

            const languages = await getUITestingScriptLanguage(String(selectedTool));
            const selectedLanguage = await showSelectionList(languages);

            let unittests: string[] = []; // Use an array to collect unit tests
            try {
                const testingCodes = await genUITestScript(String(selectedTool), String(selectedLanguage), code);
                //vscode.window.showInformationMessage(`${testingCodes}`)
                if (!testingCodes) {
                    vscode.window.showErrorMessage('No testing scripts were generated.');
                    return;
                }

                try {
                    const fileUri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.parse(`file:///test`),
                        filters: {
                            'All Files': ['*']
                        }
                    });

                    if (!fileUri) {
                        console.log('File save was canceled');
                        return;
                    }

                    const testFilePath = fileUri.fsPath;
                    await fs.writeFile(testFilePath, testingCodes, { encoding: 'utf8' });

                    vscode.window.showInformationMessage('UI testing script is generated and saved');
                } catch (error) {
                    console.error('Failed to create UI testing script file:', error);
                    throw error;
                }

            } catch (error) {
                vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate UI testing script: ${errorMessage}`);
        }

    });

    const genUITestingScriptFolder = vscode.commands.registerCommand('generateUITestingScriptFolder', async () => {
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

        try {
            const foldertree = folderTree(folderPath);

            const files = JSON.parse(await detectUIRelatedFiles(foldertree.files));

            //vscode.window.showInformationMessage(JSON.stringify(files.files));

            async function readFilesToString(fileList: string[]) {
                let combinedContent = '';

                for (const filePath of fileList) {
                    try {
                        const content = await fs.readFile(path.resolve(filePath), 'utf-8');
                        combinedContent += `\n// FILE: ${filePath}\n${content}\n`;
                        //vscode.window.showInformationMessage(combinedContent);
                    } catch (error) {
                        vscode.window.showErrorMessage('Error reading file');
                        throw error;
                    }
                };
                return combinedContent;
            }

            const code = await readFilesToString(await files.files);

            //vscode.window.showInformationMessage(code);

            const tools = await getRecommendTool(code);
            const selectedTool = await showSelectionList(tools);

            const languages = await getUITestingScriptLanguage(String(selectedTool));
            const selectedLanguage = await showSelectionList(languages);

            // let unittests: string[] = []; // Use an array to collect unit tests
            try {
                const testingCodes = await genUITestScript(String(selectedTool), String(selectedLanguage), code);
                vscode.window.showInformationMessage(`${testingCodes}`)
                if (!testingCodes) {
                    vscode.window.showErrorMessage('No testing scripts were generated.');
                    return;
                }
                try {
                    const fileUri = await vscode.window.showSaveDialog({
                        defaultUri: vscode.Uri.parse(`file:///test`),
                        filters: {
                            'All Files': ['*']
                        }
                    });

                    if (!fileUri) {
                        console.log('File save was canceled');
                        return;
                    }

                    const testFilePath = fileUri.fsPath;
                    await fs.writeFile(testFilePath, testingCodes, { encoding: 'utf8' });

                    vscode.window.showInformationMessage('UI testing script is generated and saved');
                } catch (error) {
                    console.error('Failed to create UI testing script file:', error);
                    throw error;
                }

            } catch (error) {
                vscode.window.showErrorMessage(`An error occurred: ${String(error)}`);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Failed to generate UI testing script: ${errorMessage}`);
        }

    });

    context.subscriptions.push(
        configureApisCmd,
        genUnitTestFolderCommand,
        genUnitTestFileCommand,
        genUnitTestSelectedCommand,
        genApiTestFileCommand,
        genMockingApiTestFileCommand,
        genUITestingScript,
        genUITestingScriptFolder
    );
}



// This method is called when your extension is deactivated
export function deactivate() {
}
// 