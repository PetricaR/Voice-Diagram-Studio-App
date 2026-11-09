/**
 * End-to-end test of the voice agent pipeline in the browser against a mock
 * Gemini Live server: typed requests go through the real LiveClient, the
 * mock answers with function calls like the model would, and the test checks
 * the tool responses (diagram state, errors) and the canvas.
 *   npm run dev   (in another terminal)
 *   node e2e/live-mock.mjs [outDir]
 */
import { chromium } from 'playwright';
import { WebSocketServer } from 'ws';

const out = process.argv[2] ?? 'e2e/screens';
const url = process.env.STUDIO_URL ?? 'http://127.0.0.1:5173/';
const PORT = 8765;
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failures.push(what);
};

// The model's side of the conversation: one script step per typed request
const script = [
  {
    expect: /web app/i,
    call: {
      name: 'create_diagram',
      args: {
        diagram_type: 'architecture', direction: 'LR', title: 'Shop',
        nodes: [
          { id: 'user', label: 'Shoppers', kind: 'user' },
          { id: 'api', label: 'Shop API', kind: 'service', tech: 'Cloud Run', provider: 'gcp' },
          { id: 'db', label: 'Orders DB', kind: 'database', tech: 'Cloud SQL', provider: 'gcp' },
        ],
        edges: [{ from: 'user', to: 'api', label: 'HTTPS' }, { from: 'api', to: 'db' }],
      },
    },
    verify: (r) => r.ok === true && /version 1/.test(r.diagram) && /api "Shop API"/.test(r.diagram),
    say: 'Drew the shop.',
  },
  {
    expect: /cache/i,
    // The model refers to "the database" by name instead of its id
    call: {
      name: 'edit_diagram',
      args: {
        base_version: 1, summary: 'Added a cache',
        add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache', tech: 'Memorystore' }],
        remove_edges: [{ from: 'api', to: 'the database' }],
        add_edges: [{ from: 'api', to: 'cache' }, { from: 'cache', to: 'db' }],
      },
    },
    verify: (r) => r.ok === true && /cache -> db/.test(r.diagram) && !/api -> db/.test(r.diagram) && r.understood?.length === 1,
    say: 'Added a cache between the API and the database.',
  },
  {
    expect: /payments/i,
    call: { name: 'edit_diagram', args: { base_version: 2, summary: 'x', add_edges: [{ from: 'api', to: 'payments' }] } },
    verify: (r) => r.ok === false && /payments/.test(r.errors.join(' ')) && /version 2/.test(r.diagram),
    say: 'There is no payments service yet.',
  },
  {
    expect: /redraw|new/i,
    // A full redraw over an existing diagram is refused
    call: { name: 'create_diagram', args: { diagram_type: 'architecture', nodes: [{ id: 'x', label: 'X', kind: 'service' }] } },
    verify: (r) => r.ok === false && /edit_diagram/.test(r.errors.join(' ')) && /new_page: true/.test(r.errors.join(' ')),
    say: 'I kept the diagram and will edit it instead.',
  },
  {
    expect: /document/i,
    call: {
      name: 'write_text',
      args: { id: 'overview', title: 'Architecture Overview', text: '## Overview\\nShoppers use the **Shop API** on Cloud Run.\\n## Data\\n- Orders in Cloud SQL\\n- Hot reads from the cache' },
    },
    verify: (r) => r.ok === true && r.id === 'overview' && /1\. overview text "Architecture Overview"/.test(r.diagram) && /## Data/.test(r.diagram) &&
      /\(current, its documentation tab is shown\)/.test(r.diagram),
    say: 'Documented the architecture.',
  },
  {
    expect: /table/i,
    call: {
      name: 'write_table',
      args: { id: 'components', title: 'Components', columns: ['Component', 'Technology'], rows: [['Shop API', 'Cloud Run'], ['Orders DB', 'Cloud SQL'], ['Cache', 'Memorystore']] },
    },
    verify: (r) => r.ok === true && /2\. components table "Components"/.test(r.diagram) && /\| Shop API \| Cloud Run \|/.test(r.diagram),
    say: 'Added a table of the components.',
  },
  {
    expect: /new tab/i,
    call: {
      name: 'create_diagram',
      args: {
        new_page: true, diagram_type: 'flowchart', direction: 'TB', title: 'Checkout',
        nodes: [{ id: 'start', label: 'Cart', kind: 'start' }, { id: 'pay', label: 'Pay', kind: 'process' }, { id: 'done', label: 'Done', kind: 'end' }],
        edges: [{ from: 'start', to: 'pay' }, { from: 'pay', to: 'done' }],
      },
    },
    verify: (r) => r.ok === true && /page_1 "Shop" \+ documentation \(2 chapters\) · page_2 "Checkout" \(current\)/.test(r.diagram),
    say: 'Drew the checkout on a new page.',
  },
  {
    expect: /first tab/i,
    call: { name: 'switch_page', args: { page: '1' } },
    verify: (r) => r.ok === true && /page_1 "Shop" \(current\)/.test(r.diagram),
    say: 'Back on the shop.',
  },
  {
    expect: /zoom/i,
    call: { name: 'change_view', args: { action: 'focus', targets: ['db'] } },
    verify: (r) => r.ok === true,
    say: 'Zoomed on the database.',
  },
];

