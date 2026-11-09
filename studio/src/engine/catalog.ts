/**
 * RAG Knowledge Base & Component Catalog for Architecture & Gen AI Diagrams.
 *
 * Grounded in:
 * 1. Real-World Gen AI Use Cases with Technical Blueprints
 *    (https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints)
 *    - 6 Core AI Agent Categories: Customer Agents, Employee Agents, Data Agents,
 *      Code Agents, Creative Agents, Security Agents
 *    - 5 Gen AI Architecture Layers: Ingestion & Processing, Context & Vector RAG,
 *      Model & Reasoning, Serving & Agent Orchestration, Observability & Governance
 * 2. Google Cloud Architecture Center (https://docs.cloud.google.com/architecture)
 * 3. Google Cloud Architecture Framework (https://docs.cloud.google.com/architecture/framework)
 * 4. Google Cloud Official Icons & Diagramming Guidelines (https://cloud.google.com/icons?hl=en)
 * 5. Google Material Design Icons (https://github.com/google/material-design-icons)
 */
import type { CreateRequest } from './ops';
import { normalize } from './resolve';
import type { NodeKind, Provider } from './types';

export type AgentCategory =
  | 'customer'
  | 'employee'
  | 'data'
  | 'code'
  | 'creative'
  | 'security'
  | 'architecture'
  | 'flowchart';

export type ArchitectureLayer =
  | 'edge'
  | 'orchestration'
  | 'model'
  | 'context'
  | 'ingestion'
  | 'governance';

export const LAYER_LABELS: Record<ArchitectureLayer, string> = {
  edge: 'Edge, Access & Networking',
  orchestration: 'Serving, Orchestration & Compute',
  model: 'Model, Reasoning & Guardrails',
  context: 'Context, Vector DB, Cache & Storage',
  ingestion: 'Data Ingestion, Streaming & Analytics',
  governance: 'Security, Observability & DevOps',
};

export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  customer: 'Customer Agent',
  employee: 'Employee & RAG Agent',
  data: 'Data & NL2SQL Agent',
  code: 'Code & DevOps Agent',
  creative: 'Creative & Commerce Agent',
  security: 'Security & SecOps Agent',
  architecture: 'Cloud Architecture',
  flowchart: 'Process Flowchart',
};

export interface ComponentEntry {
  id: string;
  /** Official product or technology name (goes into DNode.tech). */
  tech: string;
  /** Default architectural role label (goes into DNode.label). */
  role: string;
  kind: NodeKind;
  provider?: Provider;
  layer: ArchitectureLayer;
  /** Architectural guidance on how this component is used and connected. */
  usage: string;
  /** Typical incoming/outgoing protocols or edge labels. */
  protocols: string[];
  /** Search keywords, synonyms, and use-case terms for RAG retrieval. */
  keywords: string[];
}

export interface BlueprintEntry {
  id: string;
  title: string;
  category: string;
  agentCategory: AgentCategory;
  /** Material Symbol name for UI cards. */
  icon: string;
  industries: string[];
  pillars: string[];
  summary: string;
  /** Five-layer architectural flow summary for RAG context. */
  dataflow: string[];
  keywords: string[];
  prompt: string;
  diagram: CreateRequest;
}

