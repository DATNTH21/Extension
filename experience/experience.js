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
var geminiResponse_1 = require("./geminiResponse");
var fs = require("fs/promises");
var promt = "Prompt: Analyze the following file and identify logical units that should be tested independently for unit testing. Break the file into code snippet parts based on the following considerations:\n1. Functions, classes, or modules that handle specific responsibilities.\n2. Groupings by behavior or purpose, such as input/output handling, core business logic, and error handling.\n3. Dependencies and integrations with external systems that need mocking.\nFormat those code snippet parts into a single plain-text string, with each separated by the pattern :>. Do not include explanations or additional information.\nHere is the code:\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class DirtyJavaFile {\n\n    // Global variables with unnecessary dependencies\n    public static String globalMessage = \"Initialized\";\n    private static int totalCounter = 0;\n    private static boolean isRunning = false;\n\n    // Simple class with state\n    static class SimpleClass1 {\n        private String name;\n\n        public SimpleClass1(String name) {\n            this.name = name;\n        }\n\n        public String getName() {\n            return name;\n        }\n\n        public void printName() {\n            System.out.println(\"Name: \" + name);\n        }\n    }\n\n    // Another simple class with a static counter\n    static class SimpleClass2 {\n        public static int counter = 0;\n\n        public void incrementCounter() {\n            counter++;\n        }\n\n        public int getCounter() {\n            return counter;\n        }\n    }\n\n    // A simple utility class that does nothing meaningful\n    static class SimpleUtility {\n        public void performTask() {\n            System.out.println(\"Performing task...\");\n        }\n\n        public String getInfo() {\n            return \"This is a simple utility.\";\n        }\n    }\n\n    // Complex class handling multiple responsibilities\n    static class ComplexClass1 {\n        private List<Integer> data = new ArrayList<>();\n        private String description;\n\n        public ComplexClass1(String description) {\n            this.description = description;\n        }\n\n        public void addData(int value) {\n            data.add(value);\n        }\n\n        public void printData() {\n            System.out.println(description + \" Data: \" + data);\n        }\n\n        public int computeSum() {\n            int sum = 0;\n            for (int num : data) {\n                sum += num;\n            }\n            return sum;\n        }\n\n        public void resetData() {\n            data.clear();\n        }\n    }\n\n    // Another complex class with multiple methods doing different things\n    static class ComplexClass2 {\n        private List<String> messages = new ArrayList<>();\n        private boolean isActive;\n\n        public ComplexClass2(boolean isActive) {\n            this.isActive = isActive;\n        }\n\n        public void addMessage(String message) {\n            messages.add(message);\n        }\n\n        public void toggleStatus() {\n            isActive = !isActive;\n        }\n\n        public String getStatus() {\n            return isActive ? \"Active\" : \"Inactive\";\n        }\n\n        public void printMessages() {\n            System.out.println(\"Messages: \" + messages);\n        }\n\n        public void clearMessages() {\n            messages.clear();\n        }\n    }\n\n    // Yet another complex class with multiple concerns\n    static class ComplexClass3 {\n        private int calculationValue;\n        private String label;\n\n        public ComplexClass3(String label) {\n            this.label = label;\n        }\n\n        public void setCalculationValue(int value) {\n            this.calculationValue = value;\n        }\n\n        public int performCalculation() {\n            return calculationValue * 2; // Arbitrary calculation\n        }\n\n        public void printLabel() {\n            System.out.println(\"Label: \" + label);\n        }\n\n        public void resetCalculation() {\n            this.calculationValue = 0;\n        }\n    }\n\n    // A function with random utility\n    public static void performTask() {\n        System.out.println(\"Task started...\");\n        SimpleClass1 class1 = new SimpleClass1(\"Task1\");\n        class1.printName();\n\n        SimpleClass2 class2 = new SimpleClass2();\n        class2.incrementCounter();\n        System.out.println(\"Counter: \" + class2.getCounter());\n\n        ComplexClass1 complex1 = new ComplexClass1(\"Complex1\");\n        complex1.addData(5);\n        complex1.addData(10);\n        complex1.printData();\n        System.out.println(\"Sum: \" + complex1.computeSum());\n\n        ComplexClass2 complex2 = new ComplexClass2(true);\n        complex2.addMessage(\"Message 1\");\n        complex2.addMessage(\"Message 2\");\n        complex2.printMessages();\n        System.out.println(\"Status: \" + complex2.getStatus());\n        complex2.toggleStatus();\n        System.out.println(\"Toggled Status: \" + complex2.getStatus());\n\n        ComplexClass3 complex3 = new ComplexClass3(\"Label1\");\n        complex3.setCalculationValue(10);\n        complex3.printLabel();\n        System.out.println(\"Calculation Result: \" + complex3.performCalculation());\n    }\n\n    // A function doing unrelated tasks\n    public static void runMultipleTasks() {\n        SimpleUtility utility = new SimpleUtility();\n        utility.performTask();\n        System.out.println(utility.getInfo());\n\n        ComplexClass1 class1 = new ComplexClass1(\"Class1\");\n        class1.addData(100);\n        class1.addData(200);\n        class1.printData();\n\n        ComplexClass2 class2 = new ComplexClass2(false);\n        class2.addMessage(\"Message A\");\n        class2.printMessages();\n        class2.toggleStatus();\n        System.out.println(\"Status after toggle: \" + class2.getStatus());\n\n        ComplexClass3 class3 = new ComplexClass3(\"Class3\");\n        class3.setCalculationValue(50);\n        class3.printLabel();\n        System.out.println(\"Calculation: \" + class3.performCalculation());\n    }\n\n    // Main function performing all tasks and initializing variables\n    public static void main(String[] args) {\n        System.out.println(\"Program started...\");\n        performTask();\n        runMultipleTasks();\n\n        globalMessage = \"Completed\";\n        totalCounter++;\n        isRunning = true;\n\n        System.out.println(\"Global Message: \" + globalMessage);\n        System.out.println(\"Total Counter: \" + totalCounter);\n        System.out.println(\"Program Running: \" + isRunning);\n    }\n}\n\n";
function writeFunctionResultToFile(filePath, func) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, func()];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, fs.writeFile(filePath, result, 'utf8')];
                case 2:
                    _a.sent(); // Write the result to the file
                    console.log("Result successfully written to ".concat(filePath));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error writing result to file: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
writeFunctionResultToFile('output.txt', function () { return (0, geminiResponse_1.generateResponse)(promt, 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'); });
