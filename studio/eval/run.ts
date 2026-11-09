/**
 * Eval harness: plays scripted multi-turn conversations against the real
 * Gemini Live model (text input instead of speech), executes its tool calls
 * on a headless store and scores
 *   - accuracy: structural checks per step (scenarios.ts), and
 *   - stability: the share of existing nodes that a step was not supposed to
 *     touch and that kept their id, label, kind, technology, group and position.
 *
 *   npm run eval [-- --model gemini-3.8-live] [-- --only flowchart]
 *
 * It runs in Node, so it uses the API key directly (server/apiKey.ts: the
 * environment, the macOS Keychain or .env.local); only the browser needs tokens.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readApiKey } from '../server/apiKey';
import { handleToolCall } from '../src/agent/dispatcher';
import { SYSTEM_INSTRUCTION } from '../src/agent/prompt';
import { TOOL_DECLARATIONS } from '../src/agent/tools';
import { DiagramStore } from '../src/engine/store';
import { describeScene } from '../src/engine/summary';
import type { Scene } from '../src/engine/types';
import { LiveClient, type FunctionCall } from '../src/voice/liveClient';
import { SCENARIOS, type Scenario, type Step } from './scenarios';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const apiKey = readApiKey(fileURLToPath(new URL('..', import.meta.url)));
const model = arg('model') ?? process.env.STUDIO_MODEL ?? 'gemini-3.8-live';
const only = arg('only');
const QUIET_MS = 2500;
const STEP_TIMEOUT_MS = 90_000;

interface StepResult {
  say: string;
  passed: string[];
  failed: string[];
  stable: number;
  checked: number;
  unstable: string[];
  calls: string[];
  reply: string;
  seconds: number;
}

/** Existing nodes the step was not supposed to touch that changed anyway. */
function stability(before: Scene, after: Scene, step: Step, moved: Set<string>) {
  const unstable: string[] = [];
  let checked = 0;
  for (const n of before.nodes) {
    if ((step.mayChange ?? []).some((re) => re.test(n.label) || re.test(n.tech ?? ''))) continue;
    checked++;
    const m = after.nodes.find((x) => x.id === n.id);
    if (m == null) {
      unstable.push(`${n.id} removed`);
    } else if (m.label !== n.label || m.kind !== n.kind || (m.tech ?? '') !== (n.tech ?? '') || (m.group ?? '') !== (n.group ?? '')) {
      unstable.push(`${n.id} changed`);
    } else if ((m.x !== n.x || m.y !== n.y) && !moved.has(n.id)) {
      unstable.push(`${n.id} moved`);
    }
  }
  return { stable: checked - unstable.length, checked, unstable };
}