export const COMPONENT_CATALOG: ComponentEntry[] = [
  // --- Layer 3 & 4: Gen AI Models, Agents & Reasoning (Google Cloud Vertex AI) ---
  {
    id: 'gemini_vertex',
    tech: 'Gemini on Vertex AI',
    role: 'Gemini Reasoning',
    kind: 'ai',
    provider: 'gcp',
    layer: 'model',
    usage: 'Multimodal foundation model for grounded generation, complex reasoning, function/tool calling, and summarization.',
    protocols: ['grounded prompt', 'gRPC', 'tool calls'],
    keywords: ['gemini', 'llm', 'vertex ai', 'foundation model', 'reasoning', 'multimodal', 'generation', 'grounding'],
  },
  {
    id: 'vertex_agent_builder',
    tech: 'Vertex AI Agent Builder',
    role: 'Agent Orchestrator',
    kind: 'ai',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Orchestrates multi-agent workflows, planning, memory state, human-in-the-loop handoffs, and Cloud Run tool execution (ADK).',
    protocols: ['gRPC', 'plan & reason', 'tool calls'],
    keywords: ['agent builder', 'multi-agent', 'orchestrator', 'adk', 'agentic', 'dialogflow', 'customer agent', 'employee agent'],
  },
  {
    id: 'vertex_embeddings',
    tech: 'Vertex AI Embeddings',
    role: 'Embedding Service',
    kind: 'ai',
    provider: 'gcp',
    layer: 'model',
    usage: 'Converts text chunks, documents, and multimodal assets into dense vector embeddings for semantic retrieval.',
    protocols: ['chunks', 'embeddings', 'gRPC'],
    keywords: ['embeddings', 'vectorize', 'text-embedding', 'multimodal embedding', 'rag', 'semantic'],
  },
  {
    id: 'vertex_vector_search',
    tech: 'Vertex AI Vector Search',
    role: 'Vector Index',
    kind: 'ai',
    provider: 'gcp',
    layer: 'context',
    usage: 'Low-latency ScaNN-based vector similarity and hybrid search at billion-document scale for RAG and recommendation engines.',
    protocols: ['ANN query', 'top-k vectors', 'embeddings'],
    keywords: ['vector search', 'scann', 'ann', 'similarity search', 'rag', 'embeddings index', 'matching engine'],
  },
  {
    id: 'vertex_search',
    tech: 'Vertex AI Search',
    role: 'Enterprise Search',
    kind: 'ai',
    provider: 'gcp',
    layer: 'context',
    usage: 'Turnkey enterprise search & RAG with built-in connectors (Drive, Confluence, Slack, Salesforce, FHIR) and cited answers.',
    protocols: ['search & cite', 'HTTPS', 'connectors'],
    keywords: ['vertex ai search', 'enterprise search', 'commerce search', 'knowledge base', 'employee agent', 'rag'],
  },
  {
    id: 'document_ai',
    tech: 'Document AI',
    role: 'Document Parser',
    kind: 'ai',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Extracts structured fields, tables, layout chunks, and OCR from PDFs, invoices, claims, and forms.',
    protocols: ['PDFs', 'structured JSON', 'layout chunks'],
    keywords: ['document ai', 'ocr', 'layout parser', 'invoice', 'claims', 'forms', 'pdf extraction', 'unstructured'],
  },
  {
    id: 'contact_center_ai',
    tech: 'Contact Center AI',
    role: 'Omnichannel Contact Center',
    kind: 'ai',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Voice and chat virtual agent gateway with Speech-to-Text, Text-to-Speech, conversational turn management, and live agent assist.',
    protocols: ['voice / chat', 'SIP / WebRTC', 'gRPC'],
    keywords: ['contact center ai', 'ccai', 'call center', 'voice bot', 'customer support', 'customer agent', 'speech'],
  },
  {
    id: 'model_armor',
    tech: 'Model Armor',
    role: 'AI Safety Guardrails',
    kind: 'security',
    provider: 'gcp',
    layer: 'model',
    usage: 'Screens prompts and model responses for prompt injection, jailbreaks, PII/sensitive data leaks, and policy violations.',
    protocols: ['screen prompt', 'validated output'],
    keywords: ['model armor', 'guardrails', 'prompt injection', 'safety filter', 'dlp', 'responsible ai', 'pii'],
  },
  {
    id: 'gemini_code_assist',
    tech: 'Gemini Code Assist',
    role: 'Code & Migration Agent',
    kind: 'ai',
    provider: 'gcp',
    layer: 'model',
    usage: 'Assists with code generation, legacy codebase modernization (COBOL/Java/SAP), PR review, and automated unit test synthesis.',
    protocols: ['PR review', 'code patch'],
    keywords: ['code assist', 'code agent', 'legacy modernization', 'refactoring', 'pull request', 'developer'],
  },
  {
    id: 'imagen_veo',
    tech: 'Imagen & Veo on Vertex AI',
    role: 'Creative Media Models',
    kind: 'ai',
    provider: 'gcp',
    layer: 'model',
    usage: 'Generates and edits studio-grade marketing imagery (Imagen) and video assets (Veo) from grounded brand prompts.',
    protocols: ['media prompt', 'generated assets'],
    keywords: ['imagen', 'veo', 'creative agent', 'image generation', 'video generation', 'marketing', 'media'],
  },

  // --- Layer 2: Context, Databases, Caches & Storage (Google Cloud) ---
  {
    id: 'alloydb_pgvector',
    tech: 'AlloyDB for PostgreSQL',
    role: 'Operational & Vector DB',
    kind: 'database',
    provider: 'gcp',
    layer: 'context',
    usage: 'PostgreSQL-compatible HTAP database with ScaNN-accelerated pgvector for hybrid relational + vector RAG queries.',
    protocols: ['SQL', 'vector search', 'embeddings'],
    keywords: ['alloydb', 'pgvector', 'postgresql', 'postgres', 'vector database', 'htap', 'rag', 'relational'],
  },
  {
    id: 'cloud_sql',
    tech: 'Cloud SQL for PostgreSQL',
    role: 'Transactional DB',
    kind: 'database',
    provider: 'gcp',
    layer: 'context',
    usage: 'Managed relational database (PostgreSQL, MySQL, SQL Server) with multi-zone synchronous HA and read replicas.',
    protocols: ['SQL', 'CDC'],
    keywords: ['cloud sql', 'mysql', 'postgresql', 'sql server', 'relational', 'oltp', 'database'],
  },
  {
    id: 'cloud_spanner',
    tech: 'Spanner',
    role: 'Global Distributed DB',
    kind: 'database',
    provider: 'gcp',
    layer: 'context',
    usage: 'Globally distributed relational & graph database with external consistency, 99.999% availability, and unlimited scale.',
    protocols: ['SQL / Graph', 'gRPC'],
    keywords: ['spanner', 'cloud spanner', 'global database', 'multi-region', 'high availability', 'financial', 'graph'],
  },
  {
    id: 'firestore',
    tech: 'Firestore',
    role: 'Conversation & App State',
    kind: 'database',
    provider: 'gcp',
    layer: 'context',
    usage: 'Serverless document database with real-time client sync and vector search, ideal for agent session memory and chat history.',
    protocols: ['gRPC / HTTPS', 'real-time sync'],
    keywords: ['firestore', 'nosql', 'document database', 'session state', 'chat history', 'memory', 'firebase'],
  },
  {
    id: 'bigtable',
    tech: 'Bigtable',
    role: 'Low-Latency Feature Store',
    kind: 'database',
    provider: 'gcp',
    layer: 'context',
    usage: 'Wide-column NoSQL store for sub-10ms high-throughput telemetry, personalization features, and time-series workloads.',
    protocols: ['gRPC', 'feature lookup'],
    keywords: ['bigtable', 'nosql', 'wide-column', 'time-series', 'feature store', 'low latency', 'iot'],
  },
  {
    id: 'memorystore_redis',
    tech: 'Memorystore for Redis',
    role: 'Semantic & Session Cache',
    kind: 'cache',
    provider: 'gcp',
    layer: 'context',
    usage: 'In-memory Redis/Valkey tier for sub-millisecond session state, hot database reads, rate limiting, and semantic prompt caching.',
    protocols: ['RESP / TCP', 'hot reads', 'semantic cache'],
    keywords: ['memorystore', 'redis', 'valkey', 'cache', 'semantic cache', 'session', 'low latency'],
  },
  {
    id: 'cloud_storage',
    tech: 'Cloud Storage',
    role: 'Object & Document Store',
    kind: 'storage',
    provider: 'gcp',
    layer: 'context',
    usage: 'Durable object storage for raw PDFs, multimodal media, data lake parquet files, and model artifacts.',
    protocols: ['HTTPS', 'PDFs', 'events'],
    keywords: ['cloud storage', 'gcs', 'bucket', 'object storage', 'pdf', 'media', 'data lake'],
  },

  // --- Layer 4: Compute, Serverless, Containers & APIs (Google Cloud) ---
  {
    id: 'cloud_run',
    tech: 'Cloud Run',
    role: 'Serverless App / Agent API',
    kind: 'service',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Serverless container runtime that scales from zero to thousands of instances for web apps, RAG backends, and ADK agent tool servers.',
    protocols: ['HTTPS', 'HTTP/2', 'gRPC'],
    keywords: ['cloud run', 'serverless', 'container', 'api', 'microservice', 'backend', 'frontend', 'tool server'],
  },
  {
    id: 'gke',
    tech: 'Google Kubernetes Engine',
    role: 'Kubernetes Cluster',
    kind: 'container',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Managed Kubernetes (Autopilot/Standard) for microservices meshes, GPU model serving (vLLM/Ray), and stateful workloads.',
    protocols: ['gRPC', 'mTLS', 'HTTP/2'],
    keywords: ['gke', 'google kubernetes engine', 'kubernetes', 'k8s', 'cluster', 'autopilot', 'gpu', 'vllm'],
  },
  {
    id: 'cloud_run_functions',
    tech: 'Cloud Run functions',
    role: 'Event Trigger Function',
    kind: 'function',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Lightweight event-driven functions triggered by Cloud Storage uploads, Pub/Sub messages, or webhooks.',
    protocols: ['event trigger', 'HTTPS'],
    keywords: ['cloud run functions', 'cloud functions', 'function', 'serverless', 'webhook', 'trigger'],
  },
  {
    id: 'apigee',
    tech: 'Apigee API Management',
    role: 'Enterprise API Gateway',
    kind: 'gateway',
    provider: 'gcp',
    layer: 'edge',
    usage: 'Secures, rate-limits, versions, and monetizes external and partner APIs and enterprise tool connectors for AI agents.',
    protocols: ['HTTPS', 'OAuth 2.0', 'REST / gRPC'],
    keywords: ['apigee', 'api gateway', 'api management', 'rate limit', 'quota', 'partner api'],
  },

  // --- Layer 1: Edge, Networking & Hybrid Connectivity (Google Cloud) ---
  {
    id: 'cloud_load_balancing',
    tech: 'Cloud Load Balancing',
    role: 'Global Load Balancer',
    kind: 'loadbalancer',
    provider: 'gcp',
    layer: 'edge',
    usage: 'Global anycast Layer 7/Layer 4 load balancer with multi-region failover, TLS termination, and Cloud CDN/Armor integration.',
    protocols: ['HTTPS', 'HTTP/2', 'gRPC'],
    keywords: ['cloud load balancing', 'load balancer', 'lb', 'anycast', 'ingress', 'https'],
  },
  {
    id: 'cloud_cdn',
    tech: 'Cloud CDN',
    role: 'Edge CDN',
    kind: 'gateway',
    provider: 'gcp',
    layer: 'edge',
    usage: 'Caches static web assets, media, and public API responses at Google global edge points of presence.',
    protocols: ['HTTPS', 'HTTP/3'],
    keywords: ['cloud cdn', 'cdn', 'edge cache', 'static assets', 'media delivery'],
  },
  {
    id: 'cloud_armor',
    tech: 'Cloud Armor',
    role: 'WAF & DDoS Protection',
    kind: 'security',
    provider: 'gcp',
    layer: 'edge',
    usage: 'Edge web application firewall (OWASP Top 10), adaptive DDoS defense, bot management, and rate limiting.',
    protocols: ['HTTPS', 'filtered traffic'],
    keywords: ['cloud armor', 'waf', 'ddos', 'firewall', 'edge security', 'owasp'],
  },
  {
    id: 'cloud_interconnect',
    tech: 'Cloud Interconnect',
    role: 'Hybrid Interconnect',
    kind: 'network',
    provider: 'gcp',
    layer: 'edge',
    usage: 'High-bandwidth, low-latency dedicated or partner connection between on-premises data centers/other clouds and Google Cloud VPCs.',
    protocols: ['BGP / IPSec', 'MACsec', 'VLAN'],
    keywords: ['cloud interconnect', 'hybrid', 'cross-cloud', 'vpn', 'cloud router', 'on-prem'],
  },

  // --- Layer 1 & 5: Messaging, Eventing & Data Analytics (Google Cloud) ---
  {
    id: 'pubsub',
    tech: 'Pub/Sub',
    role: 'Event Stream Bus',
    kind: 'queue',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Global asynchronous messaging and streaming ingestion bus that decouples producers from analytics and AI consumers.',
    protocols: ['publishes', 'streams', 'push / pull'],
    keywords: ['pubsub', 'pub/sub', 'queue', 'topic', 'event bus', 'streaming', 'async', 'messaging'],
  },
  {
    id: 'eventarc',
    tech: 'Eventarc',
    role: 'Cloud Event Router',
    kind: 'queue',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Routes CloudEvents from 130+ Google Cloud sources (Cloud Storage, Audit Logs, Firestore) to Cloud Run and Workflows.',
    protocols: ['CloudEvents', 'triggers'],
    keywords: ['eventarc', 'events', 'trigger', 'cloudevents', 'audit log'],
  },
  {
    id: 'workflows',
    tech: 'Workflows',
    role: 'Service Orchestrator',
    kind: 'queue',
    provider: 'gcp',
    layer: 'orchestration',
    usage: 'Stateful serverless orchestration of multi-step microservices, retries, sagas, and long-running Document AI/Vertex AI jobs.',
    protocols: ['HTTPS', 'step calls'],
    keywords: ['workflows', 'orchestration', 'saga', 'state machine', 'step functions'],
  },
  {
    id: 'dataflow',
    tech: 'Dataflow',
    role: 'Stream & Batch ETL',
    kind: 'analytics',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Serverless Apache Beam pipeline for real-time stream enrichment, windowing, anomaly scoring, and embedding ingestion.',
    protocols: ['streams', 'Storage Write API'],
    keywords: ['dataflow', 'apache beam', 'streaming etl', 'batch', 'pipeline', 'enrichment'],
  },
  {
    id: 'datastream',
    tech: 'Datastream',
    role: 'Serverless CDC',
    kind: 'analytics',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Serverless Change Data Capture (CDC) replicating operational databases (Oracle, MySQL, PostgreSQL, AlloyDB) into BigQuery and Cloud Storage.',
    protocols: ['CDC', 'replication'],
    keywords: ['datastream', 'cdc', 'change data capture', 'replication', 'database sync'],
  },
  {
    id: 'bigquery',
    tech: 'BigQuery',
    role: 'Enterprise Lakehouse',
    kind: 'analytics',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Serverless petabyte-scale data warehouse and AI lakehouse supporting BigQuery ML, vector search, and NL2SQL data agents.',
    protocols: ['SQL', 'Storage Write API', 'BI Engine'],
    keywords: ['bigquery', 'warehouse', 'lakehouse', 'analytics', 'nl2sql', 'data agent', 'bqml', 'evaluation'],
  },
  {
    id: 'looker',
    tech: 'Looker',
    role: 'Semantic BI & Dashboards',
    kind: 'analytics',
    provider: 'gcp',
    layer: 'ingestion',
    usage: 'Governed semantic modeling layer and conversational BI dashboards powered by BigQuery and Gemini.',
    protocols: ['BI Engine', 'SQL'],
    keywords: ['looker', 'bi', 'dashboard', 'reporting', 'conversational analytics', 'data agent'],
  },

  // --- Layer 5: Security, Identity, DevOps & Observability (Google Cloud) ---
  {
    id: 'iap',
    tech: 'Identity-Aware Proxy',
    role: 'Zero-Trust Access',
    kind: 'security',
    provider: 'gcp',
    layer: 'governance',
    usage: 'Enforces BeyondCorp zero-trust context-aware identity verification for employees accessing internal apps and agents.',
    protocols: ['Zero Trust', 'HTTPS / OIDC'],
    keywords: ['identity-aware proxy', 'iap', 'beyondcorp', 'zero trust', 'access control', 'sso'],
  },
  {
    id: 'cloud_kms_secrets',
    tech: 'Cloud KMS & Secret Manager',
    role: 'Keys & Secrets Vault',
    kind: 'security',
    provider: 'gcp',
    layer: 'governance',
    usage: 'Manages CMEK encryption keys, hardware HSM keys, API credentials, and rotated database secrets.',
    protocols: ['CMEK', 'secret fetch'],
    keywords: ['cloud kms', 'secret manager', 'cmek', 'encryption', 'keys', 'secrets', 'vault'],
  },
  {
    id: 'google_secops',
    tech: 'Google Security Operations',
    role: 'SecOps & SIEM Platform',
    kind: 'security',
    provider: 'gcp',
    layer: 'governance',
    usage: 'Chronicle-based SIEM/SOAR with Gemini security agents for petabyte telemetry ingestion, threat hunting, and automated playbooks.',
    protocols: ['telemetry', 'SOAR playbook'],
    keywords: ['google security operations', 'secops', 'chronicle', 'siem', 'soar', 'security agent', 'threat detection', 'scc'],
  },
  {
    id: 'cloud_monitoring_logging',
    tech: 'Cloud Monitoring & Trace',
    role: 'Full-Stack Observability',
    kind: 'analytics',
    provider: 'gcp',
    layer: 'governance',
    usage: 'Collects metrics, structured logs, OpenTelemetry traces, SLO burn rates, and LLM latency/token telemetry.',
    protocols: ['OTel traces', 'metrics & logs'],
    keywords: ['cloud monitoring', 'cloud logging', 'cloud trace', 'observability', 'slo', 'opentelemetry', 'llmops'],
  },
  {
    id: 'cloud_build_deploy',
    tech: 'Cloud Build & Cloud Deploy',
    role: 'CI/CD Pipeline',
    kind: 'service',
    provider: 'gcp',
    layer: 'governance',
    usage: 'Builds container images to Artifact Registry, runs automated tests/security scans, and manages progressive delivery to Cloud Run/GKE.',
    protocols: ['build & scan', 'canary rollout'],
    keywords: ['cloud build', 'cloud deploy', 'artifact registry', 'ci/cd', 'devops', 'release', 'code agent'],
  },

  // --- Multi-Cloud & Hybrid Ecosystem Components (AWS, Azure, Kubernetes, On-Prem) ---
  {
    id: 'aws_bedrock',
    tech: 'Amazon Bedrock',
    role: 'AWS Foundation Models',
    kind: 'ai',
    provider: 'aws',
    layer: 'model',
    usage: 'Managed serverless foundation models, Knowledge Bases, and Guardrails on AWS.',
    protocols: ['HTTPS', 'InvokeModel'],
    keywords: ['bedrock', 'aws', 'claude', 'llm', 'knowledge base', 'multi-cloud'],
  },
  {
    id: 'aws_eks_s3',
    tech: 'Amazon EKS & S3',
    role: 'AWS Workloads & Storage',
    kind: 'container',
    provider: 'aws',
    layer: 'orchestration',
    usage: 'AWS Kubernetes workloads and S3 object storage for cross-cloud data federation (BigQuery Omni) and hybrid meshes.',
    protocols: ['HTTPS', 'Cross-Cloud VPN'],
    keywords: ['eks', 's3', 'aws', 'amazon', 'kubernetes', 'bucket', 'multi-cloud'],
  },
  {
    id: 'azure_openai',
    tech: 'Azure OpenAI & AI Search',
    role: 'Azure AI & Search',
    kind: 'ai',
    provider: 'azure',
    layer: 'model',
    usage: 'Azure-hosted OpenAI models and hybrid vector search for Microsoft ecosystem workloads.',
    protocols: ['HTTPS', 'REST'],
    keywords: ['azure openai', 'ai search', 'ai foundry', 'azure', 'copilot', 'multi-cloud'],
  },
  {
    id: 'k8s_istio_vllm',
    tech: 'Istio & vLLM on Kubernetes',
    role: 'Service Mesh & Model Serving',
    kind: 'container',
    provider: 'k8s',
    layer: 'orchestration',
    usage: 'Cloud-native mTLS traffic management (Istio) and high-throughput open-weight LLM serving (vLLM / Ray) on Kubernetes.',
    protocols: ['mTLS', 'gRPC'],
    keywords: ['kubernetes', 'k8s', 'istio', 'service mesh', 'vllm', 'ray', 'kubeflow', 'argocd', 'prometheus'],
  },
  {
    id: 'onprem_erp_mainframe',
    tech: 'VMware vSphere & Core ERP',
    role: 'On-Premises Core Systems',
    kind: 'server',
    provider: 'onprem',
    layer: 'context',
    usage: 'Corporate data center ERP (SAP/Oracle), mainframe (z/OS), or factory edge systems connected via Cloud Interconnect and Apigee.',
    protocols: ['BGP / IPSec', 'RFC / JDBC'],
    keywords: ['on-prem', 'onprem', 'vmware', 'mainframe', 'erp', 'sap', 'data center', 'hybrid'],
  },
];

