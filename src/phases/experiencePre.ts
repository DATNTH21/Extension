import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
// import { generateResponse } from '../llms/geminiResponse';
import { initializeLLM } from '../setting/extensionSetup';
import { retryOn429 } from '../utils/fix429';

const generateResponse = initializeLLM();
// Use the function
export async function getTestScope(source: string): Promise<string>  {    
    const prompt = `Analyze the class and identify:
                    The primary method(s) that need direct testing.
                    Auxiliary methods that support the class's behavior.
                    External dependencies used in the class. Return the result in JSON format.

                    Code Example Input:
                    class UserManager:
                        def __init__(self, database, notification_service):
                            self.database = database
                            self.notification_service = notification_service

                        def add_user(self, username, email):
                            if not self._is_email_valid(email):
                                raise ValueError("Invalid email")
                            self.database["users"].append({"username": username, "email": email})
                            self.notification_service.send_welcome_email(email)

                        def remove_user(self, username):
                            self.database["users"] = [
                                user for user in self.database["users"] if user["username"] != username
                            ]


                    Output Example:
                    "test_scope": {
                    "direct_methods": ["add_user", "remove_user"],
                    "auxiliary_methods": ["get_user"],
                    "dependencies": ["database", "notification_service"]
                    }

                    Code Input:
                    {sourcecode}
                    Output?
                    `
    var input = prompt.replace('{sourcecode}', source);
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }

}            

export async function getConstructors(source: string): Promise<string> {    
    // const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getConstructors.txt');
    const prompt =`From the class, identify the constructor and list its parameters. Specify the type of mocks or stubs required for each dependency. Return the result in JSON format.

                    Code Input Example:
                    class UserManager:
                        def __init__(self, database, notification_service):
                            self.database = database
                            self.notification_service = notification_service

                        def add_user(self, username, email):
                            if not self._is_email_valid(email):
                                raise ValueError("Invalid email")
                            self.database["users"].append({"username": username, "email": email})
                            self.notification_service.send_welcome_email(email)

                        def remove_user(self, username):
                            self.database["users"] = [
                                user for user in self.database["users"] if user["username"] != username
                            ]

                        def get_user(self, username):
                            return next((user for user in self.database["users"] if user["username"] == username), None)

                    Output Example:
                    "constructor_dependencies": {
                    "database": "MockDatabase",
                    "notification_service": "MockNotificationService"
                    }

                    Code Input:
                    {sourcecode}
                    Output?

                    `;
    var input = prompt.replace('{sourcecode}', source);
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}            

export async function getAuxiliaryMethods(source: string): Promise<string> {    
    // const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getAuxiliaryMethods.txt');
    const prompt = `List all private or utility methods in the class.
                    Categorize them based on their functionality (e.g., validation, formatting).
                    Return the result in JSON format.

                    Code Input Example:
                    class UserManager:
                        def __init__(self, database, notification_service):
                            self.database = database
                            self.notification_service = notification_service

                        def add_user(self, username, email):
                            if not self._is_email_valid(email):
                                raise ValueError("Invalid email")
                            self.database["users"].append({"username": username, "email": email})
                            self.notification_service.send_welcome_email(email)

                        def remove_user(self, username):
                            self.database["users"] = [
                                user for user in self.database["users"] if user["username"] != username
                            ]

                        def _is_email_valid(self, email):
                            return "@" in email

                        def _log_action(self, action, details):
                            print(f"{action}: {details}")

                    Output Example:
                    "auxiliary_methods": {
                    "validation": ["_is_email_valid"],
                    "logging": ["_log_action"]
                    }

                    Code Input:
                    {sourcecode}
                    Output?`;
    var input = prompt.replace('{sourcecode}', source);
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}           
export async function getChainToPrivateMethods(source: string): Promise<string> {    
    // const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getChainToPrivateMethods.txt');
    const prompt =`For the public methods in the UserManager class, identify private methods or helper methods that are internally called as part of the implementation. 
                    List these methods and their order of invocation, if applicable. 
                    Return the result in JSON format.

                    Code Input Example:
                    def add_user(self, username, email):
                        if not self._is_email_valid(email):
                            raise ValueError("Invalid email")
                        self.database["users"].append({"username": username, "email": email})
                        self.notification_service.send_welcome_email(email)

                    Output Example:
                    "chained_methods": {
                        "add_user": ["_is_email_valid"]
                    }

                    Code Input:
                    {sourcecode}
                    Output?

                    `;
    var input = prompt.replace('{sourcecode}', source);
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}           

export async function getMockingSetup(source: string): Promise<string> {
    // const getPromptFile = path.join(__dirname, 'prompts/preprocessing/getMockingSetup.txt');
    const prompt = `Provide a mock setup for the identified dependencies in the constructor and other external services.
                    Specify the expected inputs and outputs for each dependency and the behavior they should mimic during the test. 
                    Return the result in JSON format with keys: mock_setup, test_input, and expected_output.

                    Code Input Example:
                    from unittest.mock import Mock

                    mock_database = {"users": []}
                    mock_notification_service = Mock()
                    user_manager = UserManager(mock_database, mock_notification_service)

                    # Test input
                    username = "johndoe"
                    email = "johndoe@example.com"
                    user_manager.add_user(username, email)

                    Output Example:
                    {
                    "mock_setup": {
                        "database": {"users": []},
                        "notification_service": "MockNotificationService"
                    },
                    "test_input": {
                        "username": "johndoe",
                        "email": "johndoe@example.com"
                    },
                    "expected_output": {
                        "database": {
                        "users": [
                            {
                            "username": "johndoe",
                            "email": "johndoe@example.com"
                            }
                        ]
                        },
                        "notification_service_calls": [
                        {
                            "method": "send_welcome_email",
                            "args": ["johndoe@example.com"]
                        }
                        ]
                    }
                    }

                    Code Input:
                    {sourcecode}
                    Output?`;
    var input = prompt.replace('{sourcecode}', source);
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}           
export async function getCodeStruct(source: string): Promise<string> {
    // const getCodeCoveragePromptFile = path.join(__dirname, 'prompts/preprocessing/getCodeStruct.txt');
    const prompt = `Analyze the following source code and extract: 
                    1. All functions or methods with their names and line ranges. 
                    2. Any conditional branches and their line numbers.

                    Example: 
                    Input Source code:
                    def greet(name):
                        if not name:
                            raise ValueError("Name is required")
                        return f"Hello, {name}"

                    def classify_number(num):
                        if num > 0:
                            return "Positive"
                        elif num < 0:
                            return "Negative"
                        else:
                            return "Zero"

                    Example Output:
                    {
                    "functions": [
                        {
                        "name": "greet", 
                        "lines": [1, 5],
                        "branches": [
                        {"condition": "if not name", "cases": ["empty", "none as name"]},
                        {"condition": "else", "cases": ["valid name"]}
                        ]
                        },
                        {
                        "name": "classify_number",
                        "lines": [6, 13]
                        "branches": [
                        {"condition": " if num > 0", "cases": ["Typical Positive Numbers", "Boundary Conditions", "Float or Decimal Values", "Extreme Positive Values"]},
                        {"condition": " elif num < 0", "cases": ["Typical Negative Numbers", "Boundary Conditions", "Decimal Negative Numbers", "Extreme Negative Values"]},
                        {"condition": " else", "cases": ["0"]}
                        ]
                        }
                    ]
                    }


                    For this Source Code:
                    `;
    const input = prompt + '\n' + source;
    try {
        const result = await retryOn429(async () => {
            return (await generateResponse)(input);
        });
        return result;
    } catch (err) {
        console.error('Error: ', err);
        throw err;
    }
}            

// const testscope = getTestScope('','');
// const constructors = getConstructors('','');
// const auxiliarymethods = getAuxiliaryMethods('','');
// const chainedmethods = getChainToPrivateMethods('','');
// const mockingsetup = getMockingSetup('','');

