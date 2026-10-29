import { mkdir, copyFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'experience.css', 'experience.js', 'experience-model.js']) await copyFile(path.join(root, file), path.join(out, file));
await cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
console.log('Built static website: dist/ (HTML, CSS, JavaScript, and assets).');
