import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';

function resolveVersion(mode: string) {
  try {
    const envVersion = loadEnv(mode, process.cwd(), '')['VITE_APP_VERSION'];
    if (envVersion) return envVersion;
  } catch (_) {
    // ignore
  }
  try {
    return execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return 'dev';
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(resolveVersion(mode)),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
}));
