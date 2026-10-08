// Bundles the converter into one self-contained HTML file that runs from file://,
// with ffmpeg.wasm embedded as base64.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => readFile(path.join(root, file), 'utf8');
const coreDir = 'node_modules/@ffmpeg/core/dist/umd';

const [template, style, preview, main, worker, core, wasm] = await Promise.all([
  read('src/index.html'),
  read('src/style.css'),
  read('src/preview.js'),
  read('src/main.js'),
  read('src/worker.js'),
  read(`${coreDir}/ffmpeg-core.js`),
  readFile(path.join(root, coreDir, 'ffmpeg-core.wasm')),
]);

const workerSource = Buffer.from(`${core}\n${worker}`).toString('base64');

// Function replacements so `$` sequences in the sources are not treated as patterns.
const html = template
  .replace('/* @style */', () => style)
  .replace('/* @app */', () => `(() => {\n${preview}\n${main}\n})();`)
  .replace('@worker', () => workerSource)
  .replace('@wasm', () => wasm.toString('base64'));

const output = path.join(root, 'dist', 'alpha-video-converter.html');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`${path.relative(process.cwd(), output)} · ${(html.length / 1024 / 1024).toFixed(1)} MB`);
