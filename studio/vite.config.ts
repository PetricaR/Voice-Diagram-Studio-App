import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { liveTokenPlugin } from './server/vitePlugin.ts';

// The Gemini API key never reaches the page: the dev and preview servers keep
// it and hand out single-use Live API tokens at /api/live/token
// (server/liveToken.ts). Only VITE_* variables are exposed to the page, so
// never name a secret VITE_*.
export default defineConfig({
  plugins: [react(), liveTokenPlugin()],
  server: {
    // Browsers allow the microphone on loopback addresses over plain http;
    // loopback also keeps the token API off the network
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    include: ['test/**/*.test.ts'],
    // Its ESM build uses extensionless imports that Node cannot resolve on its own
    server: { deps: { inline: ['@material/material-color-utilities'] } },
  },
});
