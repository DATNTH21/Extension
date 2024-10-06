"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTests = exports.generateUnitTests = void 0;
const vscode = __importStar(require("vscode"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function generateResponse(query, apiKey) {
    // Google Generative AI configuration
    const configuration = new generative_ai_1.GoogleGenerativeAI(apiKey); // Use non-null assertion since we expect this to be defined
    const modelId = "text-embedding-004";
    // Define safety settings for content generation
    const safetySettings = [
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE,
        },
    ];
    // Retrieve the generative model
    const generativeModel = configuration.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings,
    });
    // Generate the response
    const result = await generativeModel.generateContent(`Question: ${query}`);
    return result.response.text(); // Assuming this returns the response text
}
/**
 * Generate unit tests from the provided code using the Gemini API.
 *
 * @param code - The source code for which to generate unit tests.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The generated unit tests as a string.
 */
async function generateUnitTests(code, apiKey) {
    try {
        const prompt = "Write unit test code for the following function, ensuring that all acceptance criteria are met. Function Code: ";
        // You can still call the Gemini API here for unit tests generation
        const response = generateResponse(prompt + code, apiKey);
        return response; // Assuming the response contains the generated tests
    }
    catch (err) {
        const errorMessage = err.message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}
exports.generateUnitTests = generateUnitTests;
/**
 * Validate unit tests against acceptance criteria using the Gemini API.
 *
 * @param acceptanceCriteria - The criteria against which the tests are validated.
 * @param apiKey - The API key for authenticating with the Gemini API.
 * @returns The validation results.
 */
async function validateTests(acceptanceCriteria, apiKey) {
    try {
        const acceptvalues = "Validate the following unit tests against the provided acceptance criteria and ensure they meet the following requirements: ";
        const response = generateResponse(acceptvalues + acceptanceCriteria, apiKey);
        return response; // Assuming the response contains the validation results
    }
    catch (err) {
        const errorMessage = err.message;
        vscode.window.showErrorMessage(`Failed to read or generate code: ${errorMessage}`);
        return errorMessage;
    }
}
exports.validateTests = validateTests;
