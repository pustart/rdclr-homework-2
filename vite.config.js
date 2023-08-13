import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    outDir: './',
    rollupOptions: {
      input: './scripts/main.js',
      output: {
        entryFileNames: 'scripts/bundle.js',
      },
    },
  },
});
