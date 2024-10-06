// Listen for messages from the webview
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'genTestsComplete':
            // Handle the generation of tests completion
            document.getElementById('status').innerText = 'Tests generated successfully!';
            document.getElementById('code').innerText = message.code;
            break;
        case 'workspaceTestingFramework':
            // Update the UI based on the testing framework
            document.getElementById('proj-testing-framework').value = message.testingFramework;
            break;
    }
});

// Function to send data to the extension
function sendMessage(type, value) {
    const message = { type, value };
    vscode.postMessage(message);
}

// Event handler for the form submission
document.getElementById('genForm').addEventListener('submit', event => {
    event.preventDefault();

    const apiToken = document.getElementById('apiToken').value;
    const projTestingFramework = document.getElementById('proj-testing-framework').value;
    const acceptanceCriteria = document.querySelector('textarea[name="acceptanceCriteria"]').value;

    // Send the message to the extension
    sendMessage('genTests', { apiToken, projTestingFramework, acceptanceCriteria });
});

// Event handler for the validate button
document.getElementById('validate').addEventListener('click', () => {
    const apiToken = document.getElementById('apiToken').value;
    const projTestingFramework = document.getElementById('proj-testing-framework').value;
    const acceptanceCriteria = document.querySelector('textarea[name="acceptanceCriteria"]').value;

    // Send the message to validate unit tests
    sendMessage('validateUTestAgainstAcceptCrit', { apiToken, projTestingFramework, acceptanceCriteria });
});
