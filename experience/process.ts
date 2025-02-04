import * as fa from 'fs';
import * as path from 'path';
import { promises as fs } from 'fs';
import { generateResponse } from './geminiResponse';

import {getCodeStruct, getTestScope, getConstructors, getAuxiliaryMethods, getChainToPrivateMethods, getMockingSetup}  from './experiencePre';
import {getTestStruct, getCoverageReport, checkUncovered} from './experiencePost';
import { randomInt } from 'crypto';

// export async function genUnittest(programminglanguage: string, framework: string, source: string, apiKey: string): Promise<string> {
//     apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
//     const getPromptFile = path.join(__dirname, 'prompts/process/genUnittest.txt');
//     const prompt = fa.readFileSync(getPromptFile, 'utf8');

//     const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
//     source = fa.readFileSync(fileCode, 'utf8');
    
//     // PreProcessing:
//     const testscope = await getTestScope(source, apiKey);
//     const constructors = await getConstructors(source, apiKey);
//     const auxiliarymethods = await getAuxiliaryMethods(source, apiKey);
//     const chainedmethods = await getChainToPrivateMethods(source, apiKey);
//     const mockingsetup = await getMockingSetup(source, apiKey);
//     const sourcestructure = await getCodeStruct(source,apiKey);

//     const input = prompt.replace('{programminglanguage}', programminglanguage)
//     .replace('{framework}', framework)
//     .replace('{sourcecode}', source)
//     .replace('{testscope}', testscope)
//     .replace('{constructors}', constructors)
//     .replace('{auxiliarymethods}', auxiliarymethods)
//     .replace('{chainedmethods}', chainedmethods)
//     .replace('{mockingsetup}', mockingsetup)
//     .replace('{sourcestructure}', sourcestructure);

//     try{
//         const unittest = await generateResponse(input, apiKey);
//         const filePathOut = path.join(__dirname, 'Input/unittestcsharp.txt');
//         await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
//         return unittest;
//     }                                   
//     catch (err) {
//         console.error('Error reading file:', err);
//         throw err;
//     }
// }            

// // genUnittest('C#','NUnit' , '', '');

// export async function improveUnittest(programminglanguage: string, framework: string, source: string, test: string, apiKey: string): Promise<string> {
//     apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
//     const getPromptFile = path.join(__dirname, 'prompts/process/improveUnittest.txt');
//     const prompt = fa.readFileSync(getPromptFile, 'utf8');

//     const fileTest = path.join(__dirname, 'Input/unittest.txt');
//     test = fa.readFileSync(fileTest, 'utf8');
    
//     const fileCode = path.join(__dirname, 'Input/source.txt');
//     source = fa.readFileSync(fileCode, 'utf8');

//     // PostProcessing:
//     // const teststruct = await getTestStruct(source, test, apiKey);
//     const coveragereport = await getCoverageReport(source, test, apiKey);
//     const uncovered = await checkUncovered(source, test, apiKey);
    
//     const input = prompt.replace('{programminglanguage}', programminglanguage)
//     .replace('{framework}', framework)
//     .replace('{sourcecode}', source)
//     .replace('{unittest}', test)
//     .replace('{report}', coveragereport)
//     .replace('{improvereport}', uncovered);

//     try{
//         const unittest = await generateResponse(input, apiKey);
//         const filePathOut = path.join(__dirname, 'Input/improved_unittest.txt');
//         await fs.writeFile(filePathOut, unittest, { encoding: 'utf8' });
//         return unittest;
//     }                                   
//     catch (err) {
//         console.error('Error reading file:', err);
//         throw err;
//     }
// }            

// // improveUnittest('Java','JUnit 5' , '', '', '');
// ====================================================================
export function extractCode(Codestring: string): string | null {
  // Split the string into lines
  const lines = Codestring.split('\n');
  
  // Check if there are at least two lines
  if (lines.length < 2) {
      return null;
  }

  // Get the substring from line 2
  const line2 = lines.slice(1).join('\n'); // Join lines starting from line 2
  
  // Find the position of the first "```"
  const endIndex = line2.indexOf("```");

  // If "```" is found, return the substring up to "```"
  if (endIndex !== -1) {
      return line2.substring(0, endIndex).trim();
  }

  // Return null if no "```" is found
  return null;
}
// Define the structure of the expected JSON file
interface ApiTestCase {
  test_case: string;
  expected_status_code: number;
  expected_response: string;
}

interface ApiTestCases {
  GET: ApiTestCase[];
  POST: ApiTestCase[];
  PUT: ApiTestCase[];
  PATCH: ApiTestCase[];
  DELETE: ApiTestCase[];
}


