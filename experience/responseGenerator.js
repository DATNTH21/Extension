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
exports.detectLanguages = exports.generateTestingCode = exports.getFunctionTypeFocusKeys = exports.getFunctionTypes = exports.splitCodeToFunctions = exports.getFrameworkList = exports.getCodeReviewResponse = void 0;
var geminiResponse_1 = require("./geminiResponse");
function getCodeReviewResponse(code, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var codeReviewPrompt, validCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    codeReviewPrompt = "Review the following code for completeness and syntax correctness: ".concat(code, ". Respond with \"valid\" if it is correct not explain anything, or \"non valid\" if it is incorrect, providing a brief reason for the invalidity.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(codeReviewPrompt, apiKey)];
                case 2:
                    validCode = _a.sent();
                    return [2 /*return*/, validCode.replace(/\s+/g, '')];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error while generating response:", error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getCodeReviewResponse = getCodeReviewResponse;
function getFrameworkList(language, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getFrameworkListPrompt, response, frameworks, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getFrameworkListPrompt = "Provide a list of top 5 popular testing frameworks for ".concat(language, ". Format the response as a comma-separated list (a, b, c) without any explanations.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(getFrameworkListPrompt, apiKey)];
                case 2:
                    response = _a.sent();
                    frameworks = response.split(",");
                    return [2 /*return*/, frameworks];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error while fetching framework list:", error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getFrameworkList = getFrameworkList;
function splitCodeToFunctions(code, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var splitCodePrompt, responseString, functions, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    splitCodePrompt = "Prompt: You are an AI code formatting assistant. Your task is to separate the following code into classes (if can) or functional code (not including library, defined variables;) and format it into a single string (plain text), where each is separated by :>. Please provide the output without any additional information or context, just return the formatted string. Here's the code:".concat(code);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(splitCodePrompt, apiKey)];
                case 2:
                    responseString = _a.sent();
                    functions = responseString.split(":>");
                    // Loại bỏ các khoảng trắng dư thừa ở đầu và cuối mỗi hàm
                    return [2 /*return*/, functions.map(function (func) { return func.trim(); })];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error while splitting code into functions:", error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.splitCodeToFunctions = splitCodeToFunctions;
function getFunctionTypes(language, func, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getFunctionTypesPrompt, functionTypesRes, functionTypes, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getFunctionTypesPrompt = "Provide a comprehensive list of function types in ".concat(language, " for my code. Include all relevant categories, such as pure functions, anonymous functions, higher-order functions, and any other types specific to the language. Respond in the format array: function type 01, function type 02, function type 03, ... without explanations or hierarchies. Here's the code: ").concat(func);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(getFunctionTypesPrompt, apiKey)];
                case 2:
                    functionTypesRes = _a.sent();
                    functionTypes = functionTypesRes.replace(/^array:\s*/, '').split(', ').map(function (item) { return item.trim(); });
                    return [2 /*return*/, functionTypes];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error while fetching function types:", error_4);
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getFunctionTypes = getFunctionTypes;
function getFunctionTypeFocusKeys(type, apiKey) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var functionTypeFocusPrompt, focusKeysResponse, extractedContent, contentWithoutBrackets, splitResult, error_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    functionTypeFocusPrompt = "Provide a structured format:<{ focusKey: string; testCases: Array<string> }>) containing test focus keys and cases (different aspects to be tested) for the function types ".concat(type, ". Each focus key should include the different aspects to be tested. Not explain anything.");
                    Promise;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(functionTypeFocusPrompt, apiKey)];
                case 2:
                    focusKeysResponse = _c.sent();
                    extractedContent = (_b = (_a = focusKeysResponse.match(/\[(.*)\]/s)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
                    contentWithoutBrackets = extractedContent.slice(1, -1);
                    splitResult = contentWithoutBrackets.split(/},/).map(function (item) { return item + '}'; });
                    console.log(extractedContent);
                    // Parse the modified string as JSON
                    // const focusKeys: Array<{ focusKey: string; testCases: Array<string> }> = JSON.parse(cleanedString);
                    return [2 /*return*/, splitResult];
                case 3:
                    error_5 = _c.sent();
                    console.error("Error generating focus keys or parsing response:", error_5);
                    return [2 /*return*/, []]; // Return an empty array or handle the error as appropriate
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getFunctionTypeFocusKeys = getFunctionTypeFocusKeys;
function generateTestingCode(language, selectedFramework, func, 
// type: string,
// focusKeys: string,
apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var functionalPrompt, unitTest, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    functionalPrompt = "Generate testing code based on the following input:\n    Language: ".concat(language, "\n    Framework: ").concat(selectedFramework, "\n    Code: ").concat(func, "\n    In the response, only include code; if it's not code, comment it out. Add a descriptive comment above the function to explain its purpose and functionality without using any Markdown formatting. Ensure that the response is in a plain text format, without any Markdown formatting.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(functionalPrompt, apiKey)];
                case 2:
                    unitTest = _a.sent();
                    return [2 /*return*/, unitTest];
                case 3:
                    error_6 = _a.sent();
                    console.error("Error while generating testing code:", error_6);
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.generateTestingCode = generateTestingCode;
function detectLanguages(code, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var detectedLanguagesPrompt, response, languages, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    detectedLanguagesPrompt = "List the detected programming languages for the following code: ".concat(code, ". Respond only with a comma-separated list without explanations.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(detectedLanguagesPrompt, apiKey)];
                case 2:
                    response = _a.sent();
                    languages = response.split(',').map(function (lang) { return lang.trim(); });
                    return [2 /*return*/, languages];
                case 3:
                    error_7 = _a.sent();
                    console.error("Error while detecting languages:", error_7);
                    throw error_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.detectLanguages = detectLanguages;
