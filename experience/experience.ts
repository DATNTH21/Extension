import { generateResponse } from './geminiResponse';
import * as fs from 'fs/promises';

const prompt = `Prompt: Analyze the following file and identify logical units that should be tested independently for unit testing. Break the file into code snippet parts based on the following considerations:
1. Functions, classes, or modules that handle specific responsibilities.
2. Groupings by behavior or purpose, such as input/output handling, core business logic, and error handling.
3. Dependencies and integrations with external systems that need mocking.
Format those code snippet parts into a single plain-text string, with each separated by the pattern :>. Do not include explanations or additional information.
Here is the code:
import java.util.ArrayList;
import java.util.List;

public class DirtyJavaFile {

    // Global variables with unnecessary dependencies
    public static String globalMessage = "Initialized";
    private static int totalCounter = 0;
    private static boolean isRunning = false;

    // Simple class with state
    static class SimpleClass1 {
        private String name;

        public SimpleClass1(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void printName() {
            System.out.println("Name: " + name);
        }
    }

    // Another simple class with a static counter
    static class SimpleClass2 {
        public static int counter = 0;

        public void incrementCounter() {
            counter++;
        }

        public int getCounter() {
            return counter;
        }
    }

    // A simple utility class that does nothing meaningful
    static class SimpleUtility {
        public void performTask() {
            System.out.println("Performing task...");
        }

        public String getInfo() {
            return "This is a simple utility.";
        }
    }

    // Complex class handling multiple responsibilities
    static class ComplexClass1 {
        private List<Integer> data = new ArrayList<>();
        private String description;

        public ComplexClass1(String description) {
            this.description = description;
        }

        public void addData(int value) {
            data.add(value);
        }

        public void printData() {
            System.out.println(description + " Data: " + data);
        }

        public int computeSum() {
            int sum = 0;
            for (int num : data) {
                sum += num;
            }
            return sum;
        }

        public void resetData() {
            data.clear();
        }
    }

    // Another complex class with multiple methods doing different things
    static class ComplexClass2 {
        private List<String> messages = new ArrayList<>();
        private boolean isActive;

        public ComplexClass2(boolean isActive) {
            this.isActive = isActive;
        }

        public void addMessage(String message) {
            messages.add(message);
        }

        public void toggleStatus() {
            isActive = !isActive;
        }

        public String getStatus() {
            return isActive ? "Active" : "Inactive";
        }

        public void printMessages() {
            System.out.println("Messages: " + messages);
        }

        public void clearMessages() {
            messages.clear();
        }
    }

    // Yet another complex class with multiple concerns
    static class ComplexClass3 {
        private int calculationValue;
        private String label;

        public ComplexClass3(String label) {
            this.label = label;
        }

        public void setCalculationValue(int value) {
            this.calculationValue = value;
        }

        public int performCalculation() {
            return calculationValue * 2; // Arbitrary calculation
        }

        public void printLabel() {
            System.out.println("Label: " + label);
        }

        public void resetCalculation() {
            this.calculationValue = 0;
        }
    }

    // A function with random utility
    public static void performTask() {
        System.out.println("Task started...");
        SimpleClass1 class1 = new SimpleClass1("Task1");
        class1.printName();

        SimpleClass2 class2 = new SimpleClass2();
        class2.incrementCounter();
        System.out.println("Counter: " + class2.getCounter());

        ComplexClass1 complex1 = new ComplexClass1("Complex1");
        complex1.addData(5);
        complex1.addData(10);
        complex1.printData();
        System.out.println("Sum: " + complex1.computeSum());

        ComplexClass2 complex2 = new ComplexClass2(true);
        complex2.addMessage("Message 1");
        complex2.addMessage("Message 2");
        complex2.printMessages();
        System.out.println("Status: " + complex2.getStatus());
        complex2.toggleStatus();
        System.out.println("Toggled Status: " + complex2.getStatus());

        ComplexClass3 complex3 = new ComplexClass3("Label1");
        complex3.setCalculationValue(10);
        complex3.printLabel();
        System.out.println("Calculation Result: " + complex3.performCalculation());
    }

    // A function doing unrelated tasks
    public static void runMultipleTasks() {
        SimpleUtility utility = new SimpleUtility();
        utility.performTask();
        System.out.println(utility.getInfo());

        ComplexClass1 class1 = new ComplexClass1("Class1");
        class1.addData(100);
        class1.addData(200);
        class1.printData();

        ComplexClass2 class2 = new ComplexClass2(false);
        class2.addMessage("Message A");
        class2.printMessages();
        class2.toggleStatus();
        System.out.println("Status after toggle: " + class2.getStatus());

        ComplexClass3 class3 = new ComplexClass3("Class3");
        class3.setCalculationValue(50);
        class3.printLabel();
        System.out.println("Calculation: " + class3.performCalculation());
    }

    // Main function performing all tasks and initializing variables
    public static void main(String[] args) {
        System.out.println("Program started...");
        performTask();
        runMultipleTasks();

        globalMessage = "Completed";
        totalCounter++;
        isRunning = true;

        System.out.println("Global Message: " + globalMessage);
        System.out.println("Total Counter: " + totalCounter);
        System.out.println("Program Running: " + isRunning);
    }
}

`
async function writeFunctionResultToFile(filePath: string, func: () => Promise<string>): Promise<void> {
    try {
        const result = await func(); // Await the result of the Promise
        await fs.writeFile(filePath, result, 'utf8'); // Write the result to the file
        console.log(`Result successfully written to ${filePath}`);
    } catch (error) {
        console.error(`Error writing result to file: ${error}`);
    }
}
writeFunctionResultToFile('output.txt', () => generateResponse(prompt, 'AIzaSyDXmoUw6_s7FgJiSKKAPcDvJgaLJ1xMVrw'))
