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
        // Inline all imports for IIFE format (single bundle)
        inlineDynamicImports: true,
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