export const BLUEPRINT_CATALOG: BlueprintEntry[] = [
  {
    id: 'gcp-three-tier',
    title: 'Three-Tier Web App on Google Cloud',
    category: 'Architecture Framework · 6 Pillars & HA',
    agentCategory: 'architecture',
    icon: 'cloud',
    industries: ['E-Commerce', 'SaaS', 'Financial Services'],
    pillars: ['Security', 'Reliability', 'Performance', 'Cost Optimization', 'Operational Excellence', 'Sustainability'],
    summary: 'Resilient multi-zone web architecture using Cloud Armor WAF, Global Cloud Load Balancing, Cloud Run serverless services, Memorystore for Redis caching, and Cloud SQL HA.',
    dataflow: [
      'Edge: Customers → Cloud Armor (WAF/DDoS) → Cloud Load Balancing (Global Anycast HTTPS)',
      'Compute: Cloud Load Balancing → Cloud Run stateless microservice tier inside Production VPC',
      'Data & Cache: Cloud Run → Memorystore for Redis (hot reads) + Cloud SQL for PostgreSQL (multi-zone HA)',
    ],
    keywords: ['three-tier', 'web app', 'cloud run', 'cloud sql', 'memorystore', 'redis', 'cloud armor', 'load balancer', 'high availability', 'framework'],
    prompt: 'A three-tier web app on Google Cloud with Cloud Armor, Cloud Load Balancing, Cloud Run, Memorystore for Redis, Cloud SQL, and an Architecture Framework pillar table',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Three-Tier Web App on Google Cloud',
      subtitle: 'Google Cloud Architecture Framework · Multi-Zone High Availability',
      groups: [
        { id: 'gcp', label: 'Google Cloud (us-central1)', kind: 'region' },
        { id: 'vpc', label: 'Production VPC', kind: 'vpc', parent: 'gcp' },
      ],
      nodes: [
        { id: 'users', label: 'Customers', kind: 'user' },
        { id: 'armor', label: 'Edge Protection', kind: 'security', tech: 'Cloud Armor', provider: 'gcp', group: 'gcp' },
        { id: 'lb', label: 'Global Load Balancer', kind: 'loadbalancer', tech: 'Cloud Load Balancing', provider: 'gcp', group: 'gcp' },
        { id: 'api', label: 'App Service', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'vpc' },
        { id: 'cache', label: 'Session Cache', kind: 'cache', tech: 'Memorystore for Redis', provider: 'gcp', group: 'vpc' },
        { id: 'db', label: 'Transactional DB', kind: 'database', tech: 'Cloud SQL for PostgreSQL', provider: 'gcp', group: 'vpc' },
      ],
      edges: [
        { from: 'users', to: 'armor', label: 'HTTPS' },
        { from: 'armor', to: 'lb' },
        { from: 'lb', to: 'api', label: 'HTTP/2' },
        { from: 'api', to: 'cache', label: 'hot reads' },
        { from: 'api', to: 'db', label: 'SQL' },
      ],
      blocks: [
        {
          id: 'framework_pillars',
          kind: 'table',
          title: 'Architecture Framework Alignment',
          columns: ['Pillar', 'Service', 'Design Pattern'],
          rows: [
            ['Security', 'Cloud Armor & Cloud IAM', 'WAF, DDoS defense & least-privilege service accounts'],
            ['Reliability', 'Cloud Load Balancing & Cloud SQL HA', 'Anycast routing & regional synchronous failover'],
            ['Performance', 'Memorystore for Redis', 'Sub-millisecond session & hot-query caching'],
            ['Cost & Sustainability', 'Cloud Run', 'Serverless scale-to-zero & carbon-free region'],
            ['Operational Excellence', 'Cloud Monitoring & Cloud Trace', 'SLO alerting & distributed request tracing'],
          ],
        },
      ],
    },
  },
  {
    id: 'genai-rag-document-ai',
    title: 'Enterprise RAG & Document AI Blueprint',
    category: 'Gen AI Blueprint · Employee & Knowledge Agent',
    agentCategory: 'employee',
    icon: 'document_scanner',
    industries: ['Legal & Compliance', 'Healthcare & Clinical', 'Financial Services', 'HR & Internal IT'],
    pillars: ['Security', 'Performance', 'AI & ML Perspective'],
    summary: 'Five-layer enterprise RAG architecture: unstructured PDF ingestion via Cloud Storage & Document AI, vector indexing in AlloyDB (pgvector), and grounded generation with Gemini on Vertex AI.',
    dataflow: [
      'Layer 1 (Ingestion): Raw PDFs in Cloud Storage → Document AI layout/table parser → Vertex AI Embeddings',
      'Layer 2 (Context & Vector Store): Embeddings + metadata indexed in AlloyDB for PostgreSQL (pgvector / ScaNN)',
      'Layer 3 & 4 (Serving & Grounding): Employees → Cloud Run RAG API → hybrid vector search on AlloyDB → Gemini on Vertex AI cited answer',
    ],
    keywords: ['rag', 'retrieval augmented generation', 'document ai', 'employee agent', 'knowledge base', 'alloydb', 'pgvector', 'embeddings', 'pdf', 'search'],
    prompt: 'An enterprise RAG and document processing blueprint on Google Cloud with Cloud Storage, Document AI, Vertex AI Embeddings, AlloyDB pgvector, Cloud Run, and Gemini on Vertex AI',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Enterprise RAG & Document Processing',
      subtitle: 'Gen AI Technical Blueprint · Grounded Enterprise Search',
      groups: [
        { id: 'gcp', label: 'Google Cloud', kind: 'region' },
        { id: 'vpc', label: 'Application & Data VPC', kind: 'vpc', parent: 'gcp' },
      ],
      nodes: [
        { id: 'user', label: 'Enterprise Users', kind: 'user' },
        { id: 'app', label: 'RAG Assistant API', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'vpc' },
        { id: 'gemini', label: 'LLM Grounding', kind: 'ai', tech: 'Gemini on Vertex AI', provider: 'gcp', group: 'gcp' },
        { id: 'alloydb', label: 'Vector Store', kind: 'database', tech: 'AlloyDB (pgvector)', provider: 'gcp', group: 'vpc' },
        { id: 'gcs', label: 'Raw Documents', kind: 'storage', tech: 'Cloud Storage', provider: 'gcp', group: 'gcp' },
        { id: 'docai', label: 'Document Parser', kind: 'ai', tech: 'Document AI', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'user', to: 'app', label: 'HTTPS' },
        { from: 'app', to: 'alloydb', label: 'vector search' },
        { from: 'app', to: 'gemini', label: 'grounded prompt' },
        { from: 'gcs', to: 'docai', label: 'PDFs', style: 'dashed' },
        { from: 'docai', to: 'alloydb', label: 'embeddings', style: 'dashed' },
      ],
    },
  },
  {
    id: 'genai-multi-agent',
    title: 'Autonomous Multi-Agent Customer System',
    category: 'Gen AI Blueprint · Customer & Operations Agent',
    agentCategory: 'customer',
    icon: 'smart_toy',
    industries: ['Retail & E-Commerce', 'Telecommunications', 'Banking & Insurance', 'Travel & Hospitality'],
    pillars: ['Reliability', 'Security', 'Operational Excellence', 'AI & ML Perspective'],
    summary: 'Omnichannel customer agent architecture using Contact Center AI, Vertex AI Agent Builder, Gemini reasoning, Cloud Run action tools, Cloud SQL state, and BigQuery evaluation telemetry.',
    dataflow: [
      'Channel Layer: Customers connect via voice or chat to Contact Center AI (Speech-to-Text / Text-to-Speech)',
      'Agent Orchestration: Vertex AI Agent Builder coordinates specialized sub-agents and Gemini reasoning',
      'Action & Tool Execution: Agents invoke Cloud Run microservices backed by Cloud SQL for orders/refunds',
      'Observability & Evaluation: Conversation traces stream asynchronously to BigQuery for RAG Triad & CSAT evaluation',
    ],
    keywords: ['customer agent', 'multi-agent', 'contact center ai', 'ccai', 'agent builder', 'support agent', 'call center', 'omnichannel', 'dialogflow'],
    prompt: 'An autonomous multi-agent customer service architecture with Contact Center AI, Vertex AI Agent Builder, Gemini on Vertex AI, Model Armor, Cloud Run tools, Cloud SQL, and BigQuery',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Multi-Agent Customer Operations',
      subtitle: 'Gen AI Technical Blueprint · Agentic Orchestration & Safety',
      groups: [
        { id: 'gcp', label: 'Google Cloud', kind: 'region' },
        { id: 'agent_zone', label: 'Vertex AI Agent Platform', kind: 'zone', parent: 'gcp' },
      ],
      nodes: [
        { id: 'customer', label: 'Customers', kind: 'user' },
        { id: 'ccai', label: 'Contact Center', kind: 'ai', tech: 'Contact Center AI', provider: 'gcp', group: 'gcp' },
        { id: 'orchestrator', label: 'Agent Orchestrator', kind: 'ai', tech: 'Vertex AI Agent Builder', provider: 'gcp', group: 'agent_zone' },
        { id: 'gemini', label: 'Reasoning Model', kind: 'ai', tech: 'Gemini on Vertex AI', provider: 'gcp', group: 'agent_zone' },
        { id: 'tools', label: 'Order & Billing Tools', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'gcp' },
        { id: 'sql', label: 'Customer State', kind: 'database', tech: 'Cloud SQL', provider: 'gcp', group: 'gcp' },
        { id: 'bq', label: 'Conversation Analytics', kind: 'analytics', tech: 'BigQuery', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'customer', to: 'ccai', label: 'voice / chat' },
        { from: 'ccai', to: 'orchestrator', label: 'gRPC' },
        { from: 'orchestrator', to: 'gemini', label: 'plan & reason' },
        { from: 'orchestrator', to: 'tools', label: 'tool calls' },
        { from: 'tools', to: 'sql', label: 'SQL' },
        { from: 'orchestrator', to: 'bq', label: 'telemetry', style: 'dashed' },
      ],
    },
  },
  {
    id: 'data-analytics-lakehouse',
    title: 'Streaming Lakehouse & Data Agent',
    category: 'Architecture Center · Data Analytics & NL2SQL',
    agentCategory: 'data',
    icon: 'query_stats',
    industries: ['Financial Services', 'Supply Chain & Logistics', 'Retail', 'Media'],
    pillars: ['Performance', 'Cost Optimization', 'AI & ML Perspective'],
    summary: 'Real-time streaming ingestion (Pub/Sub, Datastream CDC, Dataflow) into BigQuery Enterprise Lakehouse with a Gemini NL2SQL Data Agent and Looker conversational BI.',
    dataflow: [
      'Streaming & CDC Ingestion: Pub/Sub event streams → Dataflow (Apache Beam) + Datastream CDC → BigQuery',
      'NL2SQL Reasoning: Gemini on Vertex AI maps natural-language business questions to governed BigQuery SQL schemas',
      'Visualization: Looker BI Engine serves real-time dashboards and conversational analytics',
    ],
    keywords: ['data agent', 'nl2sql', 'text to sql', 'bigquery', 'dataflow', 'datastream', 'pubsub', 'looker', 'lakehouse', 'streaming analytics'],
    prompt: 'A real-time streaming analytics lakehouse and NL2SQL data agent on Google Cloud with Pub/Sub, Datastream, Dataflow, BigQuery, Gemini on Vertex AI, and Looker',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Streaming Lakehouse & Conversational Analytics',
      subtitle: 'Architecture Center · Real-Time Ingestion, BigQuery & Data Agent',
      groups: [
        { id: 'gcp', label: 'Google Cloud Data Platform', kind: 'region' },
      ],
      nodes: [
        { id: 'events', label: 'Event Stream', kind: 'queue', tech: 'Pub/Sub', provider: 'gcp', group: 'gcp' },
        { id: 'cdc', label: 'Database CDC', kind: 'analytics', tech: 'Datastream', provider: 'gcp', group: 'gcp' },
        { id: 'dataflow', label: 'Stream Processing', kind: 'analytics', tech: 'Dataflow', provider: 'gcp', group: 'gcp' },
        { id: 'bq', label: 'Enterprise Lakehouse', kind: 'analytics', tech: 'BigQuery', provider: 'gcp', group: 'gcp' },
        { id: 'data_agent', label: 'NL2SQL Data Agent', kind: 'ai', tech: 'Gemini on Vertex AI', provider: 'gcp', group: 'gcp' },
        { id: 'looker', label: 'BI & Dashboards', kind: 'analytics', tech: 'Looker', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'events', to: 'dataflow', label: 'streams' },
        { from: 'cdc', to: 'bq', label: 'CDC', style: 'dashed' },
        { from: 'dataflow', to: 'bq', label: 'Storage Write API' },
        { from: 'bq', to: 'data_agent', label: 'schema & SQL' },
        { from: 'bq', to: 'looker', label: 'BI Engine' },
      ],
    },
  },
  {
    id: 'hybrid-multicloud-k8s',
    title: 'Hybrid & Multi-Cloud Zero-Trust Mesh',
    category: 'Architecture Center · GCP, AWS, K8s & On-Prem',
    agentCategory: 'architecture',
    icon: 'lan',
    industries: ['Banking', 'Manufacturing', 'Public Sector', 'Enterprise IT'],
    pillars: ['Security', 'Reliability', 'Operational Excellence'],
    summary: 'Cross-cloud and hybrid architecture linking an On-Premises VMware ERP via Cloud Interconnect and Identity-Aware Proxy to Google Cloud GKE, AlloyDB, and Amazon EKS.',
    dataflow: [
      'Hybrid Connectivity: Corporate Data Center (VMware vSphere) connects over dedicated Cloud Interconnect to Google Cloud Shared VPC',
      'Zero-Trust Access: Identity-Aware Proxy enforces context-aware access to GKE workloads',
      'Multi-Cloud Federation: GKE communicates over encrypted Cross-Cloud VPN with Amazon EKS partner services',
    ],
    keywords: ['hybrid', 'multi-cloud', 'zero trust', 'gke', 'eks', 'aws', 'on-prem', 'interconnect', 'iap', 'kubernetes', 'service mesh'],
    prompt: 'A hybrid and multi-cloud zero-trust architecture connecting On-Premises via Cloud Interconnect to Google Cloud GKE and AWS EKS',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Hybrid & Multi-Cloud Zero-Trust Architecture',
      subtitle: 'On-Premises, Google Cloud GKE & AWS Cross-Cloud Interconnect',
      groups: [
        { id: 'onprem_dc', label: 'Corporate Data Center', kind: 'boundary' },
        { id: 'gcp', label: 'Google Cloud Shared VPC', kind: 'vpc' },
        { id: 'aws_cloud', label: 'AWS Region', kind: 'region' },
      ],
      nodes: [
        { id: 'corp', label: 'Core ERP', kind: 'server', tech: 'VMware vSphere', provider: 'onprem', group: 'onprem_dc' },
        { id: 'interconnect', label: 'Hybrid Link', kind: 'network', tech: 'Cloud Interconnect', provider: 'gcp', group: 'gcp' },
        { id: 'iap', label: 'Zero-Trust Access', kind: 'security', tech: 'Identity-Aware Proxy', provider: 'gcp', group: 'gcp' },
        { id: 'gke', label: 'App Mesh', kind: 'container', tech: 'Google Kubernetes Engine', provider: 'gcp', group: 'gcp' },
        { id: 'alloy', label: 'Primary DB', kind: 'database', tech: 'AlloyDB for PostgreSQL', provider: 'gcp', group: 'gcp' },
        { id: 'eks', label: 'Partner Workloads', kind: 'container', tech: 'Amazon EKS', provider: 'aws', group: 'aws_cloud' },
      ],
      edges: [
        { from: 'corp', to: 'interconnect', label: 'BGP / IPSec' },
        { from: 'interconnect', to: 'gke', label: 'mTLS' },
        { from: 'iap', to: 'gke', label: 'Zero Trust' },
        { from: 'gke', to: 'alloy', label: 'SQL' },
        { from: 'gke', to: 'eks', label: 'Cross-Cloud VPN', style: 'dashed' },
      ],
    },
  },
  {
    id: 'signup-flowchart',
    title: 'AI-Assisted CI/CD & Release Flow',
    category: 'Flowchart · Code & DevOps Agent',
    agentCategory: 'code',
    icon: 'flowchart',
    industries: ['Software Engineering', 'DevOps & SRE'],
    pillars: ['Operational Excellence', 'Security', 'AI & ML Perspective'],
    summary: 'Automated software delivery workflow combining Gemini Code Assist PR analysis, Cloud Build testing, policy/vulnerability gating, and Cloud Deploy canary rollout.',
    dataflow: [
      'PR Review: Developer opens PR → Gemini Code Assist reviews code & suggests unit tests',
      'Build & Gate: Cloud Build executes tests and vulnerability scans → Decision gate checks security policy',
      'Rollout or Remediate: Passing builds roll out via Cloud Deploy; failing builds receive AI remediation suggestions',
    ],
    keywords: ['code agent', 'ci/cd', 'devops', 'flowchart', 'cloud build', 'cloud deploy', 'gemini code assist', 'release pipeline'],
    prompt: 'A flowchart for an AI-assisted software release pipeline with Gemini Code Assist review, Cloud Build tests, security scan decision, and Cloud Deploy rollout',
    diagram: {
      diagram_type: 'flowchart',
      direction: 'TB',
      title: 'AI-Assisted CI/CD & Release Pipeline',
      nodes: [
        { id: 'start', label: 'Pull request opened', kind: 'start' },
        { id: 'review', label: 'Review with Gemini Code Assist', kind: 'process' },
        { id: 'build', label: 'Run Cloud Build & unit tests', kind: 'process' },
        { id: 'passed', label: 'Security & policy checks pass?', kind: 'decision' },
        { id: 'deploy', label: 'Canary rollout via Cloud Deploy', kind: 'process' },
        { id: 'remediate', label: 'Suggest fix & update PR', kind: 'io' },
        { id: 'done', label: 'Release live in production', kind: 'end' },
      ],
      edges: [
        { from: 'start', to: 'review' },
        { from: 'review', to: 'build' },
        { from: 'build', to: 'passed' },
        { from: 'passed', to: 'deploy', label: 'Yes' },
        { from: 'passed', to: 'remediate', label: 'No' },
        { from: 'remediate', to: 'build', style: 'dashed' },
        { from: 'deploy', to: 'done' },
      ],
    },
  },
  {
    id: 'genai-creative-commerce',
    title: 'Personalized Commerce & Creative Studio',
    category: 'Gen AI Blueprint · Creative & Commerce Agent',
    agentCategory: 'creative',
    icon: 'shopping_cart',
    industries: ['Retail & E-Commerce', 'Media & Advertising', 'Consumer Goods'],
    pillars: ['Performance', 'Cost Optimization', 'AI & ML Perspective'],
    summary: 'Retail & marketing blueprint combining Vertex AI Search for Commerce, Gemini + Imagen/Veo creative asset generation, Cloud Storage media catalog, and BigQuery audience segmentation.',
    dataflow: [
      'Storefront & Edge: Shoppers → Cloud CDN → Cloud Run Commerce Storefront',
      'Discovery: Storefront queries Vertex AI Search for Commerce for personalized semantic & visual product discovery',
      'Creative Studio: Marketing teams generate localized campaign visuals and copy with Gemini & Imagen on Vertex AI stored in Cloud Storage',
    ],
    keywords: ['creative agent', 'commerce', 'retail', 'shopping', 'imagen', 'veo', 'marketing', 'personalization', 'recommendations'],
    prompt: 'A personalized commerce and creative agent architecture with Cloud CDN, Cloud Run Storefront, Vertex AI Search for Commerce, Gemini and Imagen on Vertex AI, Cloud Storage, and BigQuery',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Personalized Commerce & Creative AI Studio',
      subtitle: 'Gen AI Technical Blueprint · Creative & Commerce Agents',
      groups: [
        { id: 'gcp', label: 'Google Cloud Retail Platform', kind: 'region' },
      ],
      nodes: [
        { id: 'shopper', label: 'Shoppers', kind: 'user' },
        { id: 'cdn', label: 'Edge Delivery', kind: 'gateway', tech: 'Cloud CDN', provider: 'gcp', group: 'gcp' },
        { id: 'storefront', label: 'Commerce API', kind: 'service', tech: 'Cloud Run', provider: 'gcp', group: 'gcp' },
        { id: 'commerce_search', label: 'Product Discovery', kind: 'ai', tech: 'Vertex AI Search', provider: 'gcp', group: 'gcp' },
        { id: 'creative_ai', label: 'Campaign Studio', kind: 'ai', tech: 'Gemini & Imagen on Vertex AI', provider: 'gcp', group: 'gcp' },
        { id: 'media', label: 'Asset Catalog', kind: 'storage', tech: 'Cloud Storage', provider: 'gcp', group: 'gcp' },
        { id: 'bq', label: 'Customer 360', kind: 'analytics', tech: 'BigQuery', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'shopper', to: 'cdn', label: 'HTTPS' },
        { from: 'cdn', to: 'storefront' },
        { from: 'storefront', to: 'commerce_search', label: 'semantic search' },
        { from: 'storefront', to: 'creative_ai', label: 'personalized copy' },
        { from: 'creative_ai', to: 'media', label: 'generated assets', style: 'dashed' },
        { from: 'storefront', to: 'bq', label: 'clickstream', style: 'dashed' },
      ],
    },
  },
  {
    id: 'genai-secops-agent',
    title: 'Autonomous SecOps & Threat Triage Agent',
    category: 'Gen AI Blueprint · Security & SecOps Agent',
    agentCategory: 'security',
    icon: 'security',
    industries: ['Cybersecurity', 'Financial Services', 'Public Sector', 'Cloud Operations'],
    pillars: ['Security', 'Operational Excellence', 'Reliability'],
    summary: 'Real-time security operations blueprint streaming cloud audit logs and multi-cloud telemetry into Google Security Operations (Chronicle) with Gemini threat-hunting agents and automated Cloud Run remediation playbooks.',
    dataflow: [
      'Telemetry Ingestion: Multi-cloud logs & Security Command Center findings stream via Pub/Sub into Google Security Operations (SIEM)',
      'AI Threat Triage: Gemini in Security correlates alerts, summarizes attack paths, and drafts YARA-L detection rules',
      'Auto-Remediation: Workflows triggers Cloud Run containment functions to isolate compromised workloads via Cloud IAM',
    ],
    keywords: ['security agent', 'secops', 'chronicle', 'siem', 'soar', 'threat detection', 'security command center', 'incident response', 'triage'],
    prompt: 'An autonomous SecOps and threat triage agent architecture with Pub/Sub telemetry, Security Command Center, Google Security Operations, Gemini on Vertex AI, Workflows, and Cloud Run auto-remediation',
    diagram: {
      diagram_type: 'architecture',
      direction: 'LR',
      title: 'Autonomous SecOps & Threat Triage',
      subtitle: 'Gen AI Technical Blueprint · Security Operations Agent',
      groups: [
        { id: 'gcp', label: 'Google Cloud Security Operations', kind: 'region' },
      ],
      nodes: [
        { id: 'analyst', label: 'SOC Analysts', kind: 'user' },
        { id: 'telemetry', label: 'Log Stream', kind: 'queue', tech: 'Pub/Sub', provider: 'gcp', group: 'gcp' },
        { id: 'scc', label: 'Posture Findings', kind: 'security', tech: 'Security Command Center', provider: 'gcp', group: 'gcp' },
        { id: 'secops', label: 'SIEM & Threat Intel', kind: 'security', tech: 'Google Security Operations', provider: 'gcp', group: 'gcp' },
        { id: 'sec_agent', label: 'Threat Triage Agent', kind: 'ai', tech: 'Gemini on Vertex AI', provider: 'gcp', group: 'gcp' },
        { id: 'playbook', label: 'Response Playbook', kind: 'queue', tech: 'Workflows', provider: 'gcp', group: 'gcp' },
        { id: 'remediate', label: 'Workload Isolation', kind: 'function', tech: 'Cloud Run functions', provider: 'gcp', group: 'gcp' },
      ],
      edges: [
        { from: 'telemetry', to: 'secops', label: 'logs & events', style: 'dashed' },
        { from: 'scc', to: 'secops', label: 'findings', style: 'dashed' },
        { from: 'analyst', to: 'secops', label: 'investigates' },
        { from: 'secops', to: 'sec_agent', label: 'correlate & summarize' },
        { from: 'sec_agent', to: 'playbook', label: 'triggers' },
        { from: 'playbook', to: 'remediate', label: 'isolate IAM / VPC' },
      ],
    },
  },
];

