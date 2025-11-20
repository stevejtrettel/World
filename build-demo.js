#!/usr/bin/env node

/**
 * Build script for bundling individual math demos
 *
 * Usage:
 *   npm run build:demo -- worlds/calculus/riemannSum
 *   npm run build:demo -- worlds/raytrace/pathtracer
 *
 * Or directly:
 *   node build-demo.js worlds/calculus/riemannSum
 */

import { spawn } from 'child_process';
import { resolve, dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get demo path from command line arguments
const demoPath = process.argv[2];

if (!demoPath) {
  console.error('Error: Please provide a demo path');
  console.error('Usage: npm run build:demo -- worlds/category/demo-name');
  console.error('Example: npm run build:demo -- worlds/calculus/riemannSum');
  process.exit(1);
}

// Normalize the path (remove trailing slashes)
const normalizedPath = demoPath.replace(/\/$/, '');

// Check if the demo path exists
const demoDir = resolve(__dirname, normalizedPath);
const mainJs = resolve(demoDir, 'main.js');

if (!existsSync(demoDir)) {
  console.error(`Error: Demo directory not found: ${normalizedPath}`);
  process.exit(1);
}

if (!existsSync(mainJs)) {
  console.error(`Error: main.js not found in: ${normalizedPath}`);
  process.exit(1);
}

console.log(`Building demo: ${normalizedPath}`);
console.log(`Output will be in: ${normalizedPath}/dist/`);
console.log('');

// Run vite build with the demo path as environment variable
const viteBuild = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DEMO_PATH: normalizedPath,
  },
  shell: true,
});

viteBuild.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log(`✓ Bundle created: ${normalizedPath}/dist/main-bundle.js`);

    // Copy math.js to dist for standalone version
    const mathJsSource = resolve(__dirname, '3party/math.js');
    const mathJsDest = resolve(__dirname, normalizedPath, 'dist/math.js');

    try {
      copyFileSync(mathJsSource, mathJsDest);
      console.log(`✓ Copied math.js for standalone version`);

      // Create standalone HTML file
      const demoName = basename(normalizedPath);
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${demoName} - Standalone</title>
    <style> body { margin: 0; }</style>
</head>
<body>

<!-- Math Parser Engine -->
<script src="./math.js"></script>

<!-- Bundled Application (includes Three.js and all dependencies) -->
<script src="./main-bundle.js"></script>

</body>
</html>`;

      const htmlPath = resolve(__dirname, normalizedPath, 'dist/index.html');
      writeFileSync(htmlPath, htmlContent);
      console.log(`✓ Created standalone HTML: ${normalizedPath}/dist/index.html`);
      console.log('');
      console.log('🎉 Standalone archival version ready!');
      console.log(`   All files needed: ${normalizedPath}/dist/`);
      console.log('   - index.html');
      console.log('   - main-bundle.js');
      console.log('   - math.js');
    } catch (err) {
      console.error('Warning: Could not create standalone files:', err.message);
    }
  } else {
    console.error(`Build failed with code ${code}`);
    process.exit(code);
  }
});
