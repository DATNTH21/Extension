import { generateResponse } from './geminiResponse';
import * as fs from 'fs/promises';

const prompt = `Prompt: Analyze the following code snippet and identify logical units that should be tested independently for unit testing based on the following considerations:
1. Functions, classes, or modules that handle specific responsibilities.
2. Groupings by behavior or purpose, such as input/output handling, core business logic, and error handling.
3. Dependencies and integrations with external systems that need mocking.
Then break the whole code into code snippet parts based on your analyzation, format those code snippet parts into a single plain-text string, with each separated by the pattern :>. Do not include explanations or additional information.
Here is the code:
using System;
using System.Collections.Generic;
using System.Linq;

namespace MyUnorganizedApp
{
    // Simple class to hold user details
    public class User
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public string Email { get; set; }

        public User(string name, int age, string email)
        {
            Name = name;
            Age = age;
            Email = email;
        }
    }

    // Utility functions for email validation
    public static class EmailUtils
    {
        public static bool IsValidEmail(string email)
        {
            return email.Contains("@") && email.Contains(".");
        }

        public static string MaskEmail(string email)
        {
            int atIndex = email.IndexOf('@');
            if (atIndex <= 1) return email;

            string masked = email.Substring(0, 1) + new string('*', atIndex - 1) + email.Substring(atIndex);
            return masked;
        }
    }

    // Class for handling user registration
    public class RegistrationHandler
    {
        private List<User> _users = new List<User>();

        public void RegisterUser(string name, int age, string email)
        {
            if (!EmailUtils.IsValidEmail(email))
            {
                Console.WriteLine("Invalid email address.");
                return;
            }

            _users.Add(new User(name, age, email));
            Console.WriteLine($"User {name} registered successfully.");
        }

        public void ListUsers()
        {
            foreach (var user in _users)
            {
                Console.WriteLine($"Name: {user.Name}, Age: {user.Age}, Email: {EmailUtils.MaskEmail(user.Email)}");
            }
        }
    }

    // Unrelated functions for random string generation
    public static class RandomUtils
    {
        public static string GenerateRandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }

    // Class to simulate file operations
    public class FileHandler
    {
        public void SaveToFile(string fileName, string content)
        {
            System.IO.File.WriteAllText(fileName, content);
            Console.WriteLine($"Content saved to {fileName}");
        }

        public string ReadFromFile(string fileName)
        {
            if (!System.IO.File.Exists(fileName))
                return "File not found.";

            return System.IO.File.ReadAllText(fileName);
        }
    }

    // Unrelated method to check if a number is prime
    public static class MathUtils
    {
        public static bool IsPrime(int number)
        {
            if (number < 2) return false;

            for (int i = 2; i <= Math.Sqrt(number); i++)
            {
                if (number % i == 0)
                    return false;
            }

            return true;
        }
    }

    // Complicated class mixing different functionalities
    public class MixedHandler
    {
        public void HandleUsers(List<User> users)
        {
            foreach (var user in users)
            {
                Console.WriteLine($"User: {user.Name}, Is Adult: {user.Age >= 18}");
            }
        }

        public void RandomFileTask(string fileName)
        {
            var randomContent = RandomUtils.GenerateRandomString(20);
            var fileHandler = new FileHandler();
            fileHandler.SaveToFile(fileName, randomContent);
            Console.WriteLine($"Random content written to {fileName}");
        }
    }

    // Entry point
    public static class Program
    {
        public static void Main(string[] args)
        {
            var regHandler = new RegistrationHandler();
            regHandler.RegisterUser("Alice", 25, "alice@example.com");
            regHandler.RegisterUser("Bob", 17, "invalid-email");
            regHandler.ListUsers();

            Console.WriteLine("Random String: " + RandomUtils.GenerateRandomString(10));
            Console.WriteLine("Is 29 prime? " + MathUtils.IsPrime(29));

            var fileHandler = new FileHandler();
            fileHandler.SaveToFile("example.txt", "Hello, World!");
            Console.WriteLine(fileHandler.ReadFromFile("example.txt"));

            var mixedHandler = new MixedHandler();
            mixedHandler.RandomFileTask("random.txt");

            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
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
