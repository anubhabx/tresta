import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "TrestaWidget",
        formats: ["iife", "es"],
        fileName: (format) => {
          if (format === "iife") return "tresta-widget.js";
          if (format === "es") return "tresta-widget.esm.js";
          return `tresta-widget.${format}.js`;
        },
      },
      rollupOptions: {
        output: {
          // Extend window object to add TrestaWidget
          extend: true,
          // Keep it clean for CDN usage
          assetFileNames: "tresta-widget.[ext]",
          // Manual chunks for better optimization
          manualChunks: undefined,
        },
        treeshake: {
          // Aggressive tree-shaking for production
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      // Optimize for production
      minify: isProduction ? "terser" : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true, // Remove console.log statements
              drop_debugger: true, // Remove debugger statements
              pure_funcs: [
                "console.log",
                "console.debug",
                "console.info",
                "console.warn",
              ],
              passes: 2, // Multiple passes for better compression
              unsafe: true, // Enable unsafe optimizations
              unsafe_math: true,
              unsafe_methods: true,
            },
            mangle: {
              properties: false, // Don't mangle property names for API stability
            },
            format: {
              comments: false, // Remove all comments
            },
          }
        : undefined,
      // Only generate sourcemaps in development
      sourcemap: !isProduction,
      // Clear output dir before build
      emptyOutDir: true,
      // Target modern browsers for smaller output
      target: "es2020",
      // Optimize chunk size
      chunkSizeWarningLimit: 50,
    },
    // For development preview
    server: {
      port: 3001,
      open: "/index.html",
    },
  };
});
