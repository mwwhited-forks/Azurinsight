"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const crypto = require("crypto");
let serverProcess = null;
let statusBarItem;
let outputChannel;
function activate(context) {
    console.log('Azurinsight extension is now active!');
    vscode.window.showInformationMessage('Azurinsight: Activating...');
    // Check autoStart setting
    const config = vscode.workspace.getConfiguration('azurinsight');
    const autoStart = config.get('autoStart');
    outputChannel = vscode.window.createOutputChannel('Azurinsight');
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push(outputChannel);
    const startCommand = vscode.commands.registerCommand('azurinsight.start', () => {
        startServer(context);
    });
    const stopCommand = vscode.commands.registerCommand('azurinsight.stop', () => {
        stopServer();
    });
    const openWebviewCommand = vscode.commands.registerCommand('azurinsight.openWebview', () => {
        vscode.window.showInformationMessage('Azurinsight: Opening Webview...');
        try {
            AzurinsightPanel.createOrShow(context.extensionUri);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error opening webview: ${e}`);
            outputChannel.appendLine(`Error opening webview: ${e}`);
        }
    });
    context.subscriptions.push(startCommand);
    context.subscriptions.push(stopCommand);
    context.subscriptions.push(openWebviewCommand);
    updateStatusBar();
    if (autoStart) {
        startServer(context);
    }
}
function startServer(context) {
    if (serverProcess) {
        vscode.window.showInformationMessage('Azurinsight server is already running.');
        return;
    }
    // In packaged extension, server is inside the extension folder
    const serverPath = path.join(context.extensionPath, 'server');
    const scriptPath = path.join(serverPath, 'dist', 'index.js');
    // Check for bundled Node.js binary
    const platform = process.platform;
    const nodeExecutable = platform === 'win32' ? 'node.exe' : 'node';
    const bundledNodePath = path.join(serverPath, 'bin', nodeExecutable);
    let command = 'node';
    if (fs.existsSync(bundledNodePath)) {
        command = bundledNodePath;
        outputChannel.appendLine(`Using bundled Node.js: ${command}`);
    }
    else {
        outputChannel.appendLine('Using system Node.js');
    }
    outputChannel.appendLine(`Starting server from: ${scriptPath}`);
    const config = vscode.workspace.getConfiguration('azurinsight');
    const port = config.get('port') || 5000;
    serverProcess = cp.spawn(command, [scriptPath], {
        cwd: serverPath,
        env: { ...process.env, PORT: port.toString() }
    });
    serverProcess.on('error', (err) => {
        outputChannel.appendLine(`[Server Spawn Error]: ${err.message}`);
        vscode.window.showErrorMessage(`Failed to start server: ${err.message}`);
    });
    serverProcess.stdout?.on('data', (data) => {
        outputChannel.append(`[Server]: ${data}`);
    });
    serverProcess.stderr?.on('data', (data) => {
        outputChannel.append(`[Server Error]: ${data}`);
    });
    serverProcess.on('close', (code) => {
        outputChannel.appendLine(`Server exited with code ${code}`);
        serverProcess = null;
        updateStatusBar();
    });
    vscode.window.showInformationMessage('Azurinsight server started.');
    updateStatusBar();
}
function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        vscode.window.showInformationMessage('Azurinsight server stopped.');
        updateStatusBar();
    }
    else {
        vscode.window.showInformationMessage('Azurinsight server is not running.');
    }
}
function updateStatusBar() {
    if (serverProcess) {
        statusBarItem.text = '$(radio-tower) Azurinsight: Running';
        statusBarItem.command = 'azurinsight.openWebview'; // Click to open UI
        statusBarItem.tooltip = 'Click to open Telemetry Viewer';
        statusBarItem.show();
    }
    else {
        statusBarItem.text = '$(circle-slash) Azurinsight: Stopped';
        statusBarItem.command = 'azurinsight.start';
        statusBarItem.tooltip = 'Click to start emulator';
        statusBarItem.show();
    }
}
class AzurinsightPanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (AzurinsightPanel.currentPanel) {
            AzurinsightPanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('azurinsight', 'Azurinsight', column || vscode.ViewColumn.One, {
            enableScripts: true,
            // UI is copied to 'ui' folder in extension
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'ui')]
        });
        AzurinsightPanel.currentPanel = new AzurinsightPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'log':
                    outputChannel.appendLine(`[Webview Log]: ${message.text}`);
                    return;
                case 'error':
                    outputChannel.appendLine(`[Webview Error]: ${message.text}`);
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        AzurinsightPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        // Local path to main script run in the webview
        const assetsPath = path.join(this._extensionUri.fsPath, 'ui/assets');
        const msg1 = `Looking for assets in: ${assetsPath}`;
        outputChannel.appendLine(msg1);
        console.log(msg1);
        // We have manually renamed assets to index.js and index.css to avoid hash issues
        const jsFile = 'index.js';
        const cssFile = 'index.css';
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'ui/assets', jsFile);
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'ui/assets', cssFile);
        // And the uri we use to load this script in the webview
        // Add a random query parameter to force reload and bypass cache
        const cacheBust = `v=${Date.now()}`;
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk).with({ query: cacheBust });
        const styleUri = webview.asWebviewUri(stylePathOnDisk).with({ query: cacheBust });
        console.log(`Script URI: ${scriptUri}`);
        console.log(`Style URI: ${styleUri}`);
        outputChannel.appendLine(`Script URI: ${scriptUri}`);
        outputChannel.appendLine(`Style URI: ${styleUri}`);
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        const config = vscode.workspace.getConfiguration('azurinsight');
        const port = config.get('port') || 5000;
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; font-src ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src ws://localhost:${port} http://localhost:${port};">
                <title>Azurinsight</title>
                <link href="${styleUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    window.azurinsightPort = ${port};
                </script>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    console.log = (message) => {
                        vscode.postMessage({ command: 'log', text: message });
                    };
                    console.error = (message) => {
                        vscode.postMessage({ command: 'error', text: message });
                    };
                    window.onerror = function(message, source, lineno, colno, error) {
                        vscode.postMessage({ command: 'error', text: message + ' at ' + source + ':' + lineno });
                    };
                    console.log('Webview script loaded');
                </script>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
function getNonce() {
    return crypto.randomBytes(16).toString('hex');
}
function deactivate() {
    stopServer();
}
//# sourceMappingURL=extension.js.map