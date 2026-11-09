import type { DGroup, DNode, NodeKind, Provider } from './types';

/** Placeholder the agent can use for the elements the user has selected. */
export const SELECTED = '@selected';

/** Lowercase letters and digits only, for tolerant comparisons. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** A readable id from a label or a proposed id: lower snake case. */
export function slugify(s: string): string {
  const slug = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  return slug === '' ? 'node' : /^[0-9]/.test(slug) ? 'n_' + slug : slug;
}

/** Returns an id based on the given one that is not in the set. */
export function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    return base;
  }
  let i = 2;
  while (taken.has(base + '_' + i)) {
    i++;
  }
  return base + '_' + i;
}

export interface Resolution<T> {
  item?: T;
  /** Set when the reference was not an exact id, e.g. "the database". */
  note?: string;
  error?: string;
}

/**
 * Finds the element a reference means: its id, or (as spoken references are
 * imprecise) its label, a normalized id or a unique partial label match.
 */
export function resolveRef<T extends { id: string; label: string }>(
  ref: string,
  items: T[],
  what: string,
): Resolution<T> {
  const exact = items.find((i) => i.id === ref);
  if (exact) {
    return { item: exact };
  }
  const key = normalize(ref);
  if (key === '') {
    return { error: `Empty ${what} reference.` };
  }
  const byId = items.filter((i) => normalize(i.id) === key);
  if (byId.length === 1) {
    return { item: byId[0], note: `"${ref}" → ${byId[0].id}` };
  }
  const byLabel = items.filter((i) => normalize(i.label) === key);
  if (byLabel.length === 1) {
    return { item: byLabel[0], note: `"${ref}" → ${byLabel[0].id}` };
  }
  const partial = items.filter((i) => {
    const l = normalize(i.label);
    return l.includes(key) || (key.length >= 4 && key.includes(l) && l.length >= 3);
  });
  if (partial.length === 1) {
    return { item: partial[0], note: `"${ref}" → ${partial[0].id}` };
  }
  const candidates = (byLabel.length > 1 ? byLabel : partial).slice(0, 6);
  if (candidates.length > 1) {
    return {
      error: `"${ref}" is ambiguous, it matches ${candidates.map((c) => `${c.id} "${c.label}"`).join(', ')}.`,
    };
  }
  return { error: `No ${what} "${ref}".` };
}

/** Words that do not identify an element in a spoken reference. */
const FILLER = new Set(['the', 'a', 'an', 'this', 'that', 'these', 'those', 'our', 'my', 'your', 'its', 'their',
  'node', 'box', 'element', 'component', 'one', 'thing', 'new', 'old', 'existing']);

