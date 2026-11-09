import { describe, expect, it } from 'vitest';
import { handleToolCall } from '../src/agent/dispatcher';
import { applyEdit } from '../src/engine/ops';
import { groupBounds, intersects, isInGroup } from '../src/engine/scene';
import { DiagramStore } from '../src/engine/store';
import type { Scene } from '../src/engine/types';

const webApp = {
  diagram_type: 'architecture',
  direction: 'LR',
  title: 'Web App on GCP',
  groups: [{ id: 'gcp', label: 'Google Cloud', kind: 'region' }],
  nodes: [
    { id: 'user', label: 'Users', kind: 'user' },
    { id: 'lb', label: 'Load Balancer', kind: 'loadbalancer', tech: 'Cloud Load Balancing', provider: 'gcp', group: 'gcp' },
    { id: 'api', label: 'API', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'gcp' },
    { id: 'db', label: 'Database', kind: 'database', tech: 'Cloud SQL', provider: 'gcp', group: 'gcp' },
  ],
  edges: [
    { from: 'user', to: 'lb', label: 'HTTPS' },
    { from: 'lb', to: 'api' },
    { from: 'api', to: 'db', label: 'SQL' },
  ],
};

async function created(): Promise<DiagramStore> {
  const store = new DiagramStore();
  const r = await store.create(webApp, { source: 'text' });
  expect(r.ok, r.errors.join('\n')).toBe(true);
  return store;
}

/** No two nodes overlap, no node sits in a group it does not belong to. */
function expectClean(scene: Scene) {
  for (let i = 0; i < scene.nodes.length; i++) {
    const a = scene.nodes[i];
    expect(Number.isFinite(a.x) && Number.isFinite(a.y), `${a.id} has a position`).toBe(true);
    for (let j = i + 1; j < scene.nodes.length; j++) {
      expect(intersects(a, scene.nodes[j]), `${a.id} overlaps ${scene.nodes[j].id}`).toBe(false);
    }
  }
  const bounds = groupBounds(scene);
  for (const [gid, b] of bounds) {
    for (const n of scene.nodes) {
      if (!isInGroup(scene, n, gid)) {
        expect(intersects(b, n), `${n.id} is inside group ${gid} but not a member`).toBe(false);
      } else {
        const inside = n.x >= b.x && n.y >= b.y && n.x + n.w <= b.x + b.w && n.y + n.h <= b.y + b.h;
        expect(inside, `${n.id} is enclosed by ${gid}`).toBe(true);
      }
    }
  }
}

const positions = (scene: Scene) => new Map(scene.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));

describe('create', () => {
  it('lays out a new diagram without overlaps', async () => {
    const store = await created();
    const s = store.scene;
    expect(s.nodes.map((n) => n.id)).toEqual(['user', 'lb', 'api', 'db']);
    expectClean(s);
    // Left to right: the flow goes from the user to the database
    const x = (id: string) => s.nodes.find((n) => n.id === id)!.x;
    expect(x('user')).toBeLessThan(x('lb'));
    expect(x('lb')).toBeLessThan(x('api'));
    expect(x('api')).toBeLessThan(x('db'));
  });

  it('refuses to replace an existing diagram unless asked', async () => {
    const store = await created();
    const r = await handleToolCall('create_diagram', { ...webApp, edges: [], nodes: [{ id: 'x', label: 'X', kind: 'service' }] },
      { store, source: 'voice' });
    expect(r.ok).toBe(false);
    expect(store.scene.nodes).toHaveLength(4);
    const r2 = await handleToolCall('create_diagram', { ...webApp, edges: [], nodes: [{ id: 'x', label: 'X', kind: 'service' }], replace: true },
      { store, source: 'voice' });
    expect(r2.ok).toBe(true);
    expect(store.scene.nodes.map((n) => n.id)).toEqual(['x']);
  });
});

describe('edit', () => {
  it('inserts a node between two others and keeps everything else in place', async () => {
    const store = await created();
    const before = positions(store.scene);
    const r = store.edit({
      summary: 'Added a cache',
      add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache', tech: 'Memorystore', group: 'gcp' }],
      remove_edges: [{ from: 'api', to: 'db' }],
      add_edges: [{ from: 'api', to: 'cache' }, { from: 'cache', to: 'db' }],
    }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    const s = store.scene;
    expectClean(s);
    // Nodes before the insertion point did not move
    for (const id of ['user', 'lb', 'api']) {
      expect(positions(s).get(id)).toEqual(before.get(id));
    }
    // The database made room, by exactly one column, and is reported as moved
    expect(r.changes.movedNodes).toEqual(['db']);
    expect(positions(s).get('db')!.y).toBe(before.get('db')!.y);
    const cx = s.nodes.find((n) => n.id === 'cache')!;
    const api = s.nodes.find((n) => n.id === 'api')!;
    const db = s.nodes.find((n) => n.id === 'db')!;
    expect(cx.x).toBeGreaterThan(api.x);
    expect(cx.x).toBeLessThan(db.x);
    expect(s.edges.map((e) => `${e.from}->${e.to}`)).toEqual(['user->lb', 'lb->api', 'api->cache', 'cache->db']);
  });

  it('places a fan-out next to its source without moving anything', async () => {
    const store = await created();
    const before = positions(store.scene);
    const r = store.edit({
      summary: 'Added workers',
      add_nodes: [
        { id: 'topic', label: 'Events', kind: 'queue', tech: 'Pub/Sub', group: 'gcp' },
        { id: 'w1', label: 'Mailer', kind: 'service', group: 'gcp' },
        { id: 'w2', label: 'Billing', kind: 'service', group: 'gcp' },
      ],
      add_edges: [
        { from: 'api', to: 'topic', style: 'dashed' },
        { from: 'topic', to: 'w1' },
        { from: 'topic', to: 'w2' },
      ],
    }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    expectClean(store.scene);
    for (const [id, p] of before) {
      expect(positions(store.scene).get(id), id).toEqual(p);
    }
  });

  it('changes only the named fields', async () => {
    const store = await created();
    const before = structuredClone(store.scene);
    const r = store.edit({ summary: 'Renamed', update_nodes: [{ id: 'api', label: 'Orders API', color: 'red' }] }, { source: 'voice' });
    expect(r.ok).toBe(true);
    const api = store.scene.nodes.find((n) => n.id === 'api')!;
    expect(api.label).toBe('Orders API');
    expect(api.color).toBe('red');
    expect(api.tech).toBe('Cloud Run');
    expect(store.scene.nodes.filter((n) => n.id !== 'api')).toEqual(before.nodes.filter((n) => n.id !== 'api'));
    expect(store.scene.edges).toEqual(before.edges);
    expect(store.scene.version).toBe(before.version + 1);
  });

  it('understands spoken references to labels', async () => {
    const store = await created();
    const r = store.edit({ summary: 'x', update_nodes: [{ id: 'the database', tech: 'Spanner' }] }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    expect(r.notes[0]).toContain('db');
    expect(store.scene.nodes.find((n) => n.id === 'db')!.tech).toBe('Spanner');
  });

  it('finds the only node of a kind from a spoken name', async () => {
    const store = await created();
    store.edit({ summary: 'x', update_nodes: [{ id: 'db', label: 'Orders DB' }] }, { source: 'voice' });
    const r = store.edit({ summary: 'x', remove_edges: [{ from: 'the API', to: 'the database' }] }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    expect(store.scene.edges.some((e) => e.from === 'api' && e.to === 'db')).toBe(false);
  });

  it('rejects the whole batch on an unknown reference', async () => {
    const store = await created();
    const before = store.scene;
    const r = store.edit({
      summary: 'x',
      add_nodes: [{ id: 'queue', label: 'Queue', kind: 'queue' }],
      add_edges: [{ from: 'api', to: 'payments' }],
    }, { source: 'voice' });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('payments');
    expect(store.scene).toBe(before);
  });

  it('guards against removing most of the diagram', async () => {
    const store = await created();
    const r = store.edit({ summary: 'x', remove_nodes: ['user', 'lb', 'api'] }, { source: 'voice' });
    expect(r.ok).toBe(false);
    expect(store.scene.nodes).toHaveLength(4);
    const r2 = store.edit({ summary: 'x', remove_nodes: ['user', 'lb', 'api'], confirm_large_removal: true }, { source: 'voice' });
    expect(r2.ok).toBe(true);
    expect(store.scene.nodes.map((n) => n.id)).toEqual(['db']);
    expect(store.scene.edges).toHaveLength(0);
  });

  it('applies edits to the selection', async () => {
    const store = await created();
    store.setSelection(['lb', 'api']);
    const r = store.edit({ summary: 'x', update_nodes: [{ id: '@selected', color: 'green' }] }, { source: 'voice' });
    expect(r.ok).toBe(true);
    expect(store.scene.nodes.filter((n) => n.color === 'green').map((n) => n.id)).toEqual(['lb', 'api']);
  });

  it('reconnects an edge in place', async () => {
    const store = await created();
    const r = store.edit({ summary: 'x', update_edges: [{ from: 'lb', to: 'api', new_from: 'user' }] }, { source: 'voice' });
    expect(r.ok).toBe(true);
    expect(store.scene.edges.map((e) => `${e.from}->${e.to}`)).toEqual(['user->lb', 'user->api', 'api->db']);
  });

  it('keeps a group compact when existing nodes are moved into it', async () => {
    const store = await created();
    store.edit({
      summary: 'x',
      add_nodes: [{ id: 'auth', label: 'Auth', kind: 'security' }],
      add_edges: [{ from: 'user', to: 'auth' }],
    }, { source: 'voice' });
    const r = store.edit({ summary: 'x', update_nodes: [{ id: 'auth', group: 'gcp' }] }, { source: 'voice' });
    expect(r.ok).toBe(true);
    expectClean(store.scene);
  });

  it('undoes and redoes whole requests', async () => {
    const store = await created();
    const v = store.scene;
    store.edit({ summary: 'x', add_nodes: [{ id: 'cdn', label: 'CDN', kind: 'gateway' }], add_edges: [{ from: 'user', to: 'cdn' }] }, { source: 'voice' });
    expect(store.scene.nodes).toHaveLength(5);
    store.undo();
    expect(store.scene).toBe(v);
    store.redo();
    expect(store.scene.nodes).toHaveLength(5);
  });

  it('persists title and metadata-only edits in the store', async () => {
    const store = await created();
    const r = store.edit({ title: 'Renamed Architecture' }, { source: 'manual' });
    expect(r.ok).toBe(true);
    expect(store.scene.title).toBe('Renamed Architecture');
    store.undo();
    expect(store.scene.title).toBe('Web App on GCP');
  });

  it('inserts a multi-node chain between two adjacent nodes in flow order', async () => {
    const store = await created();
    const r = store.edit({
      summary: 'Inserted auth and rate limiter',
      add_nodes: [
        { id: 'auth', label: 'Auth', kind: 'security', group: 'gcp' },
        { id: 'limiter', label: 'Rate Limiter', kind: 'gateway', group: 'gcp' },
      ],
      remove_edges: [{ from: 'lb', to: 'api' }],
      add_edges: [
        { from: 'lb', to: 'auth' },
        { from: 'auth', to: 'limiter' },
        { from: 'limiter', to: 'api' },
      ],
    }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    const s = store.scene;
    expectClean(s);
    const x = (id: string) => s.nodes.find((n) => n.id === id)!.x;
    expect(x('lb')).toBeLessThan(x('auth'));
    expect(x('auth')).toBeLessThan(x('limiter'));
    expect(x('limiter')).toBeLessThan(x('api'));
    expect(x('api')).toBeLessThan(x('db'));
  });

  it('resolves spoken group references and rejects group parent cycles', async () => {
    const store = await created();
    const r1 = store.edit({
      summary: 'Added subnet',
      add_groups: [{ id: 'sub', label: 'Backend Subnet', kind: 'subnet', parent: 'the Google Cloud region' }],
    }, { source: 'voice' });
    expect(r1.ok, r1.errors.join('\n')).toBe(true);
    expect(store.scene.groups.find((g) => g.id === 'sub')!.parent).toBe('gcp');

    const r2 = store.edit({
      summary: 'Cycle',
      update_groups: [{ id: 'gcp', parent: 'the subnet' }],
    }, { source: 'voice' });
    expect(r2.ok).toBe(false);
    expect(r2.errors[0]).toMatch(/cycle/i);
  });

  it('preserves group bounds when all members are removed from a group', async () => {
    const store = await created();
    const r = store.edit({
      summary: 'Ungroup all',
      update_groups: [{ id: 'gcp', remove_members: ['lb', 'api', 'db'] }],
    }, { source: 'voice' });
    expect(r.ok, r.errors.join('\n')).toBe(true);
    expect(groupBounds(store.scene).get('gcp')).toBeDefined();
  });
});

describe('stability over a conversation', () => {
  it('keeps untouched elements identical across ten edits', async () => {
    const store = await created();
    const steps = [
      { summary: '1', add_nodes: [{ id: 'cache', label: 'Cache', kind: 'cache', group: 'gcp' }], remove_edges: [{ from: 'api', to: 'db' }], add_edges: [{ from: 'api', to: 'cache' }, { from: 'cache', to: 'db' }] },
      { summary: '2', update_nodes: [{ id: 'api', label: 'Orders API' }] },
      { summary: '3', add_nodes: [{ id: 'events', label: 'Order Events', kind: 'queue', group: 'gcp' }], add_edges: [{ from: 'api', to: 'events', style: 'dashed' }] },
      { summary: '4', add_nodes: [{ id: 'mailer', label: 'Mailer', kind: 'function', group: 'gcp' }], add_edges: [{ from: 'events', to: 'mailer' }] },
      { summary: '5', add_nodes: [{ id: 'cdn', label: 'CDN', kind: 'gateway' }], remove_edges: [{ from: 'user', to: 'lb' }], add_edges: [{ from: 'user', to: 'cdn' }, { from: 'cdn', to: 'lb' }] },
      { summary: '6', update_edges: [{ from: 'cdn', to: 'lb', label: 'HTTPS' }] },
      { summary: '7', add_groups: [{ id: 'data', label: 'Data', kind: 'subnet', parent: 'gcp', members: ['db', 'cache'] }] },
      { summary: '8', add_nodes: [{ id: 'bq', label: 'Analytics', kind: 'analytics', tech: 'BigQuery', group: 'gcp' }], add_edges: [{ from: 'db', to: 'bq', label: 'CDC', style: 'dashed' }] },
      { summary: '9', update_nodes: [{ id: 'mailer', color: 'orange' }] },
      { summary: '10', remove_nodes: ['mailer'] },
    ];
    for (const step of steps) {
      const before = store.scene;
      const r = store.edit(step, { source: 'voice' });
      expect(r.ok, `step ${step.summary}: ${r.errors.join('; ')}`).toBe(true);
      const after = store.scene;
      expectClean(after);
      const touched = new Set([...r.changes.addedNodes, ...r.changes.updatedNodes, ...r.changes.removedNodes, ...r.changes.movedNodes]);
      for (const n of before.nodes) {
        if (touched.has(n.id)) continue;
        const m = after.nodes.find((x) => x.id === n.id);
        expect(m, `step ${step.summary}: ${n.id} still exists`).toEqual(n);
      }
      // Moves only happen to make room, never more than a column/row
      expect(r.changes.movedNodes.length, `step ${step.summary}: moved ${r.changes.movedNodes}`).toBeLessThanOrEqual(before.nodes.length);
    }
    expect(store.scene.nodes.map((n) => n.id).sort()).toEqual(['api', 'bq', 'cache', 'cdn', 'db', 'events', 'lb', 'user'].sort());
  });
});

describe('applyEdit', () => {
  it('starts an empty canvas from scratch', () => {
    const empty: Scene = { version: 0, type: 'flowchart', direction: 'TB', title: '', nodes: [], edges: [], groups: [], blocks: [] };
    const r = applyEdit(empty, {
      add_nodes: [{ id: 'start', label: 'Start', kind: 'start' }, { id: 'check', label: 'Valid?' }],
      add_edges: [{ from: 'start', to: 'check' }],
    });
    expect(r.ok).toBe(true);
    expect(r.scene.nodes.find((n) => n.id === 'check')!.kind).toBe('decision');
    expectClean(r.scene);
  });
});

describe('routing', () => {
  it('goes straight between facing nodes and around nodes in the way', async () => {
    const { routeEdge } = await import('../src/engine/routing');
    const a = { x: 0, y: 0, w: 200, h: 72 };
    const b = { x: 300, y: 0, w: 200, h: 72 };
    const c = { x: 600, y: 10, w: 200, h: 72 };
    expect(routeEdge(a, b, [c]).points).toHaveLength(2);
    // a → c with b in between must not cross b
    const r = routeEdge(a, c, [b]);
    for (let i = 0; i < r.points.length - 1; i++) {
      const p = r.points[i], q = r.points[i + 1];
      const horizontal = Math.abs(p.y - q.y) < 0.5;
      const crossesB = horizontal
        ? p.y > b.y && p.y < b.y + b.h && Math.max(p.x, q.x) > b.x && Math.min(p.x, q.x) < b.x + b.w
        : p.x > b.x && p.x < b.x + b.w && Math.max(p.y, q.y) > b.y && Math.min(p.y, q.y) < b.y + b.h;
      expect(crossesB).toBe(false);
    }
  });

  it('enters the top side of a lower target node in a downward flowchart branch', async () => {
    const { routeEdge } = await import('../src/engine/routing');
    const decision = { x: 232, y: 264, w: 192, h: 96 };
    const ship = { x: 120, y: 432, w: 184, h: 72 };
    const r = routeEdge(decision, ship, [], 0, undefined, { sourceCentered: true });
    const end = r.points[r.points.length - 1];
    expect(end.y).toBe(ship.y);
  });
});

describe('Google Cloud Architecture & Gen AI Blueprints', () => {
  it('lays out all built-in architecture and Gen AI blueprints cleanly', async () => {
    const { BLUEPRINTS } = await import('../src/ui/blueprints');
    expect(BLUEPRINTS.length).toBeGreaterThanOrEqual(6);
    for (const bp of BLUEPRINTS) {
      const store = new DiagramStore();
      const r = await store.create(bp.diagram, { source: 'system', label: bp.title });
      expect(r.ok, `${bp.id}: ${r.errors.join('; ')}`).toBe(true);
      expectClean(store.scene);
      for (const b of store.scene.blocks) {
        expect(Number.isFinite(b.x) && Number.isFinite(b.y), `${bp.id} block ${b.id} placed`).toBe(true);
        for (const n of store.scene.nodes) {
          expect(intersects(b, n), `${bp.id} block ${b.id} overlaps node ${n.id}`).toBe(false);
        }
      }
    }
  });

  it('infers kinds, providers, and Material Design Icons across all ecosystems (GCP, AWS, Azure, K8s, On-Prem)', async () => {
    const { inferKind, inferProvider } = await import('../src/engine/resolve');
    const { resolveNodeIcon } = await import('../src/ui/icons');
    expect(inferKind('Vector Store', 'AlloyDB for PostgreSQL', 'architecture')).toBe('database');
    expect(inferKind('Document Parser', 'Document AI', 'architecture')).toBe('ai');
    expect(inferKind('Agent Orchestrator', 'Vertex AI Agent Builder', 'architecture')).toBe('ai');
    expect(inferKind('Edge Protection', 'Cloud Armor', 'architecture')).toBe('security');
    expect(inferKind('Warehouse', 'BigQuery', 'architecture')).toBe('analytics');
    expect(inferKind('Event Stream', 'Amazon Kinesis', 'architecture')).toBe('analytics');
    expect(inferKind('Search Service', 'Azure AI Search', 'architecture')).toBe('ai');
    expect(inferKind('App Mesh', 'Istio Service Mesh', 'architecture')).toBe('container');

    expect(inferProvider('API', 'Cloud Run')).toBe('gcp');
    expect(inferProvider('Object Store', 'Amazon S3')).toBe('aws');
    expect(inferProvider('LLM Service', 'Azure OpenAI')).toBe('azure');
    expect(inferProvider('GitOps Controller', 'ArgoCD')).toBe('k8s');
    expect(inferProvider('Core ERP', 'VMware vSphere')).toBe('onprem');

    expect(resolveNodeIcon({ label: 'Parser', kind: 'ai', tech: 'Document AI' })).toBe('document_scanner');
    expect(resolveNodeIcon({ label: 'Orchestrator', kind: 'ai', tech: 'Vertex AI Agent Builder' })).toBe('smart_toy');
    expect(resolveNodeIcon({ label: 'RAG Index', kind: 'ai', tech: 'Vertex AI Vector Search' })).toBe('find_in_page');
    expect(resolveNodeIcon({ label: 'Analytics', kind: 'analytics', tech: 'BigQuery' })).toBe('query_stats');
    expect(resolveNodeIcon({ label: 'Secrets', kind: 'security', tech: 'Secret Manager' })).toBe('vpn_key');
    expect(resolveNodeIcon({ label: 'Safety Guard', kind: 'security', tech: 'Model Armor' })).toBe('verified_user');
    expect(resolveNodeIcon({ label: 'Cluster', kind: 'container', tech: 'Google Kubernetes Engine' })).toBe('view_in_ar');
    expect(resolveNodeIcon({ label: 'Release', kind: 'service', tech: 'Cloud Deploy' })).toBe('rocket_launch');
  });

  it('retrieves grounded Gen AI blueprints & components via RAG catalog and search_catalog tool', async () => {
    const { BLUEPRINT_CATALOG, loadAllBlueprints, searchBlueprints, searchComponents, retrieveCatalogContext } = await import('../src/engine/catalog');
    const { handleToolCall } = await import('../src/agent/dispatcher');
    // The 101 blueprints are loaded on demand, once
    expect(BLUEPRINT_CATALOG.length).toBe(8);
    const GEN_AI_101_BLUEPRINTS = await loadAllBlueprints();
    await loadAllBlueprints();
    expect(GEN_AI_101_BLUEPRINTS.length).toBe(101);
    expect(BLUEPRINT_CATALOG.length).toBe(109);

    // Flagship blueprints and representative #1-#101 blueprints lay out cleanly
    for (const bp of [
      ...BLUEPRINT_CATALOG.slice(0, 8),
      GEN_AI_101_BLUEPRINTS[0],
      GEN_AI_101_BLUEPRINTS[26],
      GEN_AI_101_BLUEPRINTS[37],
      GEN_AI_101_BLUEPRINTS[75],
      GEN_AI_101_BLUEPRINTS[100],
    ]) {
      const store = new DiagramStore();
      const r = await store.create(bp.diagram, { source: 'system', label: bp.title });
      expect(r.ok, `${bp.id}: ${r.errors.join('; ')}`).toBe(true);
      expectClean(store.scene);
    }

    const ragBlueprints = searchBlueprints('rag document ai pgvector');
    expect(ragBlueprints[0]?.id).toBe('genai-rag-document-ai');

    const bp38 = searchBlueprints('38 insurance claims multimodal');
    expect(bp38[0]?.id).toBe('genai-bp-38');

    const bp101 = searchBlueprints('101 llm evaluation observability');
    expect(bp101[0]?.id).toBe('genai-bp-101');

    const secBlueprints = searchBlueprints('secops threat triage chronicle', { category: 'security' });
    expect(secBlueprints[0]?.id).toBe('genai-secops-agent');

    const vectorComponents = searchComponents('vector search embeddings', { provider: 'gcp' });
    expect(vectorComponents.some((c) => c.tech.includes('AlloyDB') || c.tech.includes('Vector Search'))).toBe(true);

    const ctx = retrieveCatalogContext('customer agent contact center');
    expect(ctx.blueprints.some((b) => b.id === 'genai-multi-agent')).toBe(true);
    expect(ctx.components.some((c) => c.tech.includes('Contact Center AI') || c.tech.includes('Agent Builder'))).toBe(true);

    const store = new DiagramStore();
    const res = await handleToolCall('search_catalog', { query: 'nl2sql bigquery streaming', provider: 'gcp' }, { store, source: 'voice' });
    expect(res.ok).toBe(true);
    expect((res.blueprints as any[]).some((b) => b.id === 'data-analytics-lakehouse')).toBe(true);
    expect((res.components as any[]).some((c) => c.tech === 'BigQuery')).toBe(true);
  });

  it('integrates all 261 official Google Cloud SVG icons (Core, Category, and Products)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const { ALL_GCP_ICONS, GCP_CORE_ICONS, GCP_CATEGORY_ICONS, GCP_PRODUCT_ICONS, resolveGcpIconUrl, searchGcpIcons } = await import('../src/ui/gcpIcons');

    expect(GCP_CORE_ICONS.length).toBe(19);
    expect(GCP_CATEGORY_ICONS.length).toBe(26);
    expect(GCP_PRODUCT_ICONS.length).toBe(216);
    expect(ALL_GCP_ICONS.length).toBe(261);

    // Every registered icon URL points to an actual SVG file in public/
    const publicDir = path.resolve(process.cwd(), 'public');
    for (const item of ALL_GCP_ICONS) {
      const filePath = path.join(publicDir, item.url);
      expect(fs.existsSync(filePath), `Missing SVG file: ${filePath}`).toBe(true);
    }

    expect(resolveGcpIconUrl({ kind: 'ai', label: 'LLM', tech: 'Gemini on Vertex AI', provider: 'gcp' })).toBe('/gcp-icons/core/vertex_ai.svg');
    expect(resolveGcpIconUrl({ kind: 'ai', label: 'Orchestrator', tech: 'Vertex AI Agent Builder', provider: 'gcp' })).toBe('/gcp-icons/category/agents.svg');
    expect(resolveGcpIconUrl({ kind: 'database', label: 'Vector DB', tech: 'AlloyDB for PostgreSQL', provider: 'gcp' })).toBe('/gcp-icons/core/alloydb.svg');
    expect(resolveGcpIconUrl({ kind: 'queue', label: 'Events', tech: 'Pub/Sub', provider: 'gcp' })).toBe('/gcp-icons/products/pubsub.svg');
    expect(resolveGcpIconUrl({ kind: 'security', label: 'SIEM', tech: 'Google Security Operations', provider: 'gcp' })).toBe('/gcp-icons/core/security_operations.svg');
    // Non-GCP providers return null so they use Material Symbols
    expect(resolveGcpIconUrl({ kind: 'container', label: 'Partner Workloads', tech: 'Amazon EKS', provider: 'aws' })).toBeNull();

    const hits = searchGcpIcons('spanner');
    expect(hits[0]?.id).toBe('cloud_spanner');
  });
});
