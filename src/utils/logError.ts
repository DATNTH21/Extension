import * as fs from 'fs';

// export function makeFileNew(filePath: string = '../error/error.txt'): void {
//     try {
//         fs.writeFileSync(filePath, '', 'utf-8');
//         console.log(`Error file has been cleared.`);
//     } catch (err) {
//         if (err instanceof Error) {
//             console.error(`An error occurred while clearing the file: `, err);
//         }
//     }
// }

export function logErrorToFile(errorMessage: string, error: Error, filePath: string = '../error/error.txt'): void {
    const logMessage = `${errorMessage} ${error.message}\n${error.stack}\n`;
    console.error(errorMessage, error);

    // Append the error log to the file
    fs.appendFile(filePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write error to file:', err);
        }
    });
}

// export function readErrorFile(filePath: string = '../error/error.txt'): string {
//     try {
//         const content = fs.readFileSync(filePath, 'utf-8');
//         return content;
//     } catch (err) {
//         console.error('Failed to read the file:', err);
//         return '';
//     }
// }