/**
 * UI smoke test: drives the dev server in Chrome, builds a diagram through
 * the store (no API key needed), applies edits and takes screenshots.
 *   npm run dev   (in another terminal)
 *   node e2e/smoke.mjs [outDir]
 */
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'e2e/screens';
const url = process.env.STUDIO_URL ?? 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];

async function run(colorScheme) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme, deviceScaleFactor: 2 });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${colorScheme}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${colorScheme}] ${e.message}`));
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.voice-dock');
  await page.screenshot({ path: `${out}/${colorScheme}-1-empty.png` });

  await page.evaluate(async () => {
    const { store } = window.__studio;
    await store.create({
      diagram_type: 'architecture', direction: 'LR', title: 'Web App on GCP',
      groups: [{ id: 'gcp', label: 'Google Cloud', kind: 'region' }, { id: 'vpc', label: 'Production VPC', kind: 'vpc', parent: 'gcp' }],
      nodes: [
        { id: 'user', label: 'Customers', kind: 'user' },
        { id: 'lb', label: 'Load Balancer', kind: 'loadbalancer', tech: 'Cloud Load Balancing', provider: 'gcp', group: 'gcp' },
        { id: 'api', label: 'Orders API', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'vpc' },
        { id: 'db', label: 'Orders DB', kind: 'database', tech: 'Cloud SQL', provider: 'gcp', group: 'vpc' },
        { id: 'ai', label: 'Recommendations', kind: 'ai', tech: 'Gemini on Vertex AI', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'user', to: 'lb', label: 'HTTPS' }, { from: 'lb', to: 'api' },
        { from: 'api', to: 'db', label: 'SQL' }, { from: 'api', to: 'ai', label: 'gRPC' },
      ],
    }, { source: 'text', request: 'Draw a web app on Google Cloud' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${colorScheme}-2-created.png` });

  const before = await page.evaluate(() => window.__studio.store.scene.nodes.map((n) => [n.id, n.x, n.y]));
  await page.evaluate(() => {
    const { store } = window.__studio;
    const r = store.edit({
      summary: 'Added a Redis cache',
      add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache', tech: 'Memorystore for Redis', provider: 'gcp', group: 'vpc' }],
      remove_edges: [{ from: 'api', to: 'db' }],
      add_edges: [{ from: 'api', to: 'cache' }, { from: 'cache', to: 'db' }],
    }, { source: 'voice', request: 'Put a Redis cache between the API and the database' });
    if (!r.ok) throw new Error(r.errors.join('; '));
    store.edit({
      summary: 'Added order events',
      add_nodes: [{ id: 'events', label: 'Order Events', kind: 'queue', tech: 'Pub/Sub', provider: 'gcp', group: 'gcp' },
        { id: 'mailer', label: 'Mailer', kind: 'function', tech: 'Cloud Run functions', provider: 'gcp', group: 'gcp' }],
      add_edges: [{ from: 'api', to: 'events', label: 'publishes', style: 'dashed' }, { from: 'events', to: 'mailer' }],
    }, { source: 'voice', request: 'Add a Pub/Sub topic with a mailer' });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${colorScheme}-3-edited-highlight.png` });
  await page.waitForTimeout(2600);
  const after = await page.evaluate(() => window.__studio.store.scene.nodes.map((n) => [n.id, n.x, n.y]));
  const moved = before.filter(([id, x, y]) => { const a = after.find((n) => n[0] === id); return a[1] !== x || a[2] !== y; }).map((n) => n[0]);
  console.log(`[${colorScheme}] nodes moved by the edits: ${moved.join(', ') || 'none'}`);

  // Documentation and a table in the documentation tab (a book with its contents)
  await page.evaluate(() => {
    const { store } = window.__studio;
    const r = store.edit({ write_blocks: [
      { id: 'overview', kind: 'text', title: 'Architecture Overview', text: '## Overview\nCustomers reach the **Orders API** on Cloud Run through Cloud Load Balancing.\n## Data flow\n- Reads go through the `Memorystore` cache\n- Orders are stored in Cloud SQL\n- Order events are published to Pub/Sub\n## Reliability\n> Serverless services scale to zero and across zones.' },
      { id: 'components', kind: 'table', title: 'Components', columns: ['Component', 'Technology', 'Responsibility'], rows: [
        ['Orders API', 'Cloud Run', 'Order handling'], ['Cache', 'Memorystore for Redis', 'Hot reads'],
        ['Orders DB', 'Cloud SQL', 'System of record'], ['Order Events', 'Pub/Sub', 'Async notifications']] },
    ] }, { source: 'voice', label: 'Documented the architecture' });
    if (!r.ok) throw new Error(r.errors.join('; '));
  });
  await page.click('.page-tab.doc-tab .tab-main');
  await page.waitForSelector('.doc-article');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${colorScheme}-4-docs-book.png` });
  await page.click('.toc-section:has-text("Data flow")');
  await page.waitForTimeout(500);
  await page.click('.chapter-link.next');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${colorScheme}-4b-docs-table.png` });
  const chapters = await page.locator('.toc-chapter').count();
  if (chapters !== 2) errors.push(`[${colorScheme}] expected 2 chapters in the contents, found ${chapters}`);
  await page.click('.page-tab:not(.doc-tab) .tab-main >> nth=0');
  await page.waitForSelector('.doc-view', { state: 'detached' });

  // Select a node to show its toolbar, show the changes of the page, the zoom menu and the minimap
  await page.click('.react-flow__node[data-id="api"]');
  await page.click('button[role="tab"]:has-text("Changes")');
  await page.click('.zoom-level');
  await page.keyboard.press('m');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${colorScheme}-5-selected-changes-zoom.png` });
  await page.keyboard.press('Escape');
  await page.keyboard.press('m');

  // Flowchart, top to bottom, on a second page
  await page.evaluate(async () => {
    const { workspace } = window.__studio;
    workspace.addPage();
    await workspace.store.create({
      diagram_type: 'flowchart', direction: 'TB', title: 'Order processing',
      nodes: [
        { id: 'start', label: 'Order received', kind: 'start' },
        { id: 'validate', label: 'Validate order', kind: 'process' },
        { id: 'paid', label: 'Payment succeeded?', kind: 'decision' },
        { id: 'ship', label: 'Ship order', kind: 'process' },
        { id: 'notify', label: 'Notify customer', kind: 'io' },
        { id: 'invoice', label: 'Invoice', kind: 'document' },
        { id: 'end', label: 'Done', kind: 'end' },
      ],
      edges: [
        { from: 'start', to: 'validate' }, { from: 'validate', to: 'paid' },
        { from: 'paid', to: 'ship', label: 'Yes' }, { from: 'paid', to: 'notify', label: 'No' },
        { from: 'ship', to: 'invoice' }, { from: 'invoice', to: 'end' }, { from: 'notify', to: 'end' },
      ],
    }, { source: 'text' });
  });
  await page.click('button[role="tab"]:has-text("Diagrams")');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${colorScheme}-6-pages-history.png` });
  const tabs = await page.locator('.page-tab:not(.doc-tab)').count();
  if (tabs !== 2) errors.push(`[${colorScheme}] expected 2 page tabs, found ${tabs}`);
  await page.click('button[aria-label="Close history"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${colorScheme}-7-flowchart.png` });

  // Settings dialog
  await page.click('button[aria-label="Settings"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${colorScheme}-8-settings.png` });
  await page.keyboard.press('Escape');

  // Typing: "/" focuses the request field of the dock
  await page.keyboard.press('/');
  await page.keyboard.type('Add a Redis cache between the API and the database');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/${colorScheme}-9-typing.png`, clip: { x: 300, y: 700, width: 840, height: 200 } });
  await page.close();
}

await run('light');
await run('dark');
await browser.close();
console.log(errors.length ? `Console errors:\n${errors.join('\n')}` : 'No console errors');
