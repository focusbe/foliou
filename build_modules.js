const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');

const modules = ['animate', 'bgm', 'device', 'popup', 'prefix', 'touch', 'trace', 'utli', 'visualizer'];
const packagesDir = path.join(__dirname, 'packages/foliou');
const outputDir = path.join(__dirname, 'packages/foliou/_dist');

async function buildModule(name) {
  const inputPath = path.join(packagesDir, name, 'index.js');
  const outputPath = path.join(outputDir, name, 'index.js');

  if (!fs.existsSync(inputPath)) {
    console.log(`Skipping ${name} - no index.js found`);
    return;
  }

  // Don't create directory if build fails
  const tmpOutputDir = path.dirname(outputPath);
  await fs.ensureDir(tmpOutputDir);

  try {
    const bundle = await rollup.rollup({
      input: inputPath,
      plugins: [],
      external: (id) => {
        // Only externalize node built-ins, not jquery or relative paths
        if (id === 'jquery' || id === '$') {
          return false;
        }
        // Externalize node built-ins
        if (id.startsWith('node:') || id === 'buffer' || id === 'process') {
          return true;
        }
        // Bundle everything else (including relative imports like ./lib/*)
        return false;
      },
    });

    await bundle.write({
      file: outputPath,
      format: 'iife',  // IIFE for browser, bundles everything
      name: name.charAt(0).toUpperCase() + name.slice(1),
      globals: {
        jquery: '$'
      }
    });
    console.log(`Built: ${name}`);
  } catch (err) {
    console.error(`Error building ${name}:`, err.message);
    // Clean up empty directory on failure
    try {
      const files = await fs.readdir(tmpOutputDir);
      if (files.length === 0) {
        await fs.rmdir(tmpOutputDir);
      }
    } catch (e) {}
  }
}

async function main() {
  // Clean _dist first
  await fs.remove(outputDir);
  await fs.ensureDir(outputDir);

  for (const module of modules) {
    await buildModule(module);
  }
  console.log('Done!');
}

main();