const wss = new WebSocketServer({ port: PORT });
let step = 0;
// The page authenticates with single-use tokens from the studio server, never with a key
const issued = [];
const used = new Set();
wss.on('connection', (ws, req) => {
  const params = new URL(req.url, 'http://x').searchParams;
  const token = params.get('access_token');
  check(params.get('key') == null && issued.includes(token) && !used.has(token), `the Live connection uses a fresh token from the server (${token})`);
  used.add(token);
  const send = (msg) => ws.send(JSON.stringify(msg));
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.setup) {
      const names = msg.setup.tools?.[0]?.functionDeclarations?.map((f) => f.name) ?? [];
      check(['create_diagram', 'edit_diagram', 'tidy_layout', 'get_diagram', 'undo', 'redo', 'write_text', 'write_table',
        'new_page', 'switch_page', 'rename_page', 'delete_page', 'change_view'].every((n) => names.includes(n)), `setup declares the tools (${names.join(', ')})`);
      check(/source of truth/i.test(msg.setup.systemInstruction?.parts?.[0]?.text ?? ''), 'setup carries the system instruction');
      send({ setupComplete: {} });
    } else if (msg.realtimeInput?.text) {
      const s = script[step];
      check(s != null && s.expect.test(msg.realtimeInput.text), `request ${step + 1} arrives as text: “${msg.realtimeInput.text}”`);
      send({ toolCall: { functionCalls: [{ id: `call-${step}`, ...s.call }] } });
    } else if (msg.toolResponse) {
      const s = script[step];
      const r = msg.toolResponse.functionResponses[0].response;
      check(s.verify(r), `tool response ${step + 1} (${s.call.name}) — ${r.ok ? r.result : r.errors?.[0]}`);
      send({ serverContent: { outputTranscription: { text: s.say } } });
      send({ serverContent: { turnComplete: true } });
      step++;
    }
  });
});

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// The studio server's token API, without a real key or Google
await page.route('**/api/live/status', (route) => route.fulfill({ json: { configured: true } }));
await page.route('**/api/live/token', (route) => {
  const body = route.request().postDataJSON();
  check(route.request().method() === 'POST' && body.model === 'gemini-3.8-live' && body.voice === 'Zephyr',
    `the page asks the server for a token for its model and voice (${JSON.stringify(body)})`);
  const token = `auth_tokens/test-${issued.length + 1}`;
  issued.push(token);
  return route.fulfill({ json: { token, expireTime: new Date(Date.now() + 30 * 60_000).toISOString() } });
});
await page.goto(url);
await page.evaluate((port) => {
  localStorage.clear();
  // A key saved by an earlier version must be removed from the browser
  localStorage.setItem('studio.settings', JSON.stringify({ apiKey: 'old-browser-key', endpoint: `ws://127.0.0.1:${port}` }));
}, PORT);
await page.reload();
await page.waitForSelector('.voice-dock');
check(!(await page.evaluate(() => localStorage.getItem('studio.settings'))).includes('old-browser-key'), 'a key saved in the browser by an earlier version is deleted');

