import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    allowedHosts: ['server'],
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, '../client/src'),
      '@clientSrc': path.resolve(__dirname, '../client/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react(), tsconfigPaths()],
});
