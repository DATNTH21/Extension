import * as fa from 'fs';
import * as path from 'path';

export function processFiles(files: String[], proj: string) {
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
