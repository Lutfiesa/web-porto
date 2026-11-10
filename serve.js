const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_DIR = path.resolve(__dirname);
const BASE_PREFIX = BASE_DIR + path.sep;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  'Cache-Control': 'no-cache, must-revalidate'
};

const server = http.createServer((req, res) => {
  // Only allow GET and HEAD methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
    res.end('405 Method Not Allowed');
    return;
  }

  // Sanitize requested URL
  let safeUrl = req.url.split('?')[0];
  try {
    safeUrl = decodeURI(safeUrl);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  // Null byte injection protection
  if (safeUrl.indexOf('\0') !== -1) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  if (safeUrl === '/') safeUrl = '/index.html';

  const resolvedPath = path.resolve(path.join(BASE_DIR, safeUrl));

  // Security: strict path traversal defense
  if (!resolvedPath.startsWith(BASE_PREFIX) && resolvedPath !== BASE_DIR && resolvedPath !== path.join(BASE_DIR, 'index.html')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      ...SECURITY_HEADERS
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(resolvedPath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Portfolio local server running at: http://localhost:${PORT}`);
  console.log(`🛡️  Security Headers & Path Traversal Protections active.`);
  console.log(`Tekan Ctrl+C untuk menghentikan server.\n`);
});
