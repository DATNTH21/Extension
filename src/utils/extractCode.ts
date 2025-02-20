// export function extractCode(Codestring: string): string | null {
//     // Split the string into lines
//     const lines = Codestring.split('\n');
    
//     // Check if there are at least two lines
//     if (lines.length < 2) {
//         return null;
//     }

//     // Get the substring from line 2
//     const line2 = lines.slice(1).join('\n'); // Join lines starting from line 2
    
//     // Find the position of the first "```"
//     const endIndex = line2.indexOf("```");

//     // If "```" is found, return the substring up to "```"
//     if (endIndex !== -1) {
//         return line2.substring(0, endIndex).trim();
//     }

//     // Return null if no "```" is found
//     return null;
// }

export function extractCode(codeString: string): string | null {
    // Find the first occurrence of triple backticks
    const startIndex = codeString.indexOf("```");
    if (startIndex === -1) return null;

    // Find the next occurrence of triple backticks after the first one
    const endIndex = codeString.indexOf("```", startIndex + 3);
    if (endIndex === -1) return null;

    // Extract the code between the triple backticks 
    const extractedCode = codeString.substring(startIndex + 3, endIndex).trim().replace(/^.*\n/, "").trim();

    return extractedCode;
}
