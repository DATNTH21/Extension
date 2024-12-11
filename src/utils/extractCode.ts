export function extractCode(Codestring: string): string | null {
    // Split the string into lines
    const lines = Codestring.split('\n');
    
    // Check if there are at least two lines
    if (lines.length < 2) {
        return null;
    }

    // Get the substring from line 2
    const line2 = lines.slice(1).join('\n'); // Join lines starting from line 2
    
    // Find the position of the first "```"
    const endIndex = line2.indexOf("```");

    // If "```" is found, return the substring up to "```"
    if (endIndex !== -1) {
        return line2.substring(0, endIndex).trim();
    }

    // Return null if no "```" is found
    return null;
}

