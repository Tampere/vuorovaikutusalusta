import react from '@vitejs/plugin-react';
import 'dotenv/config';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const proxyAddress = process.env.API_URL ?? 'http://localhost:3000';

const isAdminRoute = (url: string) => url!.startsWith('/admin');
const isIndexRoute = (url: string) =>
  !url.startsWith('/api') &&
  !url.startsWith('/login') &&
  !url.startsWith('/.auth') &&
  !url.startsWith('/logout') &&
  !url.startsWith('/@') &&
  !url.includes('.');

export default defineConfig({
  appType: 'mpa',
  plugins: [
    {
      name: 'rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (isAdminRoute(req.url!)) {
            req.url = '/admin/';
          } else if (isIndexRoute(req.url!)) {
            req.url = '/';
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (isAdminRoute(req.url!)) {
            req.url = '/admin/';
          } else if (isIndexRoute(req.url!)) {
            req.url = '/';
          }
          next();
        });
      },
    },
    react(),
    tsconfigPaths(),
  ],
  define: { 'process.env': {} },
  optimizeDeps: { esbuildOptions: { define: { global: 'globalThis' } } },
  server: {
    watch: { usePolling: process.env.VITE_USE_POLLING === 'true' },
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': proxyAddress,
      '/login': proxyAddress,
      '/.auth': proxyAddress,
      '/logout': proxyAddress,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: '[name]/entry-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
