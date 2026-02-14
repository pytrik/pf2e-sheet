import * as esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const debug = process.argv.includes('--debug');

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'iife',
  // Granular minification — minifyWhitespace is disabled because it converts
  // string literals like "\n   text" into template literals with real newline
  // characters (`↵   text`). While valid JS, this breaks inline <script> parsing
  // in Firefox when the bundle is inlined into the single-file HTML output.
  minifyWhitespace: false,
  minifyIdentifiers: !debug,
  minifySyntax: !debug,
  plugins: [
    sveltePlugin({
      preprocess: sveltePreprocess(),
      compilerOptions: { css: 'injected' },
    }),
  ],
  loader: { '.css': 'css' },
  logLevel: 'info',
});

const template = readFileSync('src/template.html', 'utf-8');
const bundle = readFileSync('dist/bundle.js', 'utf-8');

// Inline CSS if it was extracted
let css = '';
if (existsSync('dist/bundle.css')) {
  css = readFileSync('dist/bundle.css', 'utf-8');
}

let html = template.replace('<!-- SCRIPT -->', bundle);
html = html.replace('<!-- STYLE -->', css);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log(`Built dist/index.html (${debug ? 'debug' : 'minified'})`);
