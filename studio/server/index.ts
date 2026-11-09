/**
 * Production HTTP server (e.g. Google Cloud Run): serves the built app in
 * `dist/` with a Content-Security-Policy and mounts `liveTokenMiddleware` at
 * `/api/live/*` so the Gemini API key stays on the server.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as liveConfig from '../src/agent/liveConfig.ts';
import { accessFromEnv } from './access.ts';
import { readApiKey } from './apiKey.ts';
import { liveTokenMiddleware, type LiveTokenOptions } from './liveToken.ts';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

/** Google Identity Services ("Sign in with Google") needs its script, styles, frames and endpoints. */
const GSI = 'https://accounts.google.com/gsi/';

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' blob: ${GSI}client`,
  "worker-src 'self' blob:",
  `style-src 'self' 'unsafe-inline' ${GSI}style`,
  // Google account pictures
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  `connect-src 'self' wss://generativelanguage.googleapis.com https://generativelanguage.googleapis.com ${GSI} ws://127.0.0.1:* ws://localhost:*`,
  `frame-src ${GSI}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const list = (value: string | undefined) => value?.split(',').map((s) => s.trim()).filter(Boolean);

export interface StudioServerOptions extends Partial<LiveTokenOptions> {
  root?: string;
  distDir?: string;
}

export function createStudioServer(opts: StudioServerOptions = {}): Server {
  const root = opts.root ?? ROOT;
  const distDir = resolve(opts.distDir ?? join(root, 'dist'));
  const onCloudRun = Boolean(process.env.K_SERVICE);
  const envHosts = list(process.env.STUDIO_ALLOWED_HOSTS);
  let key = '';

  const tokenHandler = liveTokenMiddleware({
    getApiKey: opts.getApiKey ?? (() => key || (key = readApiKey(root))),
    onKeyRejected: opts.onKeyRejected ?? (() => { key = ''; }),
    loadConfig: opts.loadConfig ?? (async () => liveConfig),
    models: opts.models ?? list(process.env.STUDIO_LIVE_MODELS),
    allowedHosts: opts.allowedHosts ?? (envHosts?.length ? envHosts : onCloudRun ? ['.run.app'] : undefined),
    trustProxy: opts.trustProxy ?? trustProxyFromEnv(onCloudRun),
    rateLimit: opts.rateLimit,
    // Fail closed: a deployment without sign-in configured issues no tokens
    requireSignIn: opts.requireSignIn ?? onCloudRun,
    auth: opts.auth,
    usage: opts.usage,
    fetch: opts.fetch,
    log: opts.log,
    now: opts.now,
  });

  return createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const rawPath = (req.url ?? '/').split('?')[0];
    if (rawPath === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    tokenHandler(req, res, () => {
      serveStatic(req, res, distDir, rawPath);
    });
  });
}

/** Cloud Run's front end appends one X-Forwarded-For entry; TRUST_PROXY=n for n proxies (e.g. a load balancer in front: 2). */
function trustProxyFromEnv(onCloudRun: boolean): number {
  const v = process.env.TRUST_PROXY?.trim();
  if (v === 'true') return 1;
  if (v != null && v !== '' && Number.isInteger(Number(v))) return Number(v);
  return onCloudRun ? 1 : 0;
}

function serveStatic(req: IncomingMessage, res: ServerResponse, distDir: string, rawPath: string) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }
  const relPath = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = resolve(distDir, relPath);
  if (candidate !== distDir && !candidate.startsWith(distDir + sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let filePath = candidate;
  if (!isRegularFile(filePath)) {
    // SPA fallback for client routes without a file extension
    if (!extname(relPath)) {
      filePath = join(distDir, 'index.html');
    }
    if (!isRegularFile(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  const cacheControl = filePath.endsWith(`${sep}index.html`)
    ? 'no-cache'
    : relPath.startsWith('assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600';

  const stat = statSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': cacheControl,
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end();
  });
  stream.pipe(res);
}

function isRegularFile(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isFile();
  } catch {
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST ?? '0.0.0.0';
  const access = await accessFromEnv(process.env, { onCloudRun: Boolean(process.env.K_SERVICE) });
  const server = createStudioServer(access);
  server.listen(port, host, () => {
    console.log(`Voice Diagram Studio listening on http://${host}:${port}`);
  });
}
