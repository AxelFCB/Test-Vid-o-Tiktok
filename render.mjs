import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entryPoint = path.join(__dirname, 'src', 'index.js');
const outPath = path.join(__dirname, 'mitosis.mp4');

console.log('Bundling...');
const bundled = await bundle({
  entryPoint,
  webpackOverride: (config) => config,
});

const chromiumPath = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

console.log('Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundled,
  id: 'Mitosis',
  browserExecutable: chromiumPath,
});

console.log(`Rendering ${composition.durationInFrames} frames at ${composition.fps} fps...`);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: outPath,
  browserExecutable: chromiumPath,
  onProgress: ({ progress }) => {
    process.stdout.write(`\rProgress: ${Math.round(progress * 100)}%`);
  },
});

console.log('\nDone! → mitosis.mp4');
