import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
try {
  const page = await browser.newPage();
  const hanunoo = readFileSync('public/assets/fonts/NotoSansHanunoo-Regular.ttf').toString('base64');
  const fredoka = readFileSync('public/assets/fredoka_variable.ttf').toString('base64');
  await page.setContent(`<style>@font-face{font-family:Hanunoo;src:url(data:font/ttf;base64,${hanunoo})}@font-face{font-family:Fredoka;src:url(data:font/ttf;base64,${fredoka})}</style>`);
  const source=readFileSync('src/traceStory.ts','utf8').replace(/^import .*;\r?\n/gm,'').replace(/\bexport /g,'');
  const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  await page.addScriptTag({content:js});
  const data = await page.evaluate(async () => {
    return traceStoryPng({
      id: 'sample', target: 'ᜣ', kind: 'character', canvasHeight: 600,
      savedAt: '2026-11-08T10:00:00.000Z',
      strokes: [
        [{x:180,y:170},{x:230,y:160},{x:280,y:175},{x:310,y:220},{x:305,y:300},{x:290,y:370}],
        [{x:310,y:220},{x:380,y:205},{x:425,y:235},{x:440,y:280},{x:420,y:340}],
        [{x:150,y:380},{x:220,y:365},{x:290,y:370},{x:355,y:390},{x:430,y:385}],
      ],
    });
  });
  writeFileSync('docs/sample-traced-story.png', Buffer.from(data.split(',')[1], 'base64'));
} finally {
  await browser.close();
}