let genAi101: Promise<BlueprintEntry[]> | null = null;

/**
 * Adds the 101 Gen AI blueprints (genAiBlueprints101.ts, about a third of a
 * megabyte) to BLUEPRINT_CATALOG on first use, so they stay out of the main
 * bundle. Until it resolves, the searches see only the blueprints above.
 */
export function loadAllBlueprints(): Promise<BlueprintEntry[]> {
  genAi101 ??= import('./genAiBlueprints101').then(
    ({ GEN_AI_101_BLUEPRINTS }) => {
      BLUEPRINT_CATALOG.push(...GEN_AI_101_BLUEPRINTS);
      return GEN_AI_101_BLUEPRINTS;
    },
    (e: unknown) => {
      genAi101 = null; // try again next time (e.g. the chunk failed to download)
      throw e;
    },
  );
  return genAi101;
}

function tokenize(q: string): string[] {
  return q
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9+/]+/)
    .filter((w) => w.length >= 2 || /^\d+$/.test(w));
}

/** Scores a component against a natural-language query or filter. */
function scoreComponent(c: ComponentEntry, tokens: string[], rawNorm: string): number {
  if (tokens.length === 0) return 1;
  let score = 0;
  const techNorm = normalize(c.tech);
  const roleNorm = normalize(c.role);
  const usageLower = c.usage.toLowerCase();
  const kwJoined = c.keywords.join(' ').toLowerCase();

  if (rawNorm.length >= 3 && (techNorm.includes(rawNorm) || roleNorm.includes(rawNorm))) {
    score += 12;
  }
  for (const t of tokens) {
    const tn = normalize(t);
    if (!tn) continue;
    if (techNorm === tn || c.id === tn) score += 10;
    else if (techNorm.includes(tn)) score += 6;
    if (roleNorm.includes(tn)) score += 5;
    if (c.keywords.some((k) => normalize(k) === tn)) score += 6;
    else if (kwJoined.includes(t)) score += 3;
    if (usageLower.includes(t)) score += 2;
    if (c.kind === tn || c.provider === tn || c.layer === tn) score += 4;
  }
  return score;
}

