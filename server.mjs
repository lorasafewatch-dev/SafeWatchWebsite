import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5185);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const allowedTopFiles = new Set(['index.html', 'styles.css', 'app.js', 'experience.css', 'experience.js', 'experience-model.js']);

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    // Expose only the website and its assets, never repository files or server source.
    if (!allowedTopFiles.has(relative) && !relative.startsWith('assets/')) { res.writeHead(404).end('Not found'); return; }
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !(await stat(file)).isFile()) { res.writeHead(404).end('Not found'); return; }
    const content = await readFile(file);
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404).end('Not found'); }
});
server.on('error', error => { console.error(`Could not start preview: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`SafeWatch Family website\nLocal: http://127.0.0.1:${port}/\nPress Ctrl+C to stop.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
