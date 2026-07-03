import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update index.html
const indexHtmlPath = path.join(__dirname, '../index.html');
let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

const ubuntuLinks = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">`;

if (!htmlContent.includes('Ubuntu:ital')) {
    htmlContent = htmlContent.replace('</title>', `</title>${ubuntuLinks}`);
    fs.writeFileSync(indexHtmlPath, htmlContent);
}

// Update index.css
const cssFile = path.join(__dirname, '../src/index.css');
let cssContent = fs.readFileSync(cssFile, 'utf-8');

// Remove Poppins from the Google Fonts import if present
cssContent = cssContent.replace('family=Poppins:wght@300;400;500;600;700&', '');

// Replace all Poppins family declarations with Ubuntu
cssContent = cssContent.replace(/Poppins/g, 'Ubuntu');

fs.writeFileSync(cssFile, cssContent);