/** Scores a blueprint against a natural-language query. */
function scoreBlueprint(b: BlueprintEntry, tokens: string[], rawNorm: string): number {
  if (tokens.length === 0) return 1;
  let score = 0;
  const titleNorm = normalize(b.title);
  const catNorm = normalize(b.category);
  const summaryLower = b.summary.toLowerCase();
  const kwJoined = [...b.keywords, ...b.industries, ...b.pillars].join(' ').toLowerCase();
  const techJoined = (b.diagram.nodes ?? []).map((n) => `${n.label} ${n.tech ?? ''}`).join(' ').toLowerCase();

  if (rawNorm.length >= 3 && (titleNorm.includes(rawNorm) || catNorm.includes(rawNorm))) {
    score += 12;
  }
  for (const t of tokens) {
    const tn = normalize(t);
    if (!tn) continue;
    if (b.id === `genai-bp-${tn}` || b.id === tn) score += 20;
    if (b.agentCategory === tn) score += 8;
    if (titleNorm.includes(tn)) score += 6;
    if (b.keywords.some((k) => normalize(k) === tn)) score += 6;
    else if (kwJoined.includes(t)) score += 4;
    if (techJoined.includes(t)) score += 3;
    if (summaryLower.includes(t)) score += 2;
  }
  return score;
}

