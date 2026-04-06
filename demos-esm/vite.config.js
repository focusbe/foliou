import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: './src',
  resolve: {
    alias: {
      'foliou': path.resolve(__dirname, '../packages/foliou/dist/esm'),
      'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js')
    }
  },
  optimizeDeps: {
    include: ['jquery']
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});