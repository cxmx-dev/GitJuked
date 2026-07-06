import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const scratch = process.env.GITJUKED_SCRATCH || root;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wav': 'audio/wav' };

function serve(port) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = join(root, (req.url === '/' ? '/index.html' : req.url).split('?')[0]);
      if (!path.startsWith(root) || !existsSync(path)) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
      res.end(readFileSync(path));
    });
    server.listen(port, () => resolve(server));
  });
}

async function runOnce(runLabel) {
  const errors = [];
  const server = await serve(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  let playwright;
  try {
    playwright = await import('playwright');
  } catch (e) {
    server.close();
    throw new Error('playwright not available: ' + e.message);
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });

  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => document.getElementById('playlist').options.length > 0, null, { timeout: 10000 });
  await page.waitForTimeout(800);

  const hudColor = await page.evaluate(() => getComputedStyle(document.getElementById('hud')).color);
  const vizSize = await page.evaluate(() => ({ w: document.getElementById('viz').width, h: document.getElementById('viz').height }));
  const optionCount = await page.evaluate(() => document.getElementById('playlist').options.length);
  const trackInfo = await page.evaluate(() => document.getElementById('trackInfo').textContent);

  function countPainted() {
    return page.evaluate(() => {
      const c = document.getElementById('viz');
      const ctx = c.getContext('2d');
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let nonBlack = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 1] > 4) nonBlack++;
      }
      return nonBlack;
    });
  }

  let painted = await countPainted();

  const pausedBefore = await page.evaluate(() => document.getElementById('audio').paused);
  const srcBefore = await page.evaluate(() => document.getElementById('audio').src);
  await page.click('#play');
  await page.waitForTimeout(2000);
  painted = Math.max(painted, await countPainted());
  const playLabel = await page.evaluate(() => document.getElementById('play').textContent);
  const pausedAfter = await page.evaluate(() => document.getElementById('audio').paused);
  const audioState = await page.evaluate(() => ({
    src: document.getElementById('audio').src,
    readyState: document.getElementById('audio').readyState
  }));

  await page.screenshot({ path: join(scratch, runLabel === 1 ? 'page.png' : 'page-run2.png'), fullPage: true });

  await browser.close();
  server.close();

  const checks = [];
  if (errors.length) checks.push('errors: ' + errors.join('; '));
  if (hudColor !== 'rgb(0, 255, 170)') checks.push('hud color got ' + hudColor);
  if (vizSize.w !== 1280 || vizSize.h !== 720) checks.push('viz size ' + JSON.stringify(vizSize));
  if (painted < 100) checks.push('viz under-painted pixels=' + painted);
  if (optionCount < 1) checks.push('playlist empty');
  if (!trackInfo.includes('GitJuked') && !trackInfo.includes('gitjuke')) checks.push('trackInfo=' + trackInfo);
  if (pausedBefore !== true) checks.push('expected paused before play');
  if (!srcBefore.includes('01_-_gitjuke') && !srcBefore.includes('audio')) checks.push('audio src not set: ' + srcBefore);
  if (playLabel !== '⏸' && pausedAfter === true) checks.push('play click failed label=' + playLabel);
  if (!audioState.src) checks.push('audio has no src after play');

  if (checks.length) throw new Error(checks.join(' | '));
  return { port, hudColor, vizSize, painted, optionCount, trackInfo, pausedBefore, pausedAfter };
}

const log = [];
try {
  const r1 = await runOnce(1);
  log.push('run1 ok: ' + JSON.stringify(r1));
  const r2 = await runOnce(2);
  log.push('run2 ok: ' + JSON.stringify(r2));
  console.log(log.join('\n'));
  process.exit(0);
} catch (e) {
  console.error('LAUNCH CHECK FAILED:', e.message);
  process.exit(1);
}