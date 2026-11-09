/**
 * Where the studio server finds the Gemini API key, in this order:
 *   1. GEMINI_API_KEY in the environment (CI; Cloud Run with Secret Manager)
 *   2. the macOS Keychain, saved by `./studio.sh key`
 *      (service "voice-diagram-studio", account "GEMINI_API_KEY")
 *   3. GEMINI_API_KEY=... in studio/.env.local (git-ignored, permissions 600)
 * The key is only ever read here, on the server; it is never sent to the browser.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const KEYCHAIN_SERVICE = 'voice-diagram-studio';
export const KEYCHAIN_ACCOUNT = 'GEMINI_API_KEY';

function fromKeychain(): string {
  if (process.platform !== 'darwin') return '';
  try {
    return execFileSync('/usr/bin/security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-a', KEYCHAIN_ACCOUNT, '-w'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim();
  } catch {
    return ''; // no such item, or the Keychain is locked
  }
}

function fromEnvFile(root: string, warn: (message: string) => void): string {
  const file = join(root, '.env.local');
  if (!existsSync(file)) return '';
  const line = readFileSync(file, 'utf8').split('\n').find((l) => l.trim().startsWith('GEMINI_API_KEY='));
  const key = line ? line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '') : '';
  if (key && process.platform !== 'win32' && (statSync(file).mode & 0o077) !== 0) {
    warn(`${file} can be read by other users: run chmod 600 on it, or move the key to the Keychain with ./studio.sh key.`);
  }
  return key;
}

export function readApiKey(root: string, warn: (message: string) => void = console.warn): string {
  return process.env.GEMINI_API_KEY?.trim() || fromKeychain() || fromEnvFile(root, warn);
}
