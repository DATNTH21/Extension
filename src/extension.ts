import * as vscode from 'vscode';
import {
    genUnitTests, genUnitTestsFileName,
    validateTestCodeAgainstAcceptCrit, genImplementationFromTestCode
} from './geminigen';
import * as fs from 'fs/promises'; // Using promises-based API
import * as cp from 'child_process'; // Ensure child_process is imported

export function activate(context: vscode.ExtensionContext) {

    const provider = new ColorsViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ColorsViewProvider.viewType, provider));

    provider.deriveTestFrameworkFromWorkSpaceFiles();

    context.subscriptions.push(vscode.commands.registerCommand('tect.genImplementaion', async (uri) => {
        if (!uri) {
            vscode.window.showErrorMessage("No file selected.");
            return;
        }

        let apiKey = context.workspaceState.get("geminiApiKey");
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your API key:',
                placeHolder: 'API Key'
            });
        }

        if (apiKey) {
            context.workspaceState.update("geminiApiKey", apiKey);

            vscode.window.showInformationMessage(`Generating code ....`);
            const filePath = uri.fsPath;

            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const output = await genImplementationFromTestCode(content, apiKey.toString());

                vscode.workspace.openTextDocument({ content: output, language: "markdown" })
                    .then(document => {
                        vscode.window.showTextDocument(document);
                    });
            } catch (err) {
				const errorMessage = err instanceof Error ? err.message : String(err);
				vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
			}
        }
    }));
}

class ColorsViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'calicoColors.colorsView';
    private _view?: vscode.WebviewView;
    public workspaceTestingFramework: string = "";

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'genTests': {
                    const { apiToken, projTestingFramework, acceptanceCriteria } = data.value;
                    const code = await genUnitTests(acceptanceCriteria, projTestingFramework, apiToken);
                    vscode.window.showInformationMessage(code);

                    let fileName = await genUnitTestsFileName(acceptanceCriteria, projTestingFramework, apiToken);
                    fileName = fileName || "test" + Math.floor(Math.random() * 1000);
                    fileName = fileName + this.getFileExtension(projTestingFramework);

                    webviewView.webview.postMessage({ type: 'genTestsComplete', code });
                    this.createTestFile(fileName, code);
                    break;
                }
                case "validateUTestAgainstAcceptCrit": {
                    const { apiToken, projTestingFramework, acceptanceCriteria } = data.value;

                    const execAsync = (command: string) => {
                        return new Promise((resolve, reject) => {
                            cp.exec(command, { cwd: vscode.workspace.rootPath }, (err, stdout, stderr) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ stdout, stderr });
                                }
                            });
                        });
                    };

                    try {
                        const cmd = "git diff --cached --name-only | grep test | grep java";
                        const result: any = await execAsync(cmd);
                        const files: string[] = result.stdout.split("\n").filter((f: string) => !!f);
                        const codeSnippets = await Promise.all(files.map(async (file) => {
                            const diffCmd = `git diff --cached ${file} | grep -e "^+ "`;
                            const diffResult: any = await execAsync(diffCmd);
                            return diffResult.stdout.replace(/\+ /g, "");
                        }));

                        const stagedCode = codeSnippets.join("\n\n");
                        const geminiOp = await validateTestCodeAgainstAcceptCrit(acceptanceCriteria, projTestingFramework, stagedCode, apiToken);

                        vscode.workspace.openTextDocument({ content: geminiOp, language: "markdown" })
                            .then(document => vscode.window.showTextDocument(document));
                    } catch (err) {
						const errorMessage = err instanceof Error ? err.message : String(err);
						vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
					}
                    break;
                }
            }
        });
    }

    public getFileExtension(testingFramework: string) {
        switch (testingFramework) {
            case "pytest Python library": return ".py";
            case "jest Javascript library": return ".js";
            case "Junit Java library": return ".java";
            default: return ".txt";
        }
    }

    public async deriveTestFrameworkFromWorkSpaceFiles() {
        const files = await this.listFilesInRoot();
        let testingFramework = "pytest Python library";
        if (files.includes("package.json"))
            testingFramework = "jest Javascript library";
        else if (files.includes("pom.xml") || files.includes("build.gradle"))
            testingFramework = "Junit Java library";

        this.workspaceTestingFramework = testingFramework;
        vscode.window.showInformationMessage('Testing Framework in workspace: ' + this.workspaceTestingFramework);
        this?._view?.webview?.postMessage({ type: 'workspaceTestingFramework', testingFramework });
    }

    public async listFilesInRoot() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showInformationMessage('No workspace opened');
            return [];
        }

        const rootFolder = workspaceFolders[0].uri;
        const entries = await vscode.workspace.fs.readDirectory(rootFolder);
        return entries.filter(([_, type]) => type === vscode.FileType.File).map(([name]) => name);
    }

    public async createTestFile(fileName: string, content: string) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }
        const workspaceFolder = workspaceFolders[0]; // Assuming single workspace folder

        const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName);

        try {
            await fs.writeFile(filePath.fsPath, content);
            vscode.workspace.openTextDocument(filePath).then(document => {
                vscode.window.showTextDocument(document);
            });
        } catch (err) {
			const errorMessage = (err as Error).message;
			vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
		}
		
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>тест Intern</title>
            </head>
            <body>
                <form action="javascript:void()" id="genForm">
                    <fieldset>
                        <label>Gemini API token</label>
                        <input id="apiToken" type="password" name="apiToken" />
                    </fieldset>
                    <fieldset>
                        <label>Project's Testing Framework</label>
                        <input id="proj-testing-framework" type="text" name="projTestingFramework" />
                    </fieldset>
                    <fieldset>
                        <label>Acceptance criteria</label>
                        <textarea name="acceptanceCriteria" rows="10"></textarea>
                    </fieldset>
                    <button type="submit" id="submitButton">Generate Tests</button>
                </form>
                <button type="button" id="validate">Validate</button>
                <div style="font-size:0.5em">Validate staged Unit test code against Acceptance criteria</div>
                <div id="status"></div>
                <pre id="code"></pre>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    return Array(32).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))).join('');
}
