"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.genApitest01 = exports.genApitest = exports.getAPIsDetails = exports.getTestCasesByMethod = exports.extractCode = void 0;
var fa = require("fs");
var path = require("path");
var fs_1 = require("fs");
var geminiResponse_1 = require("./geminiResponse");
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
function extractCode(Codestring) {
    // Split the string into lines
    var lines = Codestring.split('\n');
    // Check if there are at least two lines
    if (lines.length < 2) {
        return null;
    }
    // Get the substring from line 2
    var line2 = lines.slice(1).join('\n'); // Join lines starting from line 2
    // Find the position of the first "```"
    var endIndex = line2.indexOf("```");
    // If "```" is found, return the substring up to "```"
    if (endIndex !== -1) {
        return line2.substring(0, endIndex).trim();
    }
    // Return null if no "```" is found
    return null;
}
exports.extractCode = extractCode;
// Function to extract test cases for a specific HTTP method
var getTestCasesByMethod = function (method) {
    var rawData = "{\n                    \"GET\": [\n                    {\n                        \"test_case\": \"Right Input\",\n                        \"expected_status_code\": 200,\n                        \"expected_response\": \"The resource exists, response can be an array, object, or null.\"\n                    },\n                    {\n                        \"test_case\": \"Wrong Input\",\n                        \"expected_status_code\": 404,\n                        \"expected_response\": \"{ \"error\": \"Resource not found\", \"message\": \"...\" }\"\n                    },\n                    {\n                        \"test_case\": \"Failed\",\n                        \"expected_status_code\": 500,\n                        \"expected_response\": \"{ \"error\": \"Internal Server Error\", \"message\": \"...\" }\"\n                    }\n                    ],\n                    \"POST\": [\n                    {\n                        \"test_case\": \"Passed\",\n                        \"expected_status_code\": 201,\n                        \"expected_response\": \"{ \"id\": 1, \"title\": \"New Book Title\", \"author\": \"New Author\", \"publishedYear\": 2024 }\"\n                    },\n                    {\n                        \"test_case\": \"Call API Get Data After Post\",\n                        \"expected_status_code\": 200,\n                        \"expected_response\": \"{ \"id\": 1, \"title\": \"New Book Title\", \"author\": \"New Author\", \"publishedYear\": 2024 }\"\n                    },\n                    {\n                        \"test_case\": \"Failed\",\n                        \"expected_status_code\": 400,\n                        \"expected_response\": \"{ \"error\": \"Bad Request\", \"message\": \"Invalid input data.\" }\"\n                    }\n                    ],\n                    \"PUT\": [\n                    {\n                        \"test_case\": \"Passed\",\n                        \"expected_status_code\": 200,\n                        \"expected_response\": \"{ \"id\": 1, \"title\": \"Updated Book Title\", \"author\": \"Updated Author\", \"publishedYear\": 2025 }\"\n                    },\n                    {\n                        \"test_case\": \"Failed\",\n                        \"expected_status_code\": 400,\n                        \"expected_response\": \"{ \"error\": \"Bad Request\", \"message\": \"ID mismatch or invalid data.\" }\"\n                    },\n                    {\n                        \"test_case\": \"Not Found\",\n                        \"expected_status_code\": 404,\n                        \"expected_response\": \"{ \"error\": \"Resource Not Found\", \"message\": \"Resource not found\" }\"\n                    }\n                    ],\n                    \"PATCH\": [\n                    {\n                        \"test_case\": \"Passed\",\n                        \"expected_status_code\": 200,\n                        \"expected_response\": \"{ \"id\": 1, \"title\": \"Partially Updated Book Title\", \"author\": \"Updated Author\", \"publishedYear\": 2024 }\"\n                    },\n                    {\n                        \"test_case\": \"Failed\",\n                        \"expected_status_code\": 400,\n                        \"expected_response\": \"{ \"error\": \"Bad Request\", \"message\": \"Invalid patch data\" }\"\n                    },\n                    {\n                        \"test_case\": \"Not Found\",\n                        \"expected_status_code\": 404,\n                        \"expected_response\": \"{ \"error\": \"Resource Not Found\", \"message\": \"Resource not found\" }\"\n                    }\n                    ],\n                    \"DELETE\": [\n                    {\n                        \"test_case\": \"Passed\",\n                        \"expected_status_code\": 200,\n                        \"expected_response\": \"{ \"message\": \"Resource deleted successfully.\" }\"\n                    },\n                    {\n                        \"test_case\": \"Call API Get Data After Delete\",\n                        \"expected_status_code\": 404,\n                        \"expected_response\": \"{ \"error\": \"Not Found\", \"message\": \"The resource was deleted and no longer exists.\" }\"\n                    },\n                    {\n                        \"test_case\": \"Failed\",\n                        \"expected_status_code\": 404,\n                        \"expected_response\": \"{ \"error\": \"Not Found\", \"message\": \"Resource not found for deletion.\" }\"\n                    },\n                    {\n                        \"test_case\": \"Server Error\",\n                        \"expected_status_code\": 500,\n                        \"expected_response\": \"{ \"error\": \"Internal Server Error\", \"message\": \"An error occurred while deleting the resource.\" }\"\n                    }\n                    ]\n                }\n                ";
    try {
        var testCases = JSON.parse(rawData);
        var testCasesByMethod = testCases[method].toString();
        if (testCases) {
            return testCasesByMethod;
        }
    }
    catch (error) {
        console.error('Error reading or parsing the file:', error);
        return "";
    }
    return "";
};
exports.getTestCasesByMethod = getTestCasesByMethod;
function getAPIsDetails(programminglanguage, source) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, getPromptFile, prompt, input, result, jsonString, parsedJson, apisArray, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';
                    getPromptFile = path.join(__dirname, 'prompts/api_testing/getAPIsDetails.txt');
                    prompt = "Analyze the provided {PROGRAMMING LANGUAGE} code for API definitions in the SOURCE CODE. Extract the following details for each API endpoint:\n      1. HTTP METHOD: The HTTP verb used (e.g., GET, POST, PUT, PATCH, DELETE).\n\n      2. URL: The endpoint's relative URL.\n\n      3. HEADERS: Any required headers for the request (if mentioned in the code).\n\n      4. REQUEST BODY: The JSON structure for the request body (if applicable).\n\n      5. Response: The type of response the API returns.\n\n      Format Output Example:\n      {\n      \"apis\": [\n      {\n          \"method\": \"GET\",\n          \"url\": \"/api/books\",\n          \"headers\": null,\n          \"request_body\": null, \n          \"response\": [\n              { \n                  \"id\": 1, \n                  \"title\": \"Book Title\",\n          \n                  \"author\": \"Author Name\",\n                  \"publishedYear\": 2023\n              }\n          ],\n          \"description\": \"Retrieves a list of all books.\"\n      },..\n      ]\n      }\n\n      Source Code: {sourcecode}\n      Output?\n      ";
                    input = prompt.replace('{PROGRAMMING LANGUAGE}', programminglanguage)
                        .replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    jsonString = extractCode(result);
                    if (jsonString != null) {
                        parsedJson = JSON.parse(jsonString);
                        apisArray = parsedJson.apis;
                        if (apisArray) {
                            return [2 /*return*/, Promise.resolve(apisArray)];
                        }
                    }
                    return [2 /*return*/, []];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error: ', err_1);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getAPIsDetails = getAPIsDetails;
function genApitest(programminglanguage, framework, source) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, apiKey, input, apis, apitest, _i, apis_1, api, testcase, apiInput, apiTestResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "Input Parameters:\n  Programming Language: {programminglanguage}\n  Framework: {framework}\n  API Details: {apidetails}\n  Test cases: {testcase}\n  Output: API Testing code which be ready to run";
                    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';
                    input = prompt.replace('{programminglanguage}', programminglanguage)
                        .replace('{framework}', framework);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, getAPIsDetails(programminglanguage, source)];
                case 2:
                    apis = _a.sent();
                    apitest = [];
                    _i = 0, apis_1 = apis;
                    _a.label = 3;
                case 3:
                    if (!(_i < apis_1.length)) return [3 /*break*/, 6];
                    api = apis_1[_i];
                    testcase = (0, exports.getTestCasesByMethod)(api.method);
                    apiInput = input.replace('testcase', testcase).replace('apidetails', JSON.stringify(api));
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(apiInput, apiKey)];
                case 4:
                    apiTestResult = _a.sent();
                    apitest.push(apiTestResult);
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, apitest];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error generating API test cases:', error_1);
                    throw new Error("Failed to generate API test cases. ".concat(error_1));
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.genApitest = genApitest;
// Function to read and parse the JSON file
var readApiTestCases = function (filePath) {
    try {
        var rawData = fa.readFileSync(filePath, 'utf-8');
        var testCases = JSON.parse(rawData);
        return testCases;
    }
    catch (error) {
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
function getTree(dir, prefix) {
    if (prefix === void 0) { prefix = ""; }
    var treeString = "";
    var files = fa.readdirSync(dir);
    files.forEach(function (file, index) {
        var isLast = index === files.length - 1;
        var fullPath = path.join(dir, file);
        var isDirectory = fa.statSync(fullPath).isDirectory();
        // Thêm tên file hoặc folder vào chuỗi
        treeString += "".concat(prefix).concat(isLast ? "└── " : "├── ").concat(file, "\n");
        // Nếu là thư mục, đệ quy vào trong thư mục đó
        if (isDirectory) {
            treeString += getTree(fullPath, "".concat(prefix).concat(isLast ? "    " : "│   "));
        }
    });
    return treeString;
}
// Đường dẫn thư mục cần lấy cây thư mục
var rootDir = "C:\\2024-25\\Offical\\Extension\\experience"; // Thay đổi đường dẫn tại đây
//   const treeOutput = getTree(rootDir); 
// Hiển thị chuỗi cây thư mục
//   console.log(treeOutput);
function defineApi(path_code) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, getPromptFile, prompt, code, input, ApiList, filePathOut;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';
                    getPromptFile = path.join(__dirname, 'prompts/api_testing/ApiDefinition.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    code = fa.readFileSync(path_code, 'utf8');
                    input = prompt.replace('{Code}', code);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 1:
                    ApiList = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/api_testing/ApiList.txt');
                    return [4 /*yield*/, fs_1.promises.mkdir(path.dirname(filePathOut), { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, ApiList, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, ApiList];
            }
        });
    });
}
// defineApi ("");
function defineRelativeFiles(apilist, tree) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, getPromptFile, prompt, input, relativeFiles, arrayFiles;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';
                    getPromptFile = path.join(__dirname, 'prompts/api_testing/relativeFiles.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    if (!(apilist != 'none')) return [3 /*break*/, 2];
                    input = prompt.replace('{API}', apilist)
                        .replace('{Tree}', tree);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 1:
                    relativeFiles = _a.sent();
                    arrayFiles = relativeFiles.split(',').map(function (item) { return item.trim(); });
                    return [2 /*return*/, arrayFiles];
                case 2: return [2 /*return*/, []];
            }
        });
    });
}
// defineRelativeFiles("","");
// Example usage:
// const filePath = path.join(__dirname, 'Output/api_testing/RelativeFiles.txt');
// const proj = "C:/2024-25/IS Dev/DoAn";
function processFiles(files, proj) {
    var allcode = "";
    // Loop through each line (representing a file name)
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var fileString = String(file);
        var codePath = path.join(proj, fileString); // Construct the file path
        try {
            // Read file content
            var code = fa.readFileSync(codePath, 'utf-8');
            // Remove empty lines from the file content
            var cleanedCode = code.split('\n')
                .filter(function (line) { return line.trim() !== ''; }) // Remove empty lines
                .join('\n');
            // Append cleaned code to allcode
            allcode += "".concat(file, ": \n").concat(cleanedCode, "\n\n");
        }
        catch (error) {
            // Handle file read errors (e.g., file not found)
            console.error("Error reading file ".concat(file, ":"), error);
            allcode += "".concat(file, ": File not found or unable to read\n\n");
        }
    }
    return allcode; // Return the concatenated cleaned code
}
// const dir = `C:/2024-25/Offical/Extension/experience/Input/book-store`;
// const tree = getTree(dir);
// console.log(tree);
// C:\2024-25\Offical\Extension\experience\Input\book-store\handlers\bookhandler.go
// const path_code = `C:/2024-25/Offical/Extension/experience/Input/book-store/handlers/bookhandler.go`
// const api = defineApi(path_code);
// console.log(`API list: \n ${api}`);
function genApitest01(programminglanguage, framework, source) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, getPromptFile, prompt, input, apitest, filePathOut, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';
                    getPromptFile = path.join(__dirname, 'prompts/api_testing/getApiTestingCode.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{LANGUAGE}', programminglanguage)
                        .replace('{framework}', framework)
                        .replace('{Code}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    apitest = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/apiTestingCode.go');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, apitest, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, apitest];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error reading file:', err_2);
                    throw err_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.genApitest01 = genApitest01;
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var dir, tree, path_code, api, files, code, apicode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = "C:/2024-25/Offical/Extension/experience/Input/book-store";
                    tree = getTree(dir);
                    console.log("Tree: ", tree);
                    path_code = "C:/2024-25/Offical/Extension/experience/Input/book-store/routes/routes.go";
                    return [4 /*yield*/, defineApi(path_code)];
                case 1:
                    api = _a.sent();
                    console.log("Api:", api);
                    return [4 /*yield*/, defineRelativeFiles(api, tree)];
                case 2:
                    files = _a.sent();
                    console.log("related Files: ", files);
                    code = processFiles(files, dir);
                    console.log("Code: ", code);
                    return [4 /*yield*/, genApitest01("Go", "httptest", code)];
                case 3:
                    apicode = _a.sent();
                    console.log("Testing code: \n ".concat(apicode));
                    return [2 /*return*/];
            }
        });
    });
}
test();
