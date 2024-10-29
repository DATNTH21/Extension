import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load existing environment variables from the .env file
dotenv.config();
const envFilePath = '.env';

/**
 * Update a key-value pair in the .env file.
 * @param key - The key to update.
 * @param value - The new value for the key.
 */
export function updateEnvVariable(key: string, value: string): void {
    // Read the existing .env file
    const envContent = fs.readFileSync(envFilePath, 'utf-8');
    
    // Split the content into lines
    const lines = envContent.split('\n');
    
    // Flag to check if the key exists
    let keyExists = false;

    // Update the line that matches the key
    const updatedLines = lines.map(line => {
        if (line.startsWith(`${key}=`)) {
            keyExists = true;
            return `${key}=${value}`; // Update the value
        }
        return line; // Return the line unchanged
    });

    // If the key doesn't exist, add it to the end
    if (!keyExists) {
        updatedLines.push(`${key}=${value}`);
    }

    // Join the updated lines back into a single string
    const updatedEnvContent = updatedLines.join('\n');

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, updatedEnvContent, 'utf-8');
}
