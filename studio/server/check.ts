/**
 * Checks the key → token → Live session path against the real Gemini API,
 * the way the page uses it, from a terminal:
 *   ./studio.sh check [--model <id>]
 *
 *   1. the server finds the API key (environment, Keychain or .env.local),
 *   2. Google issues a single-use token locked to the studio's setup,
 *   3. a Live session starts with the token alone (no key), and
 *   4. the same token cannot start a second session.
 */
import { fileURLToPath } from 'node:url';
import { agentSetup } from '../src/agent/liveConfig';
import { SYSTEM_INSTRUCTION } from '../src/agent/prompt';
import { TOOL_DECLARATIONS } from '../src/agent/tools';
import { LiveClient } from '../src/voice/liveClient';
import { readApiKey } from './apiKey';
import { createLiveToken, TokenError } from './liveToken';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const model = arg('model') ?? 'gemini-3.8-live';
const voice = 'Zephyr';
const thinkingLevel = 'LOW';

/** 'ready' when the session started, otherwise why it did not. */
function startSession(token: string): Promise<string> {
  return new Promise((resolve) => {
    const client: LiveClient = new LiveClient({
      getToken: async () => token,
      model, voice, thinkingLevel, silenceDurationMs: 600,
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: TOOL_DECLARATIONS,
    }, {
      onReady: () => {
        clearTimeout(timer);
        client.close();
        resolve('ready');
      },
      onError: (e) => {
        clearTimeout(timer);
        resolve(e.message);
      },
    });
    const timer = setTimeout(() => {
      client.close();
      resolve('no answer within 20 s');
    }, 20_000);
    client.connect();
  });
}

async function main(): Promise<boolean> {
  const apiKey = readApiKey(fileURLToPath(new URL('..', import.meta.url)));
  if (!apiKey) {
    console.log('✗ No Gemini API key: run ./studio.sh key (or set GEMINI_API_KEY).');
    return false;
  }
  console.log('✓ The server has a Gemini API key');

  let token: string;
  try {
    ({ token } = await createLiveToken(apiKey, agentSetup({ model, voice, thinkingLevel })));
  } catch (e) {
    console.log(`✗ No token: ${e instanceof TokenError ? e.message : String(e)}`);
    return false;
  }
  console.log(`✓ Google issued a single-use token locked to ${model}`);

  const first = await startSession(token);
  if (first !== 'ready') {
    console.log(`✗ The token did not start a Live session: ${first}`);
    return false;
  }
  console.log('✓ A Live session started with the token alone (the browser path)');

  const second = await startSession(token);
  if (second === 'ready') {
    console.log('✗ The same token started a second session (expected it to be single-use)');
    return false;
  }
  console.log(`✓ The used token was refused for a second session (${second})`);
  return true;
}

main().then((ok) => process.exit(ok ? 0 : 1), (e: unknown) => {
  console.error(e);
  process.exit(1);
});
