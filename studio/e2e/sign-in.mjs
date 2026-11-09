/**
 * End-to-end test of sign-in on a deployed studio (the server requires it):
 * the studio server's API and Google's sign-in script are stubbed, so it runs
 * without a key, a Google account or the network.
 *   npm run dev   (in another terminal)
 *   node e2e/sign-in.mjs [outDir]
 */
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'e2e/screens';
const url = process.env.STUDIO_URL ?? 'http://127.0.0.1:5173/';
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failures.push(what);
};

const CLIENT_ID = 'test-client.apps.googleusercontent.com';
const account = { email: 'ada@example.com', name: 'Ada Lovelace', plan: 'free', used: 3, limit: 20 };
let signedIn = false;
let tokenReply = null;
const posted = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.route('**/api/live/status', (route) => route.fulfill({
  json: { configured: true, auth: { required: true, configured: true, clientId: CLIENT_ID, freeDaily: 20, account: signedIn ? account : null } },
}));
await page.route('**/api/auth/google', (route) => {
  posted.push(route.request().postDataJSON());
  signedIn = true;
  return route.fulfill({ json: { account } });
});
await page.route('**/api/auth/logout', (route) => {
  signedIn = false;
  return route.fulfill({ json: { ok: true } });
});
await page.route('**/api/live/token', (route) => route.fulfill(tokenReply));
// Google Identity Services: a button that "signs in" with a fixed ID token
await page.route('https://accounts.google.com/gsi/client', (route) => route.fulfill({
  contentType: 'text/javascript',
  body: `window.google = { accounts: { id: {
    initialize(c) { window.__gsi = c; },
    renderButton(el) {
      const b = document.createElement('button');
      b.className = 'fake-google-button';
      b.textContent = 'Continue with Google';
      b.onclick = () => window.__gsi.callback({ credential: 'header.payload.signature-of-google' });
      el.append(b);
    },
    disableAutoSelect() { window.__gsiSignedOut = true; },
  } } };`,
}));

await page.goto(url);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForSelector('.voice-dock');

// Signed out: the top bar offers sign-in, and asking Gemini opens the dialog
check(await page.locator('.sign-in-btn').isVisible(), 'the top bar shows Sign in');
await page.fill('.dock-field', 'Draw a web app');
await page.keyboard.press('Enter');
await page.waitForSelector('.sign-in-dialog[open]');
check(/20 voice sessions a day/.test(await page.locator('.sign-in-dialog').innerText()), 'the dialog explains the free plan');
check(await page.inputValue('.dock-field') === 'Draw a web app', 'the typed request stays in the field while signing in');
await page.waitForSelector('.fake-google-button');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/sign-in-dialog.png` });

await page.click('.fake-google-button');
await page.waitForSelector('.account-btn');
check(posted.length === 1 && posted[0].credential === 'header.payload.signature-of-google', 'the Google ID token goes to the studio server');
check(!(await page.locator('.sign-in-dialog[open]').count()), 'the dialog closes after signing in');
check(/Signed in as ada@example.com/.test(await page.locator('.snackbar').innerText()), 'a snackbar confirms the account');

await page.click('.account-btn');
await page.waitForTimeout(400);
const menu = await page.locator('.account-menu').innerText();
check(/Ada Lovelace/.test(menu) && /Free plan/.test(menu) && /3 of 20 sessions used today/.test(menu), `the account menu shows plan and usage (${menu.replace(/\s+/g, ' ')})`);
await page.screenshot({ path: `${out}/sign-in-account.png` });
await page.keyboard.press('Escape');

// Out of sessions: the dock says so, without a pointless Try again
tokenReply = { status: 429, json: { error: 'daily-limit', message: "You have used today's 20 voice sessions. They renew at midnight UTC.", account: { ...account, used: 20 } } };
await page.click('.dock-talk');
await page.waitForSelector('.voice-dock.state-error');
const status = await page.locator('.dock-status').innerText();
check(/20 voice sessions/.test(status), `the dock shows the daily limit (${status})`);
check(await page.locator('.dock-live .text-btn').count() === 0, 'no Try again when the allowance is used up');
await page.click('.dock-dismiss');

// An expired session asks to sign in again
tokenReply = { status: 401, json: { error: 'signed-out', message: 'Sign in with Google to talk to the studio.' } };
signedIn = false;
await page.click('.dock-talk');
await page.waitForSelector('.sign-in-dialog[open]');
check(true, 'an expired session opens the sign-in dialog');
const offered = await page.waitForSelector('.dock-live .text-btn:has-text("Sign in")', { state: 'attached', timeout: 3000 }).then(() => true, () => false);
check(offered, `the dock offers Sign in (${(await page.locator('.dock-live .text-btn').allInnerTexts()).join(', ')})`);

// Signing in again, then out
await page.waitForSelector('.sign-in-dialog .fake-google-button');
await page.click('.sign-in-dialog .fake-google-button');
await page.waitForSelector('.account-btn');
check(posted.length === 2, 'signing in again sends a new ID token');
await page.click('.account-btn');
await page.click('.account-menu button:has-text("Sign out")');
await page.waitForSelector('.sign-in-btn');
check(await page.evaluate(() => window.__gsiSignedOut === true), 'signing out stops Google from picking the account again');

await browser.close();
check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join('; ') : ''}`);
console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
