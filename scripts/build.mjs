import * as esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'iife',
  minify: true,
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
console.log('Built dist/index.html');
