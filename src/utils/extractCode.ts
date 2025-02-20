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
