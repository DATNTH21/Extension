import * as vscode from 'vscode';
/**
 * Show a selection list in a VSCode extension from an array of items.
 * 
 * @param items - The array of items to display in the selection list.
 * @returns The selected item or undefined if the selection was canceled.
 */
export async function showSelectionList(items: string[]): Promise<string | undefined> {
    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Choose an option',
        canPickMany: false // Change to true if you want to allow multiple selections
    });

    return selection; // Return the selected item or undefined if canceled
}
