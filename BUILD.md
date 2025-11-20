# Vite Build System for Math Demos

This document explains how to use the Vite bundling system to create standalone archival versions of individual math demos.

## Overview

The Vite build system allows you to bundle any demo into a standalone, minified version that includes:
- All Three.js code (from vendored `/3party/three/`)
- All custom code from `/code/`
- All demo-specific code from the demo's `src/` directory
- The math.js parser library
- A standalone HTML file

The bundled version is completely self-contained and can be archived, deployed, or shared independently.

## What Gets Bundled

### Included in Bundle
- **Three.js**: Full Three.js library from `/3party/three/build/three.module.js`
- **Three.js Examples**: OrbitControls, ParametricGeometry, etc. from `/3party/three/examples/jsm/`
- **Custom Shader Material**: From `/3party/three-csm.m.js`
- **World Framework**: All code from `/code/World/`
- **Demo Code**: All code from the specific demo's `main.js` and `src/` directory
- **Utility Code**: Any imported code from `/code/items/`, `/code/compute/`, `/code/shaders/`, etc.

### Copied Separately
- **math.js**: The math parser library (1.8MB) is copied as a separate file since some demos reference it globally

### Output Files
Each build creates a `dist/` folder in the demo directory containing:
```
worlds/{category}/{demo}/dist/
├── index.html        # Standalone HTML file
├── main-bundle.js    # Minified bundle (~500KB typical)
└── math.js          # Math parser library (1.8MB)
```

## Installation

The Vite build system is already configured. Dependencies are installed with:

```bash
npm install
```

## Building Demos

### Build a Single Demo

To build any demo, use the `build:demo` script with the demo path:

```bash
npm run build:demo -- worlds/category/demo-name
```

**Examples:**

```bash
# Build a calculus demo
npm run build:demo -- worlds/calculus/riemannSumPlotter

# Build a raytrace demo
npm run build:demo -- worlds/raytrace/single-pixel

# Build a topology demo
npm run build:demo -- worlds/topology/knots

# Build a complex analysis demo
npm run build:demo -- worlds/complex/spirals
```

### Build Output

When you run a build, you'll see:

```
Building demo: worlds/calculus/riemannSumPlotter
Output will be in: worlds/calculus/riemannSumPlotter/dist/

vite v7.2.4 building client environment for production...
✓ 25 modules transformed.
✓ Bundle created: worlds/calculus/riemannSumPlotter/dist/main-bundle.js
✓ Copied math.js for standalone version
✓ Created standalone HTML: worlds/calculus/riemannSumPlotter/dist/index.html

🎉 Standalone archival version ready!
   All files needed: worlds/calculus/riemannSumPlotter/dist/
   - index.html
   - main-bundle.js
   - math.js
```

## Using the Bundled Version

### Option 1: Local File System

Simply open the `index.html` file in the `dist/` folder:

```bash
# Open in default browser (macOS)
open worlds/calculus/riemannSumPlotter/dist/index.html

# Open in default browser (Linux)
xdg-open worlds/calculus/riemannSumPlotter/dist/index.html

# Open in Chrome
google-chrome worlds/calculus/riemannSumPlotter/dist/index.html
```

### Option 2: Web Server

Serve the `dist/` folder with any web server:

```bash
# Using Python 3
cd worlds/calculus/riemannSumPlotter/dist
python3 -m http.server 8000

# Using Node.js http-server (install globally: npm install -g http-server)
cd worlds/calculus/riemannSumPlotter/dist
http-server -p 8000

# Using PHP
cd worlds/calculus/riemannSumPlotter/dist
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to Web Hosting

Simply upload the three files from `dist/` to any web hosting:
- `index.html`
- `main-bundle.js`
- `math.js`

The demo will work without any server-side processing.

## Archiving

To archive a demo for long-term storage or distribution:

1. Build the demo:
   ```bash
   npm run build:demo -- worlds/category/demo-name
   ```

2. The `dist/` folder contains everything needed. You can:
   - Zip the `dist/` folder: `zip -r demo-archive.zip worlds/category/demo-name/dist/`
   - Copy to external storage
   - Commit to a separate archival repository
   - Upload to cloud storage

## Configuration

### Vite Configuration

The main configuration is in `vite.config.js`. Key settings:

- **Output format**: IIFE (Immediately Invoked Function Expression) for standalone bundles
- **Minification**: Terser with console preservation
- **Bundle size**: Single file output (no code splitting)
- **Target**: Modern browsers (`esnext`)

### Build Script

The build script (`build-demo.js`) handles:
- Validating demo paths
- Running Vite with the correct environment variables
- Copying math.js to the output
- Generating the standalone HTML file

## Customization

### Change Output Filename

Edit `vite.config.js` line 28 to change the output filename:

```javascript
entryFileNames: 'main-bundle.js',  // Change this
```

### Enable Source Maps

Edit `vite.config.js` line 57:

```javascript
sourcemap: false,  // Change to true or 'inline'
```

### Adjust Minification

Edit `vite.config.js` lines 49-54 to adjust Terser options:

```javascript
terserOptions: {
  compress: {
    drop_console: false,  // Set to true to remove console.log
    drop_debugger: true,
  },
},
```

## Batch Building

To build multiple demos, create a simple script:

```bash
#!/bin/bash
# build-all-calculus.sh

demos=(
  "worlds/calculus/riemannSumPlotter"
  "worlds/calculus/diskRiemannSumPlotter"
  "worlds/calculus/ftcPlotter"
  "worlds/calculus/newtonMethodPlotter"
)

for demo in "${demos[@]}"; do
  echo "Building $demo..."
  npm run build:demo -- "$demo"
  echo ""
done
```

Then run:
```bash
chmod +x build-all-calculus.sh
./build-all-calculus.sh
```

## Troubleshooting

### Build Fails with "terser not found"

Install terser:
```bash
npm install --save-dev terser
```

### Build Fails with "Demo directory not found"

Check that the path is correct:
```bash
ls worlds/category/demo-name/main.js
```

### Demo Name Has Hyphens

This is handled automatically. Demo names like `single-pixel` are converted to `single_pixel` for the JavaScript variable name.

### Large Bundle Warning

The warning about bundles larger than 500KB is expected and can be ignored. We want everything in a single file for archival purposes.

## Technical Details

### Import Path Resolution

The build system preserves all existing import paths. No changes to your code are needed:

```javascript
// These work as-is:
import { Vector3 } from "../../../3party/three/build/three.module.js";
import World from "../../../code/World/World.js";
```

Vite resolves these paths during bundling and includes all dependencies in the output.

### Math.js Global

The math.js library is loaded globally (not as a module) because demos reference it directly:

```javascript
const parser = math.parser();  // Expects global 'math' object
```

This is why math.js is copied separately rather than bundled.

### Three.js Version

The bundled version uses your vendored Three.js from `/3party/three/`, not from npm. This ensures compatibility with your existing code and custom shader materials.

## Development Workflow

### Recommended Workflow

1. **Develop**: Work on demos normally using the original `index.html` and `main.js`
2. **Test**: Test your changes in the browser
3. **Build**: When ready to archive, run `npm run build:demo`
4. **Verify**: Open the bundled version in `dist/index.html` to verify
5. **Archive**: Save or deploy the `dist/` folder

### No Changes to Original Code

The build system doesn't modify your original code. The original `main.js` and source files remain unchanged. The bundle is created in a separate `dist/` folder.

## Future Enhancements

Possible improvements for the future:

1. **Batch building**: Build all demos in a category or entire project
2. **Asset optimization**: Compress textures and cubemaps
3. **Progressive loading**: Split large dependencies for faster initial load
4. **CDN support**: Option to load common libraries from CDN
5. **Build profiles**: Different builds for development/production/archival
6. **Watch mode**: Auto-rebuild on file changes during development

## Support

For issues or questions about the build system:
1. Check this documentation
2. Verify your demo works with the original `index.html` first
3. Check the Vite documentation: https://vitejs.dev
4. Review the configuration in `vite.config.js` and `build-demo.js`
