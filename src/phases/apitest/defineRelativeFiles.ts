import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM } from '../../setting/extensionSetup';
import { retryOn429 } from '../../utils/fix429';

const generateResponse = initializeLLM();

export async function defineRelativeFiles(apilist: string, tree: string): Promise<string[]> {
    try {
        // If no APIs are found, return an empty array
        if (apilist === 'none') return [];

        // Load the prompt template
        const promptString = `Given the following API endpoint and folder tree, identify and list the relevant files that handle the API in the project.
### Input Example:
- **API Endpoint List**:  
  [
    {
      "method": "GET",
      "path": "/api/Account",
      "handler_function": "Get"
    },
    {
      "method": "GET",
      "path": "/api/Account/{MaNV}",
      "handler_function": "Get"
    },
    {
      "method": "POST",
      "path": "/api/Account",
      "handler_function": "Post"
    },
    {
      "method": "PATCH",
      "path": "/api/Account/{MaNV}/{SoTaiKhoan}",
      "handler_function": "Patch"
    },
    {
      "method": "DELETE",
      "path": "/api/Account/{MaNV}/{SoTaiKhoan}",
      "handler_function": "Delete"
    }
  ]

- **Folder Tree** (from the root directory):
C:.
│   .gitignore
│   appsettings.Development.json
│   appsettings.json
│   Database.sql
│   HRMSystem.csproj
│   Program.cs
│   Startup.cs
│
├───Controllers
│       AccountController.cs
│       ActivityController.cs
│       EmployeeController.cs
│
├───Services
│       AccountService.cs
│       IAccountService.cs
│       UserService.cs
│
├───Models
│       Account.cs
│       Employee.cs
│
└───Data
        EmployeeContext.cs
### Task:
1. Identify the files in the \`Controllers\` folder that handle the APIs.
2. Identify the service files in the \`Services\` folder that handle the business logic for these APIs.
3. Identify the model files in the \`Models\` folder related to the \`Account\` data.

### Output Example:
Controllers/AccountController.cs,Services/AccountService.cs,Models/Account.cs

With Input:
**API Endpoint List**: {API}
**Folder Tree**: {Tree}
Output? (Return format similar to Above Output Example, not explain anything)`;

        // Prepare the input by replacing placeholders
        const input = promptString.replace('{API}', apilist).replace('{Tree}', tree);

        // Call the LLM with retry mechanism for handling rate limits
        const rawResponse = await retryOn429(async () => (await generateResponse)(input));

        // Convert the response into an array of file paths
        return rawResponse.split(',').map(file => file.trim());
    } catch (error) {
        console.error('Error defining relative files:', error);
        throw error;
    }
}