async function type(text, expectStep) {
  // Opens the text field unless it is open already (no 30 s wait for a missing button)
  if (await page.locator('button[aria-label="Type a request"]').count() > 0) await page.click('button[aria-label="Type a request"]');
  await page.fill('.dock-input input', text);
  await page.keyboard.press('Enter');
  await page.waitForFunction((n) => window.__studio.agent.snapshot.reply !== '' && window.__studio.store.history.length >= 0 && n >= 0, expectStep);
  for (let i = 0; i < 50 && step < expectStep; i++) await page.waitForTimeout(100);
  await page.waitForTimeout(500);
}

await type('Draw a web app with an API and a database', 1);
check(await page.locator('.react-flow__node[data-id="api"]').isVisible(), 'the API node is on the canvas');
await type('Put a cache between the API and the database', 2);
check(await page.locator('.react-flow__node[data-id="cache"]').isVisible(), 'the cache node is on the canvas');
await type('Connect the API to payments', 3);
await type('Redraw it as a new diagram', 4);
const ids = await page.evaluate(() => window.__studio.store.scene.nodes.map((n) => n.id).sort().join(','));
check(ids === 'api,cache,db,user', `refused requests left the diagram as it was (${ids})`);
const history = await page.evaluate(() => window.__studio.store.history.map((h) => `${h.source}|${h.label}|${h.request ?? ''}`));
check(history.length === 3 && history[1].endsWith('|Draw a web app with an API and a database') &&
  history[2].startsWith('text|Added a cache|Put a cache'), `history records the requests (${history.slice(1).join(' / ')})`);
check(await page.locator('.dock-text .reply').innerText() === 'I kept the diagram and will edit it instead.', 'the spoken reply is shown in the dock');

// Documentation, a table, a new page, back to the first page and zoom, all by voice
await type('Document the architecture', 5);
await page.waitForSelector('.doc-view .doc-article');
check(/Shop API/.test(await page.locator('.doc-article').innerText()), 'the documentation opens in its own tab');
check(await page.locator('.react-flow__node[data-id="block:overview"]').count() === 0, 'nothing of the documentation is drawn on the canvas');
check(await page.locator('.page-tab.doc-tab.active').count() === 1, 'the documentation tab of the page is selected');
check((await page.locator('.toc-section').allInnerTexts()).map((t) => t.replace(/\s+/g, '')).join('|') === '1.1Overview|1.2Data',
  `the contents list the sections of the chapter (${(await page.locator('.toc-section').allInnerTexts()).join('|')})`);
await type('Add a table of the components', 6);
check(await page.locator('.doc-article td').count() === 6, 'the table chapter has 3 rows of 2 cells');
check((await page.locator('.toc-chapter').allInnerTexts()).map((t) => t.replace(/\s+/g, '')).join('|') === '1ArchitectureOverview|2Components',
  'the contents list both chapters in order');
await page.screenshot({ path: `${out}/mock-docs.png` });
check(await page.locator('.diagram-title h2').innerText() === 'Shop', 'the title is shown above the diagram');
await type('Draw the checkout flow in a new tab', 7);
check(await page.locator('.page-tab:not(.doc-tab)').count() === 2, 'a second page tab was added');
check(await page.locator('.page-tab.active .tab-label').innerText() === 'Checkout', 'the new page is shown');
await type('Go to the first tab', 8);
await page.waitForSelector('.react-flow__node[data-id="cache"]');
check(await page.locator('.page-tab.active .tab-label').innerText() === 'Shop', 'back on the first page, on its diagram');
check(await page.locator('.doc-view').count() === 0, 'the documentation is closed on the diagram tab');
const zoomBefore = await page.locator('.zoom-level').innerText();
await type('Zoom on the database', 9);
await page.waitForTimeout(700);
check(await page.locator('.zoom-level').innerText() !== zoomBefore, `the view zoomed on the database (${zoomBefore} → ${await page.locator('.zoom-level').innerText()})`);
check(await page.locator('.history-card').count() === 2, 'the history panel lists both generated diagrams');
await page.click('button[role="tab"]:has-text("Diagrams")');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/mock-voice.png` });

await browser.close();
wss.close();
check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join('; ') : ''}`);
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
