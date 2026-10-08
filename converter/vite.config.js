import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the built site works from any path (e.g. GitHub Pages).
  base: './',
  optimizeDeps: {
    // ffmpeg.wasm spawns its own worker; pre-bundling breaks the worker URL.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
});