export function searchComponents(
  query = '',
  opts: { provider?: string; layer?: string; kind?: string; limit?: number } = {},
): ComponentEntry[] {
  const tokens = tokenize(query);
  const rawNorm = normalize(query);
  const prov = opts.provider?.toLowerCase().trim();
  const layer = opts.layer?.toLowerCase().trim();
  const kind = opts.kind?.toLowerCase().trim();
  const limit = opts.limit ?? 20;

  return COMPONENT_CATALOG
    .filter((c) => (!prov || c.provider === prov) && (!layer || c.layer === layer) && (!kind || c.kind === kind))
    .map((c) => ({ c, s: scoreComponent(c, tokens, rawNorm) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}

export function searchBlueprints(
  query = '',
  opts: { category?: string; limit?: number } = {},
): BlueprintEntry[] {
  const tokens = tokenize(query);
  const rawNorm = normalize(query);
  const cat = opts.category?.toLowerCase().trim();
  const limit = opts.limit ?? 8;

  return BLUEPRINT_CATALOG
    .filter((b) => !cat || b.agentCategory === cat || normalize(b.category).includes(normalize(cat)))
    .map((b) => ({ b, s: scoreBlueprint(b, tokens, rawNorm) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.b);
}

/**
 * Formats retrieved blueprints and components as compact, grounded RAG context
 * for the voice/text agent (`search_catalog` tool response).
 */
export function retrieveCatalogContext(
  query: string,
  opts: { provider?: string; category?: string; limit?: number } = {},
): {
  blueprints: {
    id: string;
    title: string;
    agent_category: string;
    pillars: string[];
    summary: string;
    dataflow: string[];
    nodes: { id?: string; label: string; kind?: string; tech?: string; provider?: string; group?: string }[];
    edges: { from: string; to: string; label?: string; style?: string }[];
  }[];
  components: {
    tech: string;
    recommended_label: string;
    kind: NodeKind;
    provider?: Provider;
    layer: string;
    usage: string;
    protocols: string[];
  }[];
} {
  const blueprints = searchBlueprints(query, { category: opts.category, limit: Math.min(opts.limit ?? 4, 6) });
  const components = searchComponents(query, { provider: opts.provider, limit: Math.min(opts.limit ?? 10, 20) });

  return {
    blueprints: blueprints.map((b) => ({
      id: b.id,
      title: b.title,
      agent_category: AGENT_CATEGORY_LABELS[b.agentCategory],
      pillars: b.pillars,
      summary: b.summary,
      dataflow: b.dataflow,
      nodes: (b.diagram.nodes ?? []).map((n) => ({
        id: n.id,
        label: n.label,
        kind: n.kind,
        tech: n.tech,
        provider: n.provider,
        group: n.group,
      })),
      edges: (b.diagram.edges ?? []).map((e) => ({
        from: e.from,
        to: e.to,
        ...(e.label ? { label: e.label } : {}),
        ...(e.style ? { style: e.style } : {}),
      })),
    })),
    components: components.map((c) => ({
      tech: c.tech,
      recommended_label: c.role,
      kind: c.kind,
      provider: c.provider,
      layer: LAYER_LABELS[c.layer],
      usage: c.usage,
      protocols: c.protocols,
    })),
  };
}
