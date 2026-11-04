// Fails the build if an entry point would load without its stylesheet.
// Regression guard: a `cond ? import(a) : import(b)` in main.tsx once made the bundle preload only the
// game's CSS for both, so the admin dashboard rendered unstyled on phones.
import { readdirSync, readFileSync } from 'node:fs';

const dir = 'dist/assets';
const files = readdirSync(dir);
const main = files.find(f => /^index-.*\.js$/.test(f));
if (!main) throw new Error('dist/assets/index-*.js not found; run the build first');
const code = readFileSync(`${dir}/${main}`, 'utf8');
const list = JSON.parse(code.match(/m\.f=(\[[^\]]*\])/)?.[1] ?? '[]');
const calls = [...code.matchAll(/__vite__mapDeps\(\[([\d,]*)\]\)/g)].map(m => m[1].split(',').filter(Boolean).map(Number).map(i => list[i]));
const problems = [];
for (const entry of ['admin-main', 'bootstrap']) {
  const css = files.find(f => f.startsWith(`${entry}-`) && f.endsWith('.css'));
  if (!css) { problems.push(`${entry}: no CSS file was emitted`); continue; }
  if (!calls.some(deps => deps.includes(`assets/${css}`))) problems.push(`${entry}: ${css} is never preloaded`);
}
if (problems.length) { console.error('Build check failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`Build check passed: admin and game entry points each preload their own stylesheet (${calls.length} preload groups).`);