async function runScenario(sc: Scenario): Promise<StepResult[]> {
  const store = new DiagramStore();
  const results: StepResult[] = [];
  let pending = 0;
  let lastActivity = Date.now();
  let calls: string[] = [];
  let reply = '';
  let failure: Error | null = null;
  let queue = Promise.resolve();
  let request = '';
  const moved = new Set<string>();
  let onReady = () => {};

  const client: LiveClient = new LiveClient({
    apiKey, model, systemInstruction: SYSTEM_INSTRUCTION, tools: TOOL_DECLARATIONS, thinkingLevel: 'LOW',
  }, {
    onReady: () => onReady(),
    onOutputTranscript: (t) => { reply += t; lastActivity = Date.now(); },
    onAudio: () => { lastActivity = Date.now(); },
    onTurnComplete: () => { lastActivity = Date.now(); },
    onToolCall: (call: FunctionCall) => {
      pending++;
      lastActivity = Date.now();
      calls.push(`${call.name}(${JSON.stringify(call.args ?? {})})`);
      queue = queue.then(async () => {
        const response = await handleToolCall(call.name, call.args, { store, source: 'text', request });
        const entry = store.history[store.historyIndex];
        entry.changes.movedNodes.forEach((id) => moved.add(id));
        if (call.name === 'tidy_layout' || call.name === 'create_diagram') {
          store.scene.nodes.forEach((n) => moved.add(n.id));
        }
        client.sendToolResponse(call, response);
        pending--;
        lastActivity = Date.now();
      });
    },
    onError: (e) => { failure = e; },
  });

  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('setup timed out')), 20_000);
    onReady = () => { clearTimeout(t); resolve(); };
    client.connect();
  });

  for (const step of sc.steps) {
    if (failure) throw failure;
    const before = store.scene;
    calls = [];
    reply = '';
    request = step.say;
    moved.clear();
    const started = Date.now();
    lastActivity = started;
    client.sendText(step.say);
    // Done when the model is quiet, no tool call is running and it did something
    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        const quiet = Date.now() - lastActivity > QUIET_MS && pending === 0;
        if ((quiet && (calls.length > 0 || reply !== '')) || Date.now() - started > STEP_TIMEOUT_MS || failure) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
    await queue;
    const after = store.scene;
    const passed = step.checks.filter((c) => c.test(after)).map((c) => c.name);
    const failed = step.checks.filter((c) => !c.test(after)).map((c) => c.name);
    const st = stability(before, after, step, moved);
    results.push({ say: step.say, passed, failed, ...st, calls, reply: reply.trim(), seconds: (Date.now() - started - QUIET_MS) / 1000 });
    const mark = failed.length === 0 && st.unstable.length === 0 ? '✓' : '✗';
    console.log(`  ${mark} ${step.say}`);
    console.log(`      checks ${passed.length}/${step.checks.length}` + (failed.length ? ` — failed: ${failed.join('; ')}` : '') +
      ` · stability ${st.stable}/${st.checked}` + (st.unstable.length ? ` — ${st.unstable.join(', ')}` : '') +
      ` · ${calls.map((c) => c.slice(0, c.indexOf('('))).join(', ') || 'no tool call'}`);
  }
  console.log('\n' + describeScene(store.scene).split('\n').map((l) => '    ' + l).join('\n') + '\n');
  client.close();
  return results;
}

async function main() {
  if (!apiKey) {
    console.error('No Gemini API key: run ./studio.sh key (or set GEMINI_API_KEY) to run the eval (it talks to the real Gemini Live API).');
    process.exit(2);
  }
  console.log(`Model ${model}\n`);
  const report: Record<string, StepResult[]> = {};
  /** Scenarios that could not run (connection, model, timeout), with the reason. */
  const errors: Record<string, string> = {};
  let checks = 0, passedChecks = 0, stable = 0, checked = 0;
  const scenarios = SCENARIOS.filter((s) => only == null || s.name.toLowerCase().includes(only.toLowerCase()));
  if (scenarios.length === 0) {
    console.error(`No scenario matches --only ${JSON.stringify(only)}; scenarios: ${SCENARIOS.map((s) => s.name).join(', ')}`);
    process.exit(2);
  }
  for (const sc of scenarios) {
    console.log(`▶ ${sc.name}`);
    try {
      const results = await runScenario(sc);
      report[sc.name] = results;
      for (const r of results) {
        checks += r.passed.length + r.failed.length;
        passedChecks += r.passed.length;
        stable += r.stable;
        checked += r.checked;
      }
    } catch (e) {
      errors[sc.name] = e instanceof Error ? e.message : String(e);
      console.log(`  ✗ ${errors[sc.name]}`);
    }
  }
  const failed = Object.keys(errors).length;
  const pct = (a: number, b: number) => (b === 0 ? '–' : `${Math.round((100 * a) / b)}%`);
  console.log(`Accuracy ${pct(passedChecks, checks)} (${passedChecks}/${checks} checks) · Stability ${pct(stable, checked)} (${stable}/${checked} untouched nodes kept)`);
  mkdirSync(new URL('./results/', import.meta.url), { recursive: true });
  const file = new URL(`./results/${new Date().toISOString().replace(/[:.]/g, '-')}.json`, import.meta.url);
  writeFileSync(file, JSON.stringify({ model, report, errors }, null, 2));
  console.log(`Details: ${file.pathname}`);
  if (failed > 0) {
    // A run in which scenarios did not run is not a score: never let it pass as one
    console.error(`${failed} of ${scenarios.length} scenarios did not run: ${Object.keys(errors).join(', ')}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
