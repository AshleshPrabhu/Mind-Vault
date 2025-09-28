#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Fix relative imports without .js extension
      content = content.replace(
        /from\s+['"]\.\/([^'"]+)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            return match.replace(importPath, `${importPath}.js`);
          }
          return match;
        }
      );
      
      // Fix relative imports with ../ without .js extension
      content = content.replace(
        /from\s+['"]\.\.\/([^'"]+)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            return match.replace(`../${importPath}`, `../${importPath}.js`);
          }
          return match;
        }
      );
      
      fs.writeFileSync(filePath, content);
    }
  });
}

console.log('🔧 Fixing ES module imports...');
const distDir = path.join(__dirname, 'dist');

if (fs.existsSync(distDir)) {
  fixImports(distDir);
  console.log('✅ Import paths fixed successfully!');
} else {
  console.log('❌ dist directory not found. Make sure to run build first.');
  process.exit(1);
}