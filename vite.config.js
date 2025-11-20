import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  // Get the demo path from environment variable
  const demoPath = process.env.DEMO_PATH || 'worlds/pde/eigenfunctionsCylinder';
  const demoName = demoPath.split('/').pop();

  // Convert demo name to valid JS identifier (replace hyphens with underscores)
  const validName = demoName.replace(/-/g, '_');

  return {
    // Root directory for resolving paths
    root: process.cwd(),

    // Base public path
    base: './',

    build: {
      // Output directory
      outDir: `${demoPath}/dist`,

      // Empty the output directory before building
      emptyOutDir: true,

      // Rollup options for bundling
      rollupOptions: {
        input: resolve(process.cwd(), `${demoPath}/main.js`),
        output: {
          // Output everything as a single file
          entryFileNames: 'main-bundle.js',
          chunkFileNames: 'main-bundle.js',
          assetFileNames: 'assets/[name][extname]',

          // Inline all dynamic imports to create a single file
          inlineDynamicImports: true,

          // Use IIFE format for standalone bundle
          format: 'iife',

          // Global variable name (must be valid JS identifier)
          name: validName,
        },
      },

      // Target modern browsers that support ES modules
      target: 'esnext',

      // Minify the output
      minify: 'terser',

      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },

      // Source maps for debugging
      sourcemap: false,

      // Asset handling
      assetsInlineLimit: 0, // Don't inline assets as base64
    },

    // Resolve options
    resolve: {
      // Preserve symlinks
      preserveSymlinks: true,
    },

    // Server options for development
    server: {
      port: 3000,
      open: false,
    },

    // Optimizations
    optimizeDeps: {
      // Force optimization of vendored dependencies
      include: [],
      exclude: [],
    },
  };
});
