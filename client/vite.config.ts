import react from '@vitejs/plugin-react';
import 'dotenv/config';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const proxyAddress = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  appType: 'mpa',
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'rewrite-middleware',
      configureServer(config) {
        // Rewrite all /admin paths to use the admin client application
        config.middlewares.use((req, _res, next) => {
          if (req.url.startsWith('/admin')) {
            req.url = '/admin/';
          }
          next();
        });
      },
    },
  ],
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
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
