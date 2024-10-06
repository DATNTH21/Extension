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
exports.generateTestFileName = exports.writeFileContent = exports.readFileContent = exports.showInfo = exports.showError = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Shows an error message to the user in the VS Code status bar.
 * @param message - The error message to display.
 */
function showError(message) {
    vscode.window.showErrorMessage(`Error: ${message}`);
}
exports.showError = showError;
/**
 * Shows an information message to the user in the VS Code status bar.
 * @param message - The information message to display.
 */
function showInfo(message) {
    vscode.window.showInformationMessage(`Info: ${message}`);
}
exports.showInfo = showInfo;
/**
 * Reads the content of a file at the specified path.
 * @param filePath - The path to the file to read.
 * @returns A promise that resolves to the content of the file.
 */
async function readFileContent(filePath) {
    try {
        const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
        return content.toString();
    }
    catch (err) {
        throw new Error(`Failed to read file at ${filePath}: ${err.message}`);
    }
}
exports.readFileContent = readFileContent;
/**
 * Writes content to a file at the specified path.
 * @param filePath - The path to the file to write.
 * @param content - The content to write to the file.
 */
async function writeFileContent(filePath, content) {
    try {
        await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(content, 'utf-8'));
    }
    catch (err) {
        throw new Error(`Failed to write file at ${filePath}: ${err.message}`);
    }
}
exports.writeFileContent = writeFileContent;
/**
 * Generates a random file name for the generated test file.
 * @param originalFileName - The name of the original file.
 * @returns A new test file name.
 */
function generateTestFileName(originalFileName) {
    const baseName = originalFileName.replace(/\.[^/.]+$/, ""); // Remove extension
    return `${baseName}.test.js`; // Change the extension as needed
}
exports.generateTestFileName = generateTestFileName;
