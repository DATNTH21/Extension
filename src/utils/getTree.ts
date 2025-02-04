import * as fa from 'fs';
import * as path from 'path';

export function getTree(dir: string, prefix: string = ""): string {
    let treeString = "";
    const files = fa.readdirSync(dir);
  
    files.forEach((file, index) => {
      const isLast = index === files.length - 1;
      const fullPath = path.join(dir, file);
      const isDirectory = fa.statSync(fullPath).isDirectory();
  
      // Thêm tên file hoặc folder vào chuỗi
      treeString += `${prefix}${isLast ? "└── " : "├── "}${file}\n`;
  
      // Nếu là thư mục, đệ quy vào trong thư mục đó
      if (isDirectory) {
        treeString += getTree(fullPath, `${prefix}${isLast ? "    " : "│   "}`);
      }
    });
  
    return treeString;
  }