// Function to extract test cases for a specific HTTP method
export const getTestCasesByMethod = (method: keyof ApiTestCases): string => {
    const rawData = `{
                    "GET": [
                    {
                        "test_case": "Right Input",
                        "expected_status_code": 200,
                        "expected_response": "The resource exists, response can be an array, object, or null."
                    },
                    {
                        "test_case": "Wrong Input",
                        "expected_status_code": 404,
                        "expected_response": "{ \"error\": \"Resource not found\", \"message\": \"...\" }"
                    },
                    {
                        "test_case": "Failed",
                        "expected_status_code": 500,
                        "expected_response": "{ \"error\": \"Internal Server Error\", \"message\": \"...\" }"
                    }
                    ],
                    "POST": [
                    {
                        "test_case": "Passed",
                        "expected_status_code": 201,
                        "expected_response": "{ \"id\": 1, \"title\": \"New Book Title\", \"author\": \"New Author\", \"publishedYear\": 2024 }"
                    },
                    {
                        "test_case": "Call API Get Data After Post",
                        "expected_status_code": 200,
                        "expected_response": "{ \"id\": 1, \"title\": \"New Book Title\", \"author\": \"New Author\", \"publishedYear\": 2024 }"
                    },
                    {
                        "test_case": "Failed",
                        "expected_status_code": 400,
                        "expected_response": "{ \"error\": \"Bad Request\", \"message\": \"Invalid input data.\" }"
                    }
                    ],
                    "PUT": [
                    {
                        "test_case": "Passed",
                        "expected_status_code": 200,
                        "expected_response": "{ \"id\": 1, \"title\": \"Updated Book Title\", \"author\": \"Updated Author\", \"publishedYear\": 2025 }"
                    },
                    {
                        "test_case": "Failed",
                        "expected_status_code": 400,
                        "expected_response": "{ \"error\": \"Bad Request\", \"message\": \"ID mismatch or invalid data.\" }"
                    },
                    {
                        "test_case": "Not Found",
                        "expected_status_code": 404,
                        "expected_response": "{ \"error\": \"Resource Not Found\", \"message\": \"Resource not found\" }"
                    }
                    ],
                    "PATCH": [
                    {
                        "test_case": "Passed",
                        "expected_status_code": 200,
                        "expected_response": "{ \"id\": 1, \"title\": \"Partially Updated Book Title\", \"author\": \"Updated Author\", \"publishedYear\": 2024 }"
                    },
                    {
                        "test_case": "Failed",
                        "expected_status_code": 400,
                        "expected_response": "{ \"error\": \"Bad Request\", \"message\": \"Invalid patch data\" }"
                    },
                    {
                        "test_case": "Not Found",
                        "expected_status_code": 404,
                        "expected_response": "{ \"error\": \"Resource Not Found\", \"message\": \"Resource not found\" }"
                    }
                    ],
                    "DELETE": [
                    {
                        "test_case": "Passed",
                        "expected_status_code": 200,
                        "expected_response": "{ \"message\": \"Resource deleted successfully.\" }"
                    },
                    {
                        "test_case": "Call API Get Data After Delete",
                        "expected_status_code": 404,
                        "expected_response": "{ \"error\": \"Not Found\", \"message\": \"The resource was deleted and no longer exists.\" }"
                    },
                    {
                        "test_case": "Failed",
                        "expected_status_code": 404,
                        "expected_response": "{ \"error\": \"Not Found\", \"message\": \"Resource not found for deletion.\" }"
                    },
                    {
                        "test_case": "Server Error",
                        "expected_status_code": 500,
                        "expected_response": "{ \"error\": \"Internal Server Error\", \"message\": \"An error occurred while deleting the resource.\" }"
                    }
                    ]
                }
                `; 
    try {
    const testCases: ApiTestCases = JSON.parse(rawData);
    const testCasesByMethod = testCases[method].toString();
    if (testCases) {
        return testCasesByMethod;
    }
    } catch (error) {
    console.error('Error reading or parsing the file:', error);
    return "";
    }
  return "";
};


