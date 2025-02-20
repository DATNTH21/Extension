# WeTest - LLM Test Generator for VS Code

## Overview
WeTest is a VS Code extension that generates test code for various programming languages using LLMs like Gemini and GPT. It supports unit testing, API testing, and UI automation script generation.

---

## 1️⃣ Prerequisites
### ✅ Required Software
- **Visual Studio Code**: [Download from VS Code official site](https://code.visualstudio.com/)
- **Node.js & npm**: [Download Node.js](https://nodejs.org/)

### ✅ LLM API Key Setup
- You need at least one API key for a supported LLM (currently **Gemini, GPT**, with more coming in the future).

---

## 2️⃣ Installation Methods
### 📌 Install from VS Code Marketplace
1. Open VS Code.
2. Go to Extensions (**Ctrl + Shift + X**).
3. Search for **"WeTest"**.
4. Click **Install**.

### 📌 Install from VSIX File
If you have a `.vsix` file:
1. Open VS Code.
2. Press **Ctrl + Shift + P** → Type **"Extensions: Install from VSIX"**.
3. Select the `.vsix` file and install.

### 📌 Install from Source (Development Mode)
1. Clone the repository:
   ```sh
   git clone [repository link]
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the extension:
   ```sh
   npm run compile
   ```
4. Launch the extension in a new VS Code window:
   - Press **F5** in VS Code.

---

## 3️⃣ First-time Configuration
1. Open the Command Palette (**Ctrl + Shift + P**).
2. Search for **"WeTest: Configure API Keys"**.
3. Select the active LLM and enter API keys for the supported models.
4. Click **Save** to apply the settings.
5. The settings will be saved in `settings.json`.

---

## 4️⃣ How to Use
WeTest generates different types of test code using LLMs.

### 🔹 Steps to Use Any Command
1. Press **Ctrl + Shift + P** to open the Command Palette.
2. Search for and select the desired **WeTest** command.
3. Choose the file or folder (if required).
4. Select the programming language and framework.
5. Monitor task status (**In Progress, Completed, Failed**) in the **WeTest panel** (click the WeTest extension icon on the left screen).

### 📌 Available Commands
- **WeTest: Generate Unit Test For Folder** → Generate unit tests for all files in a folder.
- **WeTest: Generate Unit Test For File** → Generate unit tests for a specific file.
- **WeTest: Generate Unit Test For Selected Code** → Generate unit tests for highlighted code.
- **WeTest: Generate API Test Code For File** → Generate API test code to call real API endpoints for APIs in a selected file.
- **WeTest: Generate Mocking API Test Code For File** → Generate unit tests with mocked API responses.
- **WeTest: Generate UI Script** → Generate UI automation scripts for front-end testing.

---

## 5️⃣ Troubleshooting
### ❌ Extension not working?
- Reload VS Code (**Ctrl + Shift + P → "Developer: Reload Window"**).
- Ensure your API key is valid in the settings.
- Check Developer Tools Console (**Ctrl + Shift + I**) for errors.

### ❌ LLM API limit exceeded?
- Check your API usage on the LLM provider's dashboard.
- Switch to a different API key.

---

## 6️⃣ Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

---

## 7️⃣ License
WeTest is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 8️⃣ Contact
For issues or feature requests, create an issue on GitHub or reach out via email at lengoc.forworks@gmail.com

