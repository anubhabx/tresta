import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TrestaWidget',
      formats: ['iife', 'es'],
      fileName: (format) => {
        if (format === 'iife') return 'tresta-widget.js';
        if (format === 'es') return 'tresta-widget.esm.js';
        return `tresta-widget.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        // Extend window object to add TrestaWidget
        extend: true,
        // Keep it clean for CDN usage
        assetFileNames: 'tresta-widget.[ext]',
      },
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Clear output dir before build
    emptyOutDir: true,
  },
  // For development preview
  server: {
    port: 3001,
    open: '/demo.html',
  },
});
