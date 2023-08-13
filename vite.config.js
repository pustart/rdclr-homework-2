import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './scripts/index.js', // Ваша точка входа
      output: {
        entryFileNames: 'scripts/bundle.js',
      },
    },
  },
});
