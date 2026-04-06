import { createRequire } from 'module';
import path from 'path';
import fs from 'fs-extra';

const require = createRequire(import.meta.url);
const rollup = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const imagePlugin = require('@rollup/plugin-image');
const posthtmlPlugin = require('rollup-plugin-posthtml-template');

const production = process.env.NODE_ENV === 'production';

const components = ['device', 'prefix', 'utli', 'trace', 'touch', 'animate', 'popup', 'bgm', 'visualizer', 'swiper', 'player'];

async function buildComponent(name) {
  const srcDir = path.join(process.cwd(), name);
  const outDir = path.join(process.cwd(), 'dist', 'esm', name);
  const indexPath = path.join(srcDir, 'index.js');

  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${name} - no index.js`);
    return;
  }

  await fs.ensureDir(outDir);

  const plugins = [
    imagePlugin(),
    resolve.default({
      browser: true,
      preferBuiltins: false
    }),
    commonjs.default({
      transformMixedEsModules: true
    }),
    babel.default({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', { targets: { browsers: ['IE >= 10', '> 1%'] } }]
      ],
      extensions: ['.js']
    })
  ];

  // Add posthtml plugin for components that need it
  if (name === 'player') {
    plugins.unshift(posthtmlPlugin({
      include: ['**/*.html'],
      htmlmin: false
    }));
  }

  try {
    const bundle = await rollup.rollup({
      input: indexPath,
      plugins,
      external: (id) => {
        if (id === 'jquery' || id === '$') return true;
        if (!id.startsWith('.') && !id.startsWith('/')) return true;
        return false;
      }
    });

    await bundle.write({
      dir: outDir,
      format: 'esm',
      exports: 'named',
      sourcemap: !production
    });

    console.log(`Built: ${name}`);
  } catch (err) {
    console.error(`Error building ${name}:`, err.message);
  }
}

async function main() {
  for (const comp of components) {
    await buildComponent(comp);
  }
  console.log('\nAll ESM builds complete!');
}

main();