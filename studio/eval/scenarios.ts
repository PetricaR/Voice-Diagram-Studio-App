/**
 * Multi-turn conversations for the eval harness. Each step is one user
 * request (sent as text to the Live model) with structural checks on the
 * resulting diagram. `mayChange` lists the labels of existing nodes the step
 * is allowed to change; any other existing node that changes counts against
 * stability.
 */
import type { DNode, Scene } from '../src/engine/types';

export interface Check {
  name: string;
  test: (s: Scene) => boolean;
}

export interface Step {
  say: string;
  checks: Check[];
  mayChange?: RegExp[];
}

export interface Scenario {
  name: string;
  steps: Step[];
}

const find = (s: Scene, re: RegExp): DNode[] => s.nodes.filter((n) => re.test(n.label) || re.test(n.tech ?? ''));

export const hasNode = (re: RegExp): Check => ({ name: `has node ${re}`, test: (s) => find(s, re).length > 0 });
export const noNode = (re: RegExp): Check => ({ name: `no node ${re}`, test: (s) => find(s, re).length === 0 });
export const edge = (a: RegExp, b: RegExp): Check => ({
  name: `edge ${a} → ${b}`,
  test: (s) => s.edges.some((e) => find(s, a).some((n) => n.id === e.from) && find(s, b).some((n) => n.id === e.to)),
});
export const noEdge = (a: RegExp, b: RegExp): Check => ({ name: `no edge ${a} → ${b}`, test: (s) => !edge(a, b).test(s) });
export const nodesBetween = (min: number, max: number): Check => ({
  name: `${min}–${max} nodes`, test: (s) => s.nodes.length >= min && s.nodes.length <= max,
});
export const isType = (t: string): Check => ({ name: `type ${t}`, test: (s) => s.type === t });
export const color = (re: RegExp, c: string): Check => ({ name: `${re} is ${c}`, test: (s) => find(s, re).some((n) => n.color === c) });
export const inGroup = (re: RegExp, groupRe: RegExp): Check => ({
  name: `${re} in group ${groupRe}`,
  test: (s) => find(s, re).some((n) => {
    let g = s.groups.find((x) => x.id === n.group);
    const seen = new Set<string>();
    while (g != null && !seen.has(g.id)) {
      if (groupRe.test(g.label)) return true;
      seen.add(g.id);
      g = s.groups.find((x) => x.id === g!.parent);
    }
    return false;
  }),
});

// Documentation chapters (found by id or title) and their content
const chaptersOf = (s: Scene, re: RegExp) => s.blocks.filter((b) => re.test(b.id) || re.test(b.title ?? ''));
const chapterContent = (b: Scene['blocks'][number]) =>
  b.kind === 'table' ? [...(b.columns ?? []), ...(b.rows ?? []).flat()].join(' | ') : b.text ?? '';

export const hasChapter = (re: RegExp, kind?: 'text' | 'table'): Check => ({
  name: `${kind ?? ''} chapter ${re}`.trim(),
  test: (s) => chaptersOf(s, re).some((b) => kind == null || b.kind === kind),
});
export const oneChapter = (re: RegExp): Check => ({ name: `exactly one chapter ${re}`, test: (s) => chaptersOf(s, re).length === 1 });
export const chapterSays = (re: RegExp, content: RegExp, times = 1): Check => ({
  name: `chapter ${re} says ${content}${times > 1 ? ` ×${times}` : ''}`,
  test: (s) => chaptersOf(s, re).some((b) =>
    (chapterContent(b).match(new RegExp(content.source, content.flags.includes('g') ? content.flags : content.flags + 'g')) ?? []).length >= times),
});
export const chaptersBetween = (min: number, max: number): Check => ({
  name: `${min}–${max} chapters`, test: (s) => s.blocks.length >= min && s.blocks.length <= max,
});
const ACTORS = new Set(['user', 'client', 'mobile', 'external']);
/** Every component of the diagram (not users, clients or external systems) is a row of the table, its label in the first column. */
export const tableCoversNodes = (re: RegExp): Check => ({
  name: `table ${re} lists every component`,
  test: (s) => chaptersOf(s, re).some((b) => b.kind === 'table' && s.nodes.filter((n) => !ACTORS.has(n.kind)).every((n) =>
    (b.rows ?? []).some((r) => (r[0] ?? '').toLowerCase().includes(n.label.toLowerCase())))),
});

