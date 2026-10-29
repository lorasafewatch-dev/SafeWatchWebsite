import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'styles.css'), 'utf8') + await readFile(path.join(root, 'experience.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
let assetChecks = 0;
for (const match of html.matchAll(/\b(?:src|href)="([^"#]+)"/g)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|tel:)/.test(value)) continue;
  await access(path.join(root, value));
  assetChecks++;
}
for (const match of html.matchAll(/\b(?:href="#|aria-controls=")([^"\s]+)"/g)) assert(ids.includes(match[1]), `Missing anchor/control target: ${match[1]}`);
for (const match of css.matchAll(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g)) await access(path.join(root, match[1]));
assert(!/heart\s+rate/i.test(html), 'Visible terminology must use pulse rate');
assert(html.includes('prefers-reduced-motion') || css.includes('prefers-reduced-motion'), 'Reduced motion support required');
for (const view of ['home', 'location', 'health', 'alerts', 'profile']) {
  assert(html.includes(`data-demo-tab="${view}"`), `Missing ${view} tab`);
  assert(html.includes(`data-demo-panel="${view}"`), `Missing ${view} view`);
}
for (const device of ['iphone', 'android']) {
  assert(html.includes(`data-platform="${device}"`), `Missing ${device} guide switch`);
  assert(html.includes(`data-platform-panel="${device}"`), `Missing ${device} guide`);
}
const files = ['index.html', 'styles.css', 'app.js', 'experience.css', 'experience.js', 'experience-model.js', 'assets/app-icon.svg', 'assets/garden.webp', 'assets/map-preview.svg', 'assets/install-qr.svg'];
let bytes = 0;
for (const file of files) bytes += (await stat(path.join(root, file))).size;
console.log(`Checks passed: ${ids.length} unique IDs, ${assetChecks} asset references, all fragment/control targets, five demo views, both install guides, pulse-rate wording, reduced motion. Core payload: ${(bytes / 1024).toFixed(0)} KB before compression.`);
