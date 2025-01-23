import * as fs from 'fs';
import * as path from 'path';

// Function to get the folder tree
export function getFolderTree(folderPath: string): any {
    // Read the contents of the directory
    const items = fs.readdirSync(folderPath);

    // Create an object to hold the folder tree
    let tree: any = {};

    // Loop through each item in the directory
    items.forEach((item) => {
        const fullPath = path.join(folderPath, item);

        // Check if the current item is a directory
        if (fs.statSync(fullPath).isDirectory()) {
            // Recursively get the tree of the subdirectory
            tree[item] = getFolderTree(fullPath);
        } else {
            // If it's a file, add it directly to the tree
            tree[item] = null;
        }
    });

    return tree;
}

// Example usage
const folderPath = '../utils';  // Replace with your folder path
const folderTree = getFolderTree(folderPath);
console.log(JSON.stringify(folderTree, null, 2));