export async function getAPIsDetails(programminglanguage: string, source: string): Promise<any[]> {    
  const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable

  const getPromptFile = path.join(__dirname, 'prompts/api_testing/getAPIsDetails.txt');
  const prompt = `Analyze the provided {PROGRAMMING LANGUAGE} code for API definitions in the SOURCE CODE. Extract the following details for each API endpoint:
      1. HTTP METHOD: The HTTP verb used (e.g., GET, POST, PUT, PATCH, DELETE).

      2. URL: The endpoint's relative URL.

      3. HEADERS: Any required headers for the request (if mentioned in the code).

      4. REQUEST BODY: The JSON structure for the request body (if applicable).

      5. Response: The type of response the API returns.

      Format Output Example:
      {
      "apis": [
      {
          "method": "GET",
          "url": "/api/books",
          "headers": null,
          "request_body": null, 
          "response": [
              { 
                  "id": 1, 
                  "title": "Book Title",
          
                  "author": "Author Name",
                  "publishedYear": 2023
              }
          ],
          "description": "Retrieves a list of all books."
      },..
      ]
      }

      Source Code: {sourcecode}
      Output?
      `;

  // const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
  // source = fs.readFileSync(fileCode, 'utf8');
  
  const input = prompt.replace('{PROGRAMMING LANGUAGE}', programminglanguage)
  .replace('{sourcecode}', source);
   try {
          const result = await generateResponse(input, apiKey);
          const jsonString = extractCode(result);
          if(jsonString!= null){
              const parsedJson = JSON.parse(jsonString);
              const apisArray = parsedJson.apis;
              if(apisArray){
                  return Promise.resolve(apisArray);
              }
          }
          return [];
          
  } catch (err) {
      console.error('Error: ', err);
      throw err;
  }
}            

export async function genApitest(programminglanguage: string, framework: string, source: string): Promise<string[]> {
  const prompt = `Input Parameters:
  Programming Language: {programminglanguage}
  Framework: {framework}
  API Details: {apidetails}
  Test cases: {testcase}
  Output: API Testing code which be ready to run`;
  const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable

  let input = prompt.replace('{programminglanguage}', programminglanguage)
      .replace('{framework}', framework);

  try {
      const apis = await getAPIsDetails(programminglanguage, source);
      let apitest: string[] = []; 
      // Use for...of to handle async operations in a loop
      for (let api of apis) {
          const testcase = getTestCasesByMethod(api.method);

          // Replace placeholders in input for each API
          let apiInput = input.replace('testcase', testcase).replace('apidetails', JSON.stringify(api));

          // Generate the test case and append it to the result
          const apiTestResult = await generateResponse(apiInput, apiKey);
          apitest.push(apiTestResult)
      }
      return apitest;
  } catch (error) {
      console.error('Error generating API test cases:', error);
      throw new Error(`Failed to generate API test cases. ${error}`);
  }
}



// Define the structure of the expected JSON file
interface ApiTestCase {
  test_case: string;
  expected_status_code: number;
  expected_response: string;
}

interface ApiTestCases {
  GET: ApiTestCase[];
  POST: ApiTestCase[];
  PUT: ApiTestCase[];
  PATCH: ApiTestCase[];
  DELETE: ApiTestCase[];
}

// Function to read and parse the JSON file
const readApiTestCases = (filePath: string): ApiTestCases | null => {
  try {
    const rawData = fa.readFileSync(filePath, 'utf-8');
    const testCases: ApiTestCases = JSON.parse(rawData);
    return testCases;
  } catch (error) {
    console.error('Error reading or parsing the file:', error);
    return null;
  }
};

// // Function to extract test cases for a specific HTTP method
// const getTestCasesByMethod = (method: keyof ApiTestCases, testCases: ApiTestCases | null): ApiTestCase[] | null => {
//   if (testCases) {
//     return testCases[method] || null;
//   }
//   return null;
// };

// async function test() {
//   try {
//     const fileCode = path.join(__dirname, 'Input/sourcecsharp.txt');
//     const source = await fs.readFile(fileCode, 'utf8'); // Asynchronously read the source file

//     const apitestcode = await genApitest("C#", "", source); // Ensure parameter order matches function definition

//     for (let i = 0; i < apitestcode.length; i++) {
//       const apitest = apitestcode[i];
//       console.log(apitest);
//       const filePathOut = path.join(__dirname, `Output/api/apicsharp_${i}.txt`);
//       await fs.writeFile(filePathOut, apitest, { encoding: 'utf8' }); // Asynchronously write the output file
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);
//   }
// }



// ===================================== V2

// test();
function getTree(dir: string, prefix: string = ""): string {
    let treeString = "";
    const files = fa.readdirSync(dir);
  
    files.forEach((file, index) => {
      const isLast = index === files.length - 1;
      const fullPath = path.join(dir, file);
      const isDirectory = fa.statSync(fullPath).isDirectory();
  
      // Thêm tên file hoặc folder vào chuỗi
      treeString += `${prefix}${isLast ? "└── " : "├── "}${file}\n`;
  
      // Nếu là thư mục, đệ quy vào trong thư mục đó
      if (isDirectory) {
        treeString += getTree(fullPath, `${prefix}${isLast ? "    " : "│   "}`);
      }
    });
  
    return treeString;
  }
  
  // Đường dẫn thư mục cần lấy cây thư mục
  const rootDir = "C:\\2024-25\\Offical\\Extension\\experience"; // Thay đổi đường dẫn tại đây
