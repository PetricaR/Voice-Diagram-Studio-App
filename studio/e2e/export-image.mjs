/**
 * End-to-end test of Export → PNG image, SVG image and Copy as image: the
 * pictures are cropped to the diagram, carry the arrowheads, and leave out the
 * selection. Runs offline (a blueprint is drawn without Gemini).
 *   npm run dev   (in another terminal)
 *   node e2e/export-image.mjs [outDir]
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'e2e/screens';
const url = process.env.STUDIO_URL ?? 'http://127.0.0.1:5173/';
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failures.push(what);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, acceptDownloads: true });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// No key: a blueprint draws its prepared diagram without Gemini
await page.route('**/api/live/status', (route) => route.fulfill({ json: { configured: false, auth: { required: false } } }));

await page.goto(url);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForSelector('.suggestion-chip');
await page.click('.suggestion-chip >> nth=0');
await page.waitForSelector('.react-flow__node-shape');
await page.waitForTimeout(800);
// A selected node must not show up selected in the picture
await page.click('.react-flow__node-shape >> nth=1');
check(await page.locator('.react-flow__node-shape.selected').count() === 1, 'a node is selected on the canvas');

async function exportAs(label) {
  await page.click('button:has-text("Export")');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click(`.menu button:has-text("${label}")`)]);
  const path = `${out}/${download.suggestedFilename()}`;
  await download.saveAs(path);
  return { path, name: download.suggestedFilename(), bytes: readFileSync(path) };
}

const png = await exportAs('PNG image');
const w = png.bytes.readUInt32BE(16);
const h = png.bytes.readUInt32BE(20);
check(png.bytes.subarray(1, 4).toString() === 'PNG' && /\.png$/.test(png.name), `PNG downloaded (${png.name}, ${png.bytes.length} bytes)`);
check(w > 800 && h > 300 && w < 8200 && h < 8200, `PNG is the diagram at 2× (${w}×${h})`);
check(await page.locator('.react-flow__node-shape.selected').count() === 1, 'the selection is back after the export');

const svg = await exportAs('SVG image');
const text = svg.bytes.toString('utf8');
check(text.startsWith('<svg') && /\.svg$/.test(svg.name), `SVG downloaded (${svg.name}, ${svg.bytes.length} bytes)`);
check(/id="arrow-default"/.test(text), 'the SVG carries the arrowheads');
check(!/class="(?:[^"]*\s)?selected[\s"]/.test(text), 'nothing is selected in the SVG');
check(svg.bytes.length < 600_000, `the SVG embeds only the fonts it needs (${Math.round(svg.bytes.length / 1024)} KB)`);
check(!/react-flow__handle/.test(text), 'no connection handles in the SVG');
check(!/react-flow__background/.test(text), 'no dot grid in the SVG');

await page.click('button:has-text("Export")');
await page.click('.menu button:has-text("Copy as image")');
await page.waitForSelector('.snackbar:has-text("Copied")', { timeout: 10_000 }).catch(() => undefined);
const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((i) => i.types));
check(types.includes('image/png'), `the clipboard holds a PNG (${types.join(', ')})`);

await browser.close();
check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join('; ') : ''}`);
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
