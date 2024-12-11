import * as vscode from 'vscode';
export interface ApiItem {
    llmType: string;
    apiKey: string;
}
let apiQueue: ApiItem[] = [];

export function getWebviewContent(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Queue Manager</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            button { margin: 5px; padding: 5px 10px; }
        </style>
    </head>
    <body>
        <h2>LLM API Queue Manager</h2>
        <div>
            <label for="llmType">LLM Type:</label>
            <input id="llmType" type="text" placeholder="Enter LLM Type" />
            <label for="apiKey">API Key:</label>
            <input id="apiKey" type="text" placeholder="Enter API Key" />
            <button id="addApi">Add API</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Priority</th>
                    <th>LLM Type</th>
                    <th>API Key</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="apiList"></tbody>
        </table>
        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('addApi')?.addEventListener('click', () => {
                const llmType = (document.getElementById('llmType') as HTMLInputElement).value.trim();
                const apiKey = (document.getElementById('apiKey') as HTMLInputElement).value.trim();

                if (llmType && apiKey) {
                    vscode.postMessage({ type: 'addApi', llmType, apiKey });
                    (document.getElementById('llmType') as HTMLInputElement).value = '';
                    (document.getElementById('apiKey') as HTMLInputElement).value = '';
                } else {
                    alert('Please fill in both fields.');
                }
            });

            window.addEventListener('message', (event) => {
                const { type, data } = event.data as { type: string; data: any[] };
                if (type === 'updateApiList') {
                    updateApiList(data);
                }
            });

            function updateApiList(data: { llmType: string; apiKey: string }[]): void {
                const apiList = document.getElementById('apiList') as HTMLTableSectionElement;
                apiList.innerHTML = ''; // Clear existing rows
                
                data.forEach((item, index) => {
                    const row = document.createElement('tr');

                    // Priority cell
                    const priorityCell = document.createElement('td');
                    priorityCell.textContent = (index + 1).toString();
                    row.appendChild(priorityCell);

                    // LLM Type cell
                    const typeCell = document.createElement('td');
                    typeCell.textContent = item.llmType;
                    row.appendChild(typeCell);

                    // API Key cell
                    const keyCell = document.createElement('td');
                    keyCell.textContent = item.apiKey;
                    row.appendChild(keyCell);

                    // Actions cell
                    const actionsCell = document.createElement('td');

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => deleteApi(index);
                    actionsCell.appendChild(deleteButton);

                    const upButton = document.createElement('button');
                    upButton.textContent = 'Up';
                    upButton.onclick = () => moveUp(index);
                    actionsCell.appendChild(upButton);

                    const downButton = document.createElement('button');
                    downButton.textContent = 'Down';
                    downButton.onclick = () => moveDown(index);
                    actionsCell.appendChild(downButton);

                    row.appendChild(actionsCell);

                    // Append row to table
                    apiList.appendChild(row);
                });
            }

            function deleteApi(index: number): void {
                vscode.postMessage({ type: 'deleteApi', index });
            }

            function moveUp(index: number): void {
                vscode.postMessage({ type: 'moveUp', index });
            }

            function moveDown(index: number): void {
                vscode.postMessage({ type: 'moveDown', index });
            }
        </script>
    </body>
    </html>
    `;
}

export function updateWebview(webview: vscode.Webview): void {
    webview.postMessage({
        type: 'updateApiList',
        data: apiQueue
    });
}

export function saveQueue(context: vscode.ExtensionContext): void {
    context.globalState.update('apiQueue', apiQueue);
}


