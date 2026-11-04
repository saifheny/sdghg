import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const ALLOWED_STATIC_FILES = new Set([
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico'
]);

const ROOT_ASSET_ALIASES = new Map([
  ['/apple-touch-icon.png', '/assets/apple-touch-icon.png'],
  ['/apple-touch-icon-precomposed.png', '/assets/apple-touch-icon.png'],
  ['/icon-192.png', '/assets/icon-192.png'],
  ['/icon-512.png', '/assets/icon-512.png'],
  ['/favicon-32.png', '/assets/favicon-32.png'],
  ['/favicon-16.png', '/assets/favicon-16.png'],
  ['/favicon.svg', '/assets/favicon.svg'],
  ['/og-image.png', '/assets/og-image.png']
]);

function getRequestOrigin(req) {
  const rawProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (!rawHost) return 'https://story-97cf7.web.app';
  const proto = rawProto || (rawHost.startsWith('localhost') || rawHost.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${rawHost}`;
}

const buildReady = import('./build.mjs').catch(err => {
  console.error('Initial build error:', err);
});

const server = http.createServer(async (req, res) => {
  try {
    await buildReady;
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    if (pathname === '/') pathname = '/index.html';
    if (ROOT_ASSET_ALIASES.has(pathname)) {
      pathname = ROOT_ASSET_ALIASES.get(pathname);
    }

    const isAsset = pathname.startsWith('/assets/');
    const isAllowedRoot = ALLOWED_STATIC_FILES.has(pathname);

    if (!isAsset && !isAllowedRoot) {
      pathname = '/index.html';
    }

    const filePath = path.resolve(ROOT, '.' + pathname);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const indexFallback = path.join(ROOT, 'index.html');
      if (fs.existsSync(indexFallback)) {
        const origin = getRequestOrigin(req);
        const rawHtml = fs.readFileSync(indexFallback, 'utf8').replaceAll('https://story-97cf7.web.app', origin);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(rawHtml);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (pathname === '/index.html' || pathname === '/robots.txt' || pathname === '/sitemap.xml') {
      const origin = getRequestOrigin(req);
      const body = fs.readFileSync(filePath, 'utf8').replaceAll('https://story-97cf7.web.app', origin);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      });
      res.end(body);
      return;
    }

    const isCodeBundle = ext === '.js' || ext === '.css' || ext === '.json' || ext === '.webmanifest';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isCodeBundle ? 'no-cache, must-revalidate' : 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local: http://localhost:${PORT}/`);
  console.log(`Network: http://${HOST}:${PORT}/`);
});
