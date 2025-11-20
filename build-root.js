#!/usr/bin/env node

/**
 * Build script for bundling the demo referenced in root index.html
 *
 * This script reads the root index.html file, extracts the demo path
 * from the script src attribute, and builds that demo into dist/ at root.
 *
 * Usage:
 *   npm run build
 */

import { readFileSync, copyFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the root index.html file
const indexPath = resolve(__dirname, 'index.html');
let indexContent;

try {
  indexContent = readFileSync(indexPath, 'utf-8');
} catch (err) {
  console.error('Error: Could not read index.html');
  console.error(err.message);
  process.exit(1);
}

// Extract the demo path from the script src attribute
// Looking for pattern: src="./worlds/.../main.js"
const scriptMatch = indexContent.match(/src=["']\.\/([^"']+\/main\.js)["']/);

if (!scriptMatch) {
  console.error('Error: Could not find demo script in index.html');
  console.error('Expected pattern: src="./worlds/.../main.js"');
  process.exit(1);
}

const mainJsPath = scriptMatch[1]; // e.g., "worlds/pde/eigenfunctionsCylinder/main.js"
const demoPath = mainJsPath.replace(/\/main\.js$/, ''); // Remove /main.js to get demo directory

console.log('Building demo from root index.html');
console.log(`Demo: ${demoPath}`);
console.log('Output will be in: dist/');
console.log('');

// Run vite build with DEMO_PATH pointing to the extracted demo
// and ROOT_BUILD=true to output to root dist/
const viteBuild = spawn('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DEMO_PATH: demoPath,
    ROOT_BUILD: 'true',
  },
  shell: true,
});

viteBuild.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('✓ Bundle created: dist/main-bundle.js');

    // Copy math.js to dist for standalone version
    const mathJsSource = resolve(__dirname, '3party/math.js');
    const mathJsDest = resolve(__dirname, 'dist/math.js');

    try {
      copyFileSync(mathJsSource, mathJsDest);
      console.log('✓ Copied math.js for standalone version');

      // Create standalone HTML file
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ThreeJS World - Standalone</title>
    <style> body { margin: 0; }</style>
</head>
<body>

<!-- Math Parser Engine -->
<script src="./math.js"></script>

<!-- Bundled Application (includes Three.js and all dependencies) -->
<script src="./main-bundle.js"></script>

</body>
</html>`;

      const htmlPath = resolve(__dirname, 'dist/index.html');
      writeFileSync(htmlPath, htmlContent);
      console.log('✓ Created standalone HTML: dist/index.html');
      console.log('');
      console.log('🎉 Root build complete!');
      console.log(`   Demo: ${demoPath}`);
      console.log('   Open dist/index.html to view the bundled demo');
    } catch (err) {
      console.error('Warning: Could not create standalone files:', err.message);
    }
  } else {
    console.error(`Build failed with code ${code}`);
    process.exit(code);
  }
});
