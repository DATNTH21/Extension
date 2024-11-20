import * as vscode from 'vscode';

interface FunctionInfo {
    name: string;
    code: string;
}

export async function getFunctionsInFile(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(uri);
    const text = document.getText();

    // Define the array with the expected type
    const functions: FunctionInfo[] = [];

    // Regex to match functions (simplified example)
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}|(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}/g;

    let match;
    while ((match = functionRegex.exec(text)) !== null) {
        const functionName = match[1] || match[2];
        const functionCode = match[0];

        // Push the function data into the array
        functions.push({
            name: functionName,
            code: functionCode
        });
    }

    return functions;
}

// Usage
vscode.commands.registerCommand('extension.getFunctions', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const functions = await getFunctionsInFile(editor.document.uri);
        vscode.window.showInformationMessage(`Found ${functions.length} functions!`);
        console.log(functions);
    }
});