//   const treeOutput = getTree(rootDir); 
  // Hiển thị chuỗi cây thư mục
//   console.log(treeOutput);

async function defineApi (path_code: string): Promise<string>{
    const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    
    const getPromptFile = path.join(__dirname, 'prompts/api_testing/ApiDefinition.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    
    // path_code = path.join(__dirname, 'Input/sourcecsharp.txt');
    const code = fa.readFileSync(path_code, 'utf8');
    
    const input = prompt.replace('{Code}', code)
    const ApiList = await generateResponse(input, apiKey);
    const filePathOut = path.join(__dirname, 'Output/api_testing/ApiList.txt');
    await fs.mkdir(path.dirname(filePathOut), { recursive: true });
    await fs.writeFile(filePathOut, ApiList, { encoding: 'utf8' });
    return ApiList;
}
// defineApi ("");

async function defineRelativeFiles (apilist: string, tree: string): Promise<String[]>{
    const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
    const getPromptFile = path.join(__dirname, 'prompts/api_testing/relativeFiles.txt');
    const prompt = fa.readFileSync(getPromptFile, 'utf8');
    
    // const tree_path = path.join(__dirname, 'Input/tree.txt');
    // tree = fa.readFileSync(tree_path, 'utf8');
    
    // const apis_path = path.join(__dirname, 'Output/api_testing/ApiList.txt');
    // apilist =  fa.readFileSync(apis_path, 'utf8');
    if(apilist != 'none'){
        const input = prompt.replace('{API}', apilist)
                        .replace('{Tree}', tree);
        const relativeFiles = await generateResponse(input, apiKey);
        const arrayFiles = relativeFiles.split(',').map(item => item.trim());
        return arrayFiles;
    }
    return [];
}
// defineRelativeFiles("","");
// Example usage:
// const filePath = path.join(__dirname, 'Output/api_testing/RelativeFiles.txt');
// const proj = "C:/2024-25/IS Dev/DoAn";

function processFiles(files: String[], proj: string) {
    let allcode = "";
    
    // Loop through each line (representing a file name)
    for (let file of files) {
        const fileString = String(file)
        const codePath = path.join(proj, fileString);  // Construct the file path
        try {
            // Read file content
            const code = fa.readFileSync(codePath, 'utf-8');
            
            // Remove empty lines from the file content
            const cleanedCode = code.split('\n')
                                     .filter(line => line.trim() !== '')  // Remove empty lines
                                     .join('\n');
            
            // Append cleaned code to allcode
            allcode += `${file}: \n${cleanedCode}\n\n`;
        } catch (error) {
            // Handle file read errors (e.g., file not found)
            console.error(`Error reading file ${file}:`, error);
            allcode += `${file}: File not found or unable to read\n\n`;
        }
    }
    return allcode;  // Return the concatenated cleaned code
}


// const dir = `C:/2024-25/Offical/Extension/experience/Input/book-store`;
// const tree = getTree(dir);
// console.log(tree);

// C:\2024-25\Offical\Extension\experience\Input\book-store\handlers\bookhandler.go
// const path_code = `C:/2024-25/Offical/Extension/experience/Input/book-store/handlers/bookhandler.go`
// const api = defineApi(path_code);
// console.log(`API list: \n ${api}`);
export async function genApitest01(programminglanguage: string, framework: string, source: string): Promise<string> {
        const apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'; // Assuming you're getting your API key from an environment variable
        
        const getPromptFile = path.join(__dirname, 'prompts/api_testing/getApiTestingCode.txt');
        const prompt = fa.readFileSync(getPromptFile, 'utf8');
            
        const input = prompt.replace('{LANGUAGE}', programminglanguage)
        .replace('{framework}', framework)
        .replace('{Code}', source);    
        try{
            const apitest = await generateResponse(input, apiKey);
            const filePathOut = path.join(__dirname, 'Output/apiTestingCode.go');
            await fs.writeFile(filePathOut, apitest, { encoding: 'utf8' });
            return apitest;
        }                                   
        catch (err) {
            console.error('Error reading file:', err);
            throw err;
        }
    }            
    
async function test(){
    const dir = `C:/2024-25/Offical/Extension/experience/Input/book-store`;
    const tree = getTree(dir);
    console.log(`Tree: `, tree);
    const path_code = `C:/2024-25/Offical/Extension/experience/Input/book-store/routes/routes.go`
    const api = await defineApi(path_code);
    console.log(`Api:`, api);
    const files = await defineRelativeFiles(api, tree);
    console.log(`related Files: `, files);
    const code = processFiles(files, dir);
    console.log(`Code: `,code);
    const apicode = await genApitest01("Go","httptest",code);
    console.log(`Testing code: \n ${apicode}`);
}
test();