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
exports.getCodeStruct = exports.getMockingSetup = exports.getChainToPrivateMethods = exports.getAuxiliaryMethods = exports.getConstructors = exports.getTestScope = void 0;
var fa = require("fs");
var path = require("path");
var fs_1 = require("fs");
var geminiResponse_1 = require("./geminiResponse");
// Use the function
function getTestScope(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getPromptFile, prompt, input, result, filePathOut, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getPromptFile = path.join(__dirname, 'prompts/preprocessing/getTestScope.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/preprocessing/TestScope.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error reading file:', err_1);
                    throw err_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getTestScope = getTestScope;
function getConstructors(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getPromptFile, prompt, input, result, filePathOut, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getPromptFile = path.join(__dirname, 'prompts/preprocessing/getConstructors.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/preprocessing/Constructors.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_2 = _a.sent();
                    console.error('Error reading file:', err_2);
                    throw err_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getConstructors = getConstructors;
function getAuxiliaryMethods(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getPromptFile, prompt, input, result, filePathOut, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getPromptFile = path.join(__dirname, 'prompts/preprocessing/getAuxiliaryMethods.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/preprocessing/AuxiliaryMethods.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_3 = _a.sent();
                    console.error('Error reading file:', err_3);
                    throw err_3;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getAuxiliaryMethods = getAuxiliaryMethods;
function getChainToPrivateMethods(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getPromptFile, prompt, input, result, filePathOut, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getPromptFile = path.join(__dirname, 'prompts/preprocessing/getChainToPrivateMethods.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/preprocessing/ChainToPrivateMethods.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_4 = _a.sent();
                    console.error('Error reading file:', err_4);
                    throw err_4;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getChainToPrivateMethods = getChainToPrivateMethods;
function getMockingSetup(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getPromptFile, prompt, input, result, filePathOut, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getPromptFile = path.join(__dirname, 'prompts/preprocessing/getMockingSetup.txt');
                    prompt = fa.readFileSync(getPromptFile, 'utf8');
                    input = prompt.replace('{sourcecode}', source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/preprocessing/MockingSetup.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_5 = _a.sent();
                    console.error('Error reading file:', err_5);
                    throw err_5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getMockingSetup = getMockingSetup;
function getCodeStruct(source, apiKey) {
    return __awaiter(this, void 0, void 0, function () {
        var getCodeCoveragePromptFile, prompt, input, result, filePathOut, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getCodeCoveragePromptFile = path.join(__dirname, 'prompts/preprocessing/getCodeStruct.txt');
                    prompt = fa.readFileSync(getCodeCoveragePromptFile, 'utf8');
                    input = prompt + '\n' + source;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, geminiResponse_1.generateResponse)(input, apiKey)];
                case 2:
                    result = _a.sent();
                    filePathOut = path.join(__dirname, 'Output/postprocessing/StructCode.txt');
                    return [4 /*yield*/, fs_1.promises.writeFile(filePathOut, result, { encoding: 'utf8' })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    err_6 = _a.sent();
                    console.error('Error reading file:', err_6);
                    throw err_6;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getCodeStruct = getCodeStruct;
// const testscope = getTestScope('','');
// const constructors = getConstructors('','');
// const auxiliarymethods = getAuxiliaryMethods('','');
// const chainedmethods = getChainToPrivateMethods('','');
// const mockingsetup = getMockingSetup('','');
