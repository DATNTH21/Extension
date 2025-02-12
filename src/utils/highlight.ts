import * as vscode from 'vscode';

// Maintain a global variable for the decoration type
let activeDecorationType: vscode.TextEditorDecorationType | null = null;

// Function to highlight code in the editor
export function highlightCodeFunc(editor: vscode.TextEditor, codeToHighlight: string[] | undefined): void {
    console.log('Started Highlight');
    const document = editor.document;
    const decorations: vscode.DecorationOptions[] = [];

    if (codeToHighlight) {
        console.log('Code need to be highlighted', codeToHighlight);

        // Loop through all lines of the document
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            for (let code of codeToHighlight) {
                if (line.text.includes(code)) {
                    // Create a decoration (highlight) for the line
                    const decoration = {
                        range: new vscode.Range(i, 0, i, line.text.length),
                        hoverMessage: `Highlighted: ${code}`,
                    };
                    decorations.push(decoration);
                }
            }
        }

        // Dispose of previous decorations if they exist
        if (activeDecorationType) {
            activeDecorationType.dispose();
        }

        // Apply new decorations
        activeDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(5, 174, 225, 0.54)', // Yellow background for highlight
        });

        editor.setDecorations(activeDecorationType, decorations);
    }
}

// Function to disable highlight
export function disableHighlight(): void {
    if (activeDecorationType) {
        console.log('Disabling Highlight');
        activeDecorationType.dispose();
        activeDecorationType = null;
    } else {
        console.log('No active highlight to disable.');
    }
}