export const SCENARIOS: Scenario[] = [
  {
    name: 'GCP web app, ten edits',
    steps: [
      {
        say: 'Draw a web application on Google Cloud: users reach a load balancer, which routes to an API on Cloud Run. The API stores orders in Cloud SQL.',
        checks: [isType('architecture'), hasNode(/load ?balanc/i), hasNode(/cloud run|api/i), hasNode(/cloud sql|database|orders/i), nodesBetween(3, 9)],
      },
      {
        say: 'Put a Redis cache between the API and the database.',
        checks: [hasNode(/redis|cache|memorystore/i), edge(/api|cloud run/i, /redis|cache|memorystore/i), edge(/redis|cache|memorystore/i, /cloud sql|database|orders/i)],
      },
      {
        say: 'Rename the API to Orders API.',
        checks: [hasNode(/orders api/i)],
        mayChange: [/api/i],
      },
      {
        say: 'Add a Pub/Sub topic called order events that the Orders API publishes to.',
        checks: [hasNode(/pub\/?sub|order events/i), edge(/orders api/i, /pub\/?sub|order events/i)],
      },
      {
        say: 'Add a notification service that subscribes to the order events and sends emails.',
        checks: [hasNode(/notif/i), edge(/pub\/?sub|order events/i, /notif/i)],
      },
      {
        say: 'No wait, the order events should be published by the database, not by the API.',
        checks: [edge(/cloud sql|database/i, /pub\/?sub|order events/i), noEdge(/orders api/i, /pub\/?sub|order events/i)],
      },
      {
        say: 'Make the notification service orange.',
        checks: [color(/notif/i, 'orange')],
        mayChange: [/notif/i],
      },
      {
        say: 'Add BigQuery for analytics, fed from the database.',
        checks: [hasNode(/bigquery|analytics/i), edge(/cloud sql|database/i, /bigquery|analytics/i)],
      },
      {
        say: 'Remove the notification service.',
        checks: [noNode(/notif/i), hasNode(/orders api/i), hasNode(/redis|cache|memorystore/i), hasNode(/bigquery|analytics/i)],
        mayChange: [/notif/i],
      },
      {
        say: 'Label the connection from the users to the load balancer HTTPS.',
        checks: [{ name: 'users → load balancer labelled HTTPS', test: (s) => s.edges.some((e) => /https/i.test(e.label ?? '')) }],
      },
    ],
  },
  {
    name: 'Architecture documentation (arc42, C4, ADRs)',
    steps: [
      {
        say: 'Draw an architecture on Google Cloud: users go through Cloud Load Balancing to an Orders API on Cloud Run, which caches in Memorystore for Redis, stores orders in Cloud SQL and publishes order events to Pub/Sub.',
        checks: [isType('architecture'), hasNode(/cloud run|orders api/i), hasNode(/cloud sql/i), hasNode(/pub\/?sub/i)],
      },
      {
        say: 'Document this architecture.',
        checks: [
          chaptersBetween(6, 10),
          hasChapter(/overview|introduction/i, 'text'),
          chapterSays(/overview|introduction/i, /quality goals/i),
          hasChapter(/context/i, 'table'),
          hasChapter(/building|component/i, 'table'),
          tableCoversNodes(/building|component/i),
          chapterSays(/runtime/i, /^\s*1\. /m),
          chapterSays(/runtime/i, /\basync/i),
          chapterSays(/decision/i, /ADR-\d/, 2),
          chapterSays(/decision/i, /consequences/i),
          hasChapter(/risk/i, 'table'),
          chapterSays(/risk/i, /mitigation/i),
        ],
      },
      {
        say: 'Add a decision record about using Pub/Sub for the order events.',
        checks: [oneChapter(/decision/i), chapterSays(/decision/i, /ADR-\d/, 3), chapterSays(/decision/i, /pub\/?sub/i), chaptersBetween(6, 10)],
      },
      {
        say: 'Add a runbook for a database outage after the deployment chapter.',
        checks: [hasChapter(/runbook/i, 'text'), chapterSays(/runbook/i, /escalat/i)],
      },
    ],
  },
  {
    name: 'Order flowchart',
    steps: [
      {
        say: 'Make a flowchart for processing an order: start, validate the order, check if payment succeeded, if yes ship the order, if no notify the customer, then end.',
        checks: [isType('flowchart'), hasNode(/validat/i), hasNode(/ship/i), hasNode(/notif/i)],
      },
      {
        say: 'Add a step to reserve inventory right after validating the order.',
        checks: [hasNode(/inventor|reserv/i), edge(/validat/i, /inventor|reserv/i)],
      },
      {
        say: 'After shipping, send a confirmation email before the end.',
        checks: [hasNode(/confirm|email/i), edge(/ship/i, /confirm|email/i)],
      },
      {
        say: 'Rename "notify the customer" to "Retry payment".',
        checks: [hasNode(/retry payment/i)],
        mayChange: [/notif/i],
      },
    ],
  },
  {
    name: 'Romanian: arhitectură pe AWS',
    steps: [
      {
        say: 'Desenează o arhitectură pe AWS: utilizatorii trec prin API Gateway către o funcție Lambda care scrie în DynamoDB.',
        checks: [hasNode(/gateway/i), hasNode(/lambda/i), hasNode(/dynamo/i), edge(/lambda/i, /dynamo/i)],
      },
      {
        say: 'Adaugă o coadă SQS între Lambda și DynamoDB.',
        checks: [hasNode(/sqs/i), edge(/lambda/i, /sqs/i)],
      },
      {
        say: 'Fă Lambda-ul roșu.',
        checks: [color(/lambda/i, 'red')],
        mayChange: [/lambda/i],
      },
    ],
  },
];
