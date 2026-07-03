import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '../src/index.css');

let content = fs.readFileSync(file, 'utf-8');

content = content.replace('family=Rajdhani:wght@400;500;600;700&family=Noto+Sans:wght@300;400;500;600&display=swap', 'family=Poppins:wght@300;400;500;600;700&display=swap');
content = content.replace(/Noto Sans/g, 'Poppins');
content = content.replace(/Rajdhani/g, 'Poppins');

fs.writeFileSync(file, content);
