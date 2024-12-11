import { generateResponse } from './geminiResponse';
import * as fs from 'fs';

export async function getRecommendFramework(language: string, code: string, apiKey: string): Promise<string> {
    const recommendframework = `Given the following programming language and code, recommend the most suitable unit testing framework for this language. Only suggest one framework. If the language doesn't have a widely used testing framework, return 'none'. Provide the framework name without any extra explanation.
                                Programming Language: ${language}
                                Code: ${code}
                                Example input:
                                Programming Language: Python
                                Code:

                                python
                                Copy code
                                def add(a, b):
                                    return a + b
                                Example output:
                                unittest
                                Output (Not explain anything)?
                                `;
    try {
        const response = await generateResponse(recommendframework, apiKey);
        return response;
    } catch (error) {
        console.error('Error while detecting languages:', error);
        throw error;
    }
}

const code = `package DemoWebAPI;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;
import java.util.List;
import java.util.stream.Collectors;

public class ComplexLogic {
    public String evaluate(int number, String text) {
        if (number < 0) {
            return "Negative number";
        } else if (number == 0) {
            if (text == null || text.isEmpty()) {
                return "Zero with no text";
            } else {
                return "Zero with text: " + text;
            }
        } else {
            if (text != null && text.length() > 5) {
                return "Positive with long text";
            } else {
                return "Positive with short or no text";
            }
        }
    }

    private String readFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            throw new IllegalArgumentException("File path cannot be null or empty");
        }

        List<String> lines = Files.readAllLines(Paths.get(filePath));
        return lines.stream().collect(Collectors.joining("\n"));
    }

    public String randomOutcome() {
        Random random = new Random();
        int value = random.nextInt(100);

        if (value < 30) {
            return "Low";
        } else if (value < 70) {
            return "Medium";
        } else {
            return "High";
        }
    }

    public String processInput(String input) {
        try {
            int number = Integer.parseInt(input);
            if (number % 2 == 0) {
                return "Even number";
            } else {
                return "Odd number";
            }
        } catch (NumberFormatException e) {
            return "Invalid number format";
        } catch (Exception e) {
            return "Unexpected error: " + e.getMessage();
        }
    }

    public int calculateFactorial(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Negative numbers not allowed");
        }
        return (n == 0) ? 1 : n * calculateFactorial(n - 1);
    }
}`;

const api = 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw';

async function run() {
    try {
        const framework = await getRecommendFramework('Java', code, api);
        console.log(framework);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
