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
