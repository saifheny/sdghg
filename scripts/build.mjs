import { build } from 'esbuild';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TITLE, headTags, noscriptBlock, robotsTxt, sitemapXml } from './seo.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');

fs.mkdirSync(ASSETS_DIR, { recursive: true });

// 1) تجميع وضغط كود TypeScript + React 18 داخل نطاق معزول بالكامل (IIFE) بدون أي خرائط مصدرية
await build({
  entryPoints: [path.join(ROOT, 'src', 'main.tsx')],
  outfile: path.join(ASSETS_DIR, 'wasla.app.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  sourcemap: false,
  drop: ['debugger'],
  legalComments: 'none',
  charset: 'utf8',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

// 2) تجميع وضغط ملف التصميم المعماري CSS3 بدون خرائط مصدرية
await build({
  entryPoints: [path.join(ROOT, 'styles', 'wasla.css')],
  outfile: path.join(ASSETS_DIR, 'wasla.css'),
  bundle: true,
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  charset: 'utf8'
});

// 3) حساب بصمات التحقق التشفيرية SHA-384 (Subresource Integrity)
const sha384 = filePath => {
  const buf = fs.readFileSync(filePath);
  return 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
};

const cssSri = sha384(path.join(ASSETS_DIR, 'wasla.css'));
const jsSri = sha384(path.join(ASSETS_DIR, 'wasla.app.js'));
const cssVer = cssSri.slice(7, 15).replace(/[^a-zA-Z0-9]/g, 'x');
const jsVer = jsSri.slice(7, 15).replace(/[^a-zA-Z0-9]/g, 'x');

// 4) التحقق الصارم من خلو قالب HTML من أي سكربتات مدمجة أو خصائص حدثية
const bodyShell = fs.readFileSync(path.join(ROOT, 'src', 'shell.template.html'), 'utf8').trim();
if (/<script\b/i.test(bodyShell) || /<style\b/i.test(bodyShell) || /\son[a-z]+\s*=/i.test(bodyShell)) {
  throw new Error('Security check failed: shell.template.html contains inline script/style/event attributes!');
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://cdnjs.cloudflare.com https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://accounts.google.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebasestorage.app https://*.gstatic.com https://cdnjs.cloudflare.com https://us-central1-story-97cf7.cloudfunctions.net",
  "frame-src https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

const fav32B64 = fs.readFileSync(path.join(ASSETS_DIR, 'favicon-32.png')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="ar-EG" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${TITLE}</title>
${headTags()}
<meta name="theme-color" content="#FAF4EC">
<meta name="application-name" content="وصلة">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="وصلة">
<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,${fav32B64}">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/icon-512.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="apple-touch-icon-precomposed" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./assets/wasla.css?v=${cssVer}" integrity="${cssSri}">
</head>
<body>
${bodyShell}
${noscriptBlock()}

<!-- Firebase SDKs (compat) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.2/firebase-app-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.2/firebase-auth-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.2/firebase-firestore-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.2/firebase-storage-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.2/firebase-functions-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="./assets/wasla.app.js?v=${jsVer}" integrity="${jsSri}"></script>
</body>
</html>
`;

// التأكد إن السكربت الوحيد اللي من غير src هو بيانات JSON-LD (مش كود بيتنفذ)
const inlineScripts = html.match(/<script(?![^>]*\bsrc=)[^>]*>/gi) || [];
if (inlineScripts.some(t => !/type="application\/ld\+json"/i.test(t))) {
  throw new Error('Security check failed: executable inline script found in index.html');
}

fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robotsTxt(), 'utf8');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml(), 'utf8');

console.log('Build succeeded!');
console.log('  CSS SRI:', cssSri);
console.log('  JS  SRI:', jsSri);
