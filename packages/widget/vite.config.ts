import { defineConfig } from 'vite';
import { resolve } from 'path';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TrestaWidget',
      formats: ['iife'],
      fileName: () => 'tresta-widget.iife.js',
    },
    rollupOptions: {
      output: {
        // Use named exports to avoid default export warning
        exports: 'named',
        // Ensure single bundle output
        inlineDynamicImports: false,
        manualChunks: (id) => {
          // Keep layouts as separate chunks for code splitting
          if (id.includes('/layouts/')) {
            const layoutName = id.split('/layouts/')[1].split('.')[0];
            return `layout-${layoutName}`;
          }
          // DOMPurify as separate chunk for lazy loading
          if (id.includes('dompurify')) {
            return 'dompurify';
          }
          return 'index';
        },
      },
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production' ? ['debug'] : false,
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    target: 'es2020',
    cssCodeSplit: false,
  },
  plugins: [
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    // Bundle analyzer (only in analyze mode)
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}))
