// ブラウザを操作しながら録画し、マウス操作のログを残す（/capture の雛形）。
//   node capture/<name>.mjs
// 出力: public/capture/<name>.webm（録画）と public/capture/<name>.json（操作ログ）
// 録画にはカーソルが映らないので、Remotion の CaptureDemo がログからカーソルとズームを描く。
// 書き換えるのは URL・NAME と、下の「操作」の部分だけ。
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const URL = 'https://<worker>.<subdomain>.workers.dev/';
const NAME = '<name>';
const SIZE = { width: 1280, height: 720 };
const OUT = path.resolve('public/capture');

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu'] });
const context = await browser.newContext({
  viewport: SIZE,
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: SIZE },
});
const page = await context.newPage();
// 録画はページを作った時点から始まるので、ここを 0 秒として操作の時刻を記録する
const t0 = performance.now();
const now = () => Number(((performance.now() - t0) / 1000).toFixed(3));
const events = [];
let cursor = { x: SIZE.width * 0.75, y: SIZE.height * 0.78 };

const log = (type, extra = {}) => events.push({ t: now(), type, x: cursor.x, y: cursor.y, ...extra });
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

async function moveTo(x, y, ms) {
  const from = { ...cursor };
  const steps = Math.max(1, Math.round(ms / 16));
  for (let i = 1; i <= steps; i++) {
    const p = ease(i / steps);
    cursor = { x: Math.round(from.x + (x - from.x) * p), y: Math.round(from.y + (y - from.y) * p) };
    await page.mouse.move(cursor.x, cursor.y);
    log('move');
    await page.waitForTimeout(16);
  }
}

async function click() {
  await page.mouse.down();
  log('down');
  await page.waitForTimeout(80);
  await page.mouse.up();
  log('up');
}

async function drag(x, y, ms) {
  await page.mouse.down();
  log('down');
  await moveTo(x, y, ms);
  await page.mouse.up();
  log('up');
}

async function wheel(deltaY, ticks, ms) {
  for (let i = 0; i < ticks; i++) {
    await page.mouse.wheel(0, deltaY);
    log('wheel', { deltaY });
    await page.waitForTimeout(ms / ticks);
  }
}

await page.goto(URL, { waitUntil: 'networkidle' });
await page.mouse.move(cursor.x, cursor.y);
await page.waitForTimeout(1200);
const ready = now();
log('ready');

// ---- 操作（ここを書き換える） ----
await moveTo(SIZE.width / 2, SIZE.height / 2, 800);
await page.waitForTimeout(300);
await drag(SIZE.width * 0.7, SIZE.height * 0.45, 1300);
await page.waitForTimeout(400);
await wheel(-120, 8, 900);
await page.waitForTimeout(800);
// ---- ここまで ----
log('end');

await page.screenshot({ path: path.join(OUT, `${NAME}-last.png`) });
const video = page.video();
await context.close();
await browser.close();

const webm = path.join(OUT, `${NAME}.webm`);
fs.renameSync(await video.path(), webm);
fs.writeFileSync(
  path.join(OUT, `${NAME}.json`),
  JSON.stringify({ ...SIZE, ready, end: events.at(-1).t, events }, null, 2),
);
console.log(`saved ${webm} (${events.length} events, ready at ${ready}s, end at ${events.at(-1).t}s)`);