/** Words for each kind, so "the database" finds the only database. */
const KIND_WORDS: Partial<Record<NodeKind, string[]>> = {
  database: [
    'database', 'databases', 'db', 'datastore', 'sql', 'alloydb', 'spanner', 'firestore', 'bigtable',
    'rds', 'aurora', 'dynamodb', 'documentdb', 'neptune', 'cosmosdb', 'postgres', 'postgresql', 'mysql',
    'mongodb', 'cassandra', 'cockroachdb', 'supabase', 'bazadedate',
  ],
  cache: ['cache', 'redis', 'valkey', 'memcache', 'memcached', 'memorystore', 'elasticache', 'memorydb'],
  queue: [
    'queue', 'topic', 'pubsub', 'eventbus', 'eventarc', 'workflows', 'events', 'broker', 'kafka',
    'sqs', 'sns', 'eventbridge', 'stepfunctions', 'eventhubs', 'servicebus', 'eventgrid', 'logicapps',
    'rabbitmq', 'nats', 'pulsar', 'cloudtasks', 'cloudscheduler', 'coada',
  ],
  storage: [
    'storage', 'bucket', 'blob', 'filestore', 'objectstorage', 'cloudstorage', 'gcs', 's3', 'efs', 'ebs',
    'fsx', 'glacier', 'blobstorage', 'adls', 'datalake', 'persistentdisk', 'hyperdisk', 'netapp',
    'artifactregistry', 'ecr', 'acr', 'stocare',
  ],
  function: ['function', 'functions', 'lambda', 'cloudfunction', 'cloudrunfunctions', 'azurefunctions', 'functie'],
  gateway: ['gateway', 'apigateway', 'apigee', 'cloudendpoints', 'ingress', 'cdn', 'cloudcdn', 'cloudfront', 'frontdoor', 'apim'],
  loadbalancer: ['loadbalancer', 'lb', 'balancer', 'cloudloadbalancing', 'alb', 'nlb', 'elb', 'applicationgateway', 'trafficmanager'],
  user: ['user', 'users', 'customer', 'customers', 'person', 'people', 'actor', 'employee', 'employees', 'operator', 'admin', 'utilizator', 'utilizatori', 'client', 'clienti'],
  client: ['frontend', 'webapp', 'browser', 'website', 'web', 'spa', 'portal', 'console'],
  mobile: ['mobile', 'mobileapp', 'app', 'phone', 'ios', 'android', 'tablet'],
  api: ['api', 'restapi', 'graphql', 'grpc'],
  service: ['service', 'backend', 'microservice', 'cloudrun', 'appengine', 'fargate', 'ecs', 'containerapps', 'appservice', 'serviciu'],
  server: ['server', 'vm', 'virtualmachine', 'computeengine', 'ec2', 'instance', 'baremetal', 'mainframe'],
  container: ['container', 'pod', 'kubernetes', 'k8s', 'gke', 'eks', 'aks', 'docker', 'openshift', 'helm', 'istio'],
  ai: [
    'ai', 'model', 'llm', 'agent', 'agents', 'gemini', 'imagen', 'veo', 'vertex', 'vertexai', 'agentbuilder',
    'rag', 'embeddings', 'vectorsearch', 'documentai', 'contactcenterai', 'ccai', 'automl',
    'bedrock', 'sagemaker', 'azureopenai', 'aifoundry', 'aisearch', 'copilot', 'vllm', 'ollama',
  ],
  analytics: [
    'analytics', 'warehouse', 'datawarehouse', 'lakehouse', 'bigquery', 'dataflow', 'dataproc', 'cloudcomposer',
    'datastream', 'dataform', 'dataplex', 'looker', 'dashboard', 'monitoring', 'logging', 'trace',
    'redshift', 'kinesis', 'glue', 'athena', 'quicksight', 'synapse', 'fabric', 'databricks', 'snowflake',
    'powerbi', 'prometheus', 'grafana', 'observability',
  ],
  security: [
    'auth', 'authentication', 'firewall', 'armor', 'cloudarmor', 'kms', 'cloudkms', 'secret', 'secretmanager',
    'security', 'iam', 'cloudiam', 'iap', 'beyondcorp', 'scc', 'chronicle', 'secops', 'waf', 'shield',
    'cognito', 'guardduty', 'entraid', 'keyvault', 'sentinel', 'zerotrust',
  ],
  network: [
    'network', 'router', 'cloudrouter', 'vpn', 'cloudvpn', 'interconnect', 'cloudinterconnect',
    'nat', 'cloudnat', 'dns', 'clouddns', 'route53', 'directconnect', 'transitgateway', 'expressroute',
    'privateserviceconnect', 'servicemesh',
  ],
  external: ['external', 'thirdparty', 'saas', 'stripe', 'twilio', 'salesforce', 'sap', 'servicenow', 'partner'],
  decision: ['decision', 'condition', 'check'],
  start: ['start', 'begin', 'beginning'],
  end: ['end', 'finish', 'stop'],
};

export function resolveNode(ref: string, nodes: DNode[]): Resolution<DNode> {
  const direct = resolveRef(ref, nodes, 'node');
  if (direct.item != null || /ambiguous/.test(direct.error ?? '')) {
    return direct;
  }
  // Spoken references: drop filler words, then match labels, technologies and kinds
  const words = ref.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w !== '' && !FILLER.has(w));
  const key = words.join('');
  if (key === '') return direct;
  const unique = (found: DNode[]): Resolution<DNode> | null =>
    found.length === 1 ? { item: found[0], note: `"${ref}" → ${found[0].id}` } : null;
  const result =
    unique(nodes.filter((n) => normalize(n.label) === key || normalize(n.id) === key)) ??
    unique(nodes.filter((n) => n.tech != null && normalize(n.tech) === key)) ??
    unique(nodes.filter((n) => normalize(n.label).includes(key) || (n.tech != null && normalize(n.tech).includes(key)))) ??
    unique(nodes.filter((n) => (KIND_WORDS[n.kind] ?? [n.kind]).includes(key) || n.kind === key)) ??
    unique(nodes.filter((n) => words.some((w) => (KIND_WORDS[n.kind] ?? [n.kind]).includes(w))));
  return result ?? direct;
}

export function resolveGroup(ref: string, groups: DGroup[]): Resolution<DGroup> {
  const direct = resolveRef(ref, groups, 'group');
  if (direct.item != null || /ambiguous/.test(direct.error ?? '')) {
    return direct;
  }
  const groupFiller = new Set([...FILLER, 'group', 'boundary', 'container', 'area', 'section', 'zone']);
  const words = ref.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z0-9]+/)
    .filter((w) => w !== '' && !groupFiller.has(w));
  const key = words.join('');
  if (key === '') return direct;
  const unique = (found: DGroup[]): Resolution<DGroup> | null =>
    found.length === 1 ? { item: found[0], note: `"${ref}" → ${found[0].id}` } : null;
  return (
    unique(groups.filter((g) => normalize(g.label) === key || normalize(g.id) === key)) ??
    unique(groups.filter((g) => normalize(g.label).includes(key))) ??
    unique(groups.filter((g) => g.kind === key || words.includes(g.kind))) ??
    direct
  );
}

const KIND_HINTS: [RegExp, NodeKind][] = [
  [/\b(start|begin|început)\b/i, 'start'],
  [/\b(end|finish|stop|sfârșit|final)\b/i, 'end'],
  [/\?\s*$/, 'decision'],
  [/\b(redis|valkey|memcache\w*|cache|memorystore|elasticache|memorydb)\b/i, 'cache'],
  [/\b(db|database|sql|postgres\w*|pgvector|alloydb|mysql|mariadb|mongo\w*|spanner|firestore|datastore|dynamo\w*|bigtable|cosmos ?db|rds|aurora|documentdb|neptune|keyspaces|cockroach\w*|cassandra|neo4j|supabase|bază de date|baza de date)\b/i, 'database'],
  [/\b(queue|kafka|msk|pub\/?sub|sqs|sns|rabbit\w*|event ?bus|eventarc|eventbridge|step functions|event hubs?|service bus|event grid|logic apps?|cloud tasks|workflows|cloud scheduler|application integration|nats|pulsar|coadă|coada)\b/i, 'queue'],
  [/\b(bucket|s3|gcs|cloud storage|filestore|persistent disk|hyperdisk|netapp|artifact registry|ecr|acr|blob storage|azure files|adls|data lake storage|ebs|efs|fsx|glacier|blob|storage|stocare)\b/i, 'storage'],
  [/\b(lambda|cloud run functions?|cloud functions?|azure functions?|functions?|serverless function)\b/i, 'function'],
  [/\b(load ?balancer|cloud load balancing|lb|alb|elb|nlb|application gateway|traffic manager|global accelerator)\b/i, 'loadbalancer'],
  [/\b(api gateway|gateway|apigee|cloud endpoints|ingress|cloud cdn|cloudfront|front door|api management|apim|cdn)\b/i, 'gateway'],
  [/\b(cloud dns|route ?53|azure dns|cloud router|cloud nat|cloud vpn|cloud interconnect|direct connect|transit gateway|expressroute|virtual wan|network connectivity center|private service connect|service directory|vpc network|router|switch|dns)\b/i, 'network'],
  [/\b(user|users|customer|customers|employee|employees|operator|agent user|client user|actor|admin|person|shopper|patient|analyst|developer|utilizator|client)\b/i, 'user'],
  [/\b(browser|web app|frontend|spa|web portal|dashboard ui|web)\b/i, 'client'],
  [/\b(mobile|ios|android|phone|tablet)\b/i, 'mobile'],
  [/\b(llm|gemini|imagen|veo|vertex ?ai|agent builder|vector search|vertex ai search|document ai|contact center ai|ccai|automl|speech-to-text|text-to-speech|vision ai|translation ai|model armor|model garden|feature store|bedrock|sagemaker|amazon q|textract|rekognition|comprehend|lex|kendra|azure openai|ai foundry|ai search|document intelligence|embeddings?|rag|grounding|model|ml|ai|agent)\b/i, 'ai'],
  [/\b(bigquery|dataflow|dataproc|cloud composer|datastream|dataform|dataplex|data fusion|warehouse|lakehouse|analytics|dashboard|looker|cloud monitoring|cloud logging|cloud trace|cloud profiler|error reporting|redshift|kinesis|emr|glue|athena|quicksight|firehose|synapse|microsoft fabric|data factory|databricks|snowflake|power ?bi|prometheus|grafana|opentelemetry)\b/i, 'analytics'],
  [/\b(auth|iam|cloud iam|cloud armor|cloud kms|secret manager|certificate manager|security command center|identity-aware proxy|iap|identity platform|beyondcorp|vpc service controls|chronicle|secops|recaptcha|assured workloads|firewall|waf|aws shield|cognito|secrets manager|guardduty|macie|security hub|entra ?id|key vault|sentinel|defender|zero ?trust|security|identity|secret)\b/i, 'security'],
  [/\b(vm|server|compute engine|ec2|lightsail|azure vm|virtual machine|vmware engine|bare metal|mainframe|instance)\b/i, 'server'],
  [/\b(pod|container|docker|gke|google kubernetes engine|kubernetes|k8s|eks|aks|openshift|fargate|ecs|container apps|helm|argocd|istio|statefulset|daemonset)\b/i, 'container'],
  [/\b(email|smtp|sendgrid|ses|mail)\b/i, 'email'],
  [/\b(stripe|twilio|salesforce|sap|servicenow|workday|shopify|github|gitlab|slack|external|third[- ]party)\b/i, 'external'],
  [/\b(api|service|backend|microservice|cloud run|app engine|cloud build|cloud deploy|cloud workstations|app service|elastic beanstalk|serviciu)\b/i, 'service'],
];

/** Guesses a kind from the label and technology when none is given. */
export function inferKind(label: string, tech?: string, diagramType?: string): NodeKind {
  const text = `${label} ${tech ?? ''}`;
  if (diagramType === 'flowchart') {
    if (/\?\s*$/.test(label)) return 'decision';
    if (/^\s*(start|begin|început)\b/i.test(label)) return 'start';
    if (/^\s*(end|finish|stop|sfârșit)\b/i.test(label)) return 'end';
    return 'process';
  }
  for (const [re, kind] of KIND_HINTS) {
    if (kind === 'start' || kind === 'end' || kind === 'decision') {
      continue; // only meaningful in flowcharts
    }
    if (re.test(text)) {
      return kind;
    }
  }
  return 'service';
}

const PROVIDER_HINTS: [RegExp, Provider][] = [
  [
    /\b(gcp|google cloud|cloud run|cloud sql|alloydb|spanner|firestore|bigtable|memorystore|cloud storage|gcs|filestore|hyperdisk|persistent disk|bigquery|dataflow|dataproc|cloud composer|datastream|dataform|dataplex|data fusion|looker|pub\/?sub|eventarc|workflows|cloud tasks|cloud scheduler|vertex ?ai|gemini|imagen|veo|agent builder|document ai|contact center ai|ccai|automl|model armor|cloud load balancing|cloud cdn|cloud dns|cloud nat|cloud router|cloud vpn|cloud interconnect|private service connect|apigee|cloud endpoints|cloud armor|cloud iam|identity-aware proxy|beyondcorp|cloud kms|secret manager|certificate manager|security command center|vpc service controls|chronicle|secops|cloud build|cloud deploy|artifact registry|cloud workstations|cloud monitoring|cloud logging|cloud trace|compute engine|app engine|gke|google kubernetes engine|firebase)\b/i,
    'gcp',
  ],
  [
    /\b(aws|amazon|ec2|ecs|eks|fargate|lambda|lightsail|elastic beanstalk|outposts|rds|aurora|dynamodb|documentdb|neptune|keyspaces|elasticache|memorydb|s3|ebs|efs|fsx|glacier|redshift|kinesis|emr|glue|athena|quicksight|firehose|msk|sqs|sns|eventbridge|step functions|appsync|bedrock|sagemaker|textract|rekognition|comprehend|kendra|alb|nlb|elb|cloudfront|route ?53|direct connect|transit gateway|global accelerator|aws waf|aws shield|cognito|secrets manager|guardduty|macie|security hub|cloudwatch|cloudtrail|x-ray|codebuild|codedeploy|codepipeline|ecr)\b/i,
    'aws',
  ],
  [
    /\b(azure|microsoft fabric|aks|azure kubernetes|container apps|app service|azure functions|azure sql|cosmos ?db|azure cache|blob storage|azure files|adls|data lake storage|synapse|data factory|event hubs?|service bus|event grid|logic apps?|azure openai|ai foundry|ai search|cognitive search|document intelligence|front door|application gateway|traffic manager|expressroute|virtual wan|azure firewall|api management|apim|entra ?id|key vault|defender for cloud|sentinel|azure monitor|application insights|azure devops|acr)\b/i,
    'azure',
  ],
  [
    /\b(kubernetes|k8s|openshift|rancher|pod|statefulset|daemonset|replicaset|cronjob|ingress|gateway api|configmap|persistentvolume|pvc|helm|kustomize|argocd|flux|istio|linkerd|cilium|envoy|coredns|prometheus|grafana|loki|jaeger|cert-manager|knative|kubeflow|vllm)\b/i,
    'k8s',
  ],
  [
    /\b(on-?prem\w*|data ?center|bare metal|mainframe|z\/os|as\/400|vmware|vsphere|esxi|nutanix|openstack|active directory|ldap|san|nas|corporate network|branch office|factory edge)\b/i,
    'onprem',
  ],
];

/** Infers the cloud/infrastructure ecosystem provider from a node's technology and label. */
export function inferProvider(label: string, tech?: string): Provider | undefined {
  // Check tech first (most specific), then combined label + tech
  if (tech) {
    for (const [re, provider] of PROVIDER_HINTS) {
      if (re.test(tech)) return provider;
    }
  }
  const combined = `${label} ${tech ?? ''}`;
  for (const [re, provider] of PROVIDER_HINTS) {
    if (re.test(combined)) return provider;
  }
  return undefined;
}
