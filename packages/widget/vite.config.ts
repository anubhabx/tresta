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
      treeshake: true, // Enable tree-shaking for smaller bundle
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      mangle: {
        properties: false, // Don't mangle property names for API stability
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Clear output dir before build
    emptyOutDir: true,
    // Target modern browsers for smaller output
    target: 'es2015',
  },
  // For development preview
  server: {
    port: 3001,
    open: '/index.html',
  },
});
