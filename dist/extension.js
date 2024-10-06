"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const geminiService_1 = require("./geminiService");
const fs = __importStar(require("fs/promises")); // For file operations
function activate(context) {
    // Registering the command to generate unit tests
    const genUnitTestCommand = vscode.commands.registerCommand('gemini.generateUnitTest', async () => {
        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'JavaScript Files': ['js'],
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
                const content = await fs.readFile(filePath, 'utf-8');
                // Generate unit tests using the Gemini API
                const unitTests = await (0, geminiService_1.generateUnitTests)(content, String(apiKey));
                // Create a new test file
                const testFileName = `${filePath.replace(/\.[^/.]+$/, "")}.test.js`; // Change extension as needed
                await createTestFile(testFileName, unitTests);
                vscode.window.showInformationMessage(`Unit tests generated and saved to ${testFileName}`);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Failed to generate unit tests: ${errorMessage}`);
            }
        }
    });
    // Registering the command to validate unit tests
    const validateTestsCommand = vscode.commands.registerCommand('gemini.validateUnitTests', async () => {
        const uri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'JavaScript Files': ['js'],
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
            const acceptanceCriteria = await vscode.window.showInputBox({
                prompt: 'Enter acceptance criteria:',
                placeHolder: 'Acceptance Criteria'
            });
            if (acceptanceCriteria) {
                try {
                    const validationResults = await (0, geminiService_1.validateTests)(acceptanceCriteria, String(apiKey));
                    vscode.window.showInformationMessage(`Validation Results: ${validationResults}`);
                }
                catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    vscode.window.showErrorMessage(`Failed to validate tests: ${errorMessage}`);
                }
            }
        }
    });
    const deleteDataCommand = vscode.commands.registerCommand('gemini.deleteData', async () => {
        let apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API key:',
            placeHolder: 'API Key'
        });
        context.workspaceState.update("geminiApiKey", apiKey);
    });
    context.subscriptions.push(genUnitTestCommand, validateTestsCommand, deleteDataCommand);
}
exports.activate = activate;
/**
 * Creates a test file with the provided name and content.
 *
 * @param fileName - The name of the file to create.
 * @param content - The content to write to the file.
 */
async function createTestFile(fileName, content) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }
    const workspaceFolder = workspaceFolders[0];
    //const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName); // Correctly join the URI with the filename
    try {
        await fs.writeFile(fileName, content); // Use the full path for writing the file
        const document = await vscode.workspace.openTextDocument(fileName);
        vscode.window.showTextDocument(document);
    }
    catch (err) {
        const errorMessage = err.message;
        vscode.window.showErrorMessage(`Failed to create test file: ${errorMessage}`);
    }
}
function deactivate() { }
exports.deactivate = deactivate;
