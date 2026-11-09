/**
 * Serves the token API (server/liveToken.ts) from the Vite dev and preview
 * servers, so `./studio.sh` and `vite preview` need no separate backend. The
 * agent's setup is loaded through Vite rather than imported here, so editing
 * the prompt or the tools neither restarts the server nor leaves tokens locked
 * to an old prompt.
 */
import { join } from 'node:path';
import { runnerImport, type Logger, type Plugin } from 'vite';
import { accessFromEnv, type Access } from './access.ts';
import { readApiKey } from './apiKey.ts';
import { liveTokenMiddleware, type AgentConfig } from './liveToken.ts';

const CONFIG_MODULE = 'src/agent/liveConfig.ts';

const list = (value: string | undefined) => value?.split(',').map((s) => s.trim()).filter(Boolean);

async function middleware(root: string, logger: Logger, loadConfig: () => Promise<AgentConfig>) {
  const warn = (message: string) => logger.warn(message, { timestamp: true });
  // Off unless STUDIO_AUTH=google: locally the key's owner is the only user
  const access: Access = await accessFromEnv(process.env, { onCloudRun: false, log: warn });
  let key = '';
  return liveTokenMiddleware({
    ...access,
    // Read again until there is one, so `./studio.sh key` works without a restart
    getApiKey: () => key || (key = readApiKey(root, warn)),
    onKeyRejected: () => {
      key = '';
    },
    loadConfig,
    models: list(process.env.STUDIO_LIVE_MODELS),
    allowedHosts: list(process.env.STUDIO_ALLOWED_HOSTS),
    log: warn,
  });
}

export function liveTokenPlugin(): Plugin {
  return {
    name: 'studio:live-token',
    configureServer(server) {
      const { root, logger } = server.config;
      return middleware(root, logger, () => server.ssrLoadModule(`/${CONFIG_MODULE}`) as Promise<AgentConfig>)
        .then((m) => { server.middlewares.use(m); });
    },
    configurePreviewServer(server) {
      const { root, logger } = server.config;
      let config: Promise<AgentConfig> | undefined;
      const load = () => config ??= runnerImport<AgentConfig>(join(root, CONFIG_MODULE), { root, configFile: false, logLevel: 'error' })
        .then((r) => r.module)
        .catch((e: unknown) => {
          config = undefined;
          throw e;
        });
      return middleware(root, logger, load).then((m) => { server.middlewares.use(m); });
    },
  };
}
