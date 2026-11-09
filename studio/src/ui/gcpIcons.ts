/**
 * Official Google Cloud Architecture & Product SVG Icons downloaded from:
 * https://cloud.google.com/icons?hl=en
 * - Core Products Icons (core-products-icons.zip: 19 official 512px full-color RGB SVGs)
 * - Category Icons (category-icons.zip: 26 official 512px full-color RGB SVGs)
 * - Product Icons (google-cloud-legacy-icons.zip: 216 official 24px full-color product SVGs)
 */
import { normalize } from "../engine/resolve";
import type { DNode, NodeKind } from "../engine/types";

export type GcpIconGroup = "core" | "category" | "products";

export interface GcpIconEntry {
  id: string;
  title: string;
  group: GcpIconGroup;
  url: string;
  kind: NodeKind;
}

export const GCP_CORE_ICONS: GcpIconEntry[] = [
  {
    "id": "ai_hypercomputer",
    "title": "AI Hypercomputer",
    "group": "core",
    "url": "/gcp-icons/core/ai_hypercomputer.svg",
    "kind": "ai"
  },
  {
    "id": "alloydb",
    "title": "AlloyDB",
    "group": "core",
    "url": "/gcp-icons/core/alloydb.svg",
    "kind": "database"
  },
  {
    "id": "anthos",
    "title": "Anthos",
    "group": "core",
    "url": "/gcp-icons/core/anthos.svg",
    "kind": "container"
  },
  {
    "id": "apigee",
    "title": "Apigee",
    "group": "core",
    "url": "/gcp-icons/core/apigee.svg",
    "kind": "gateway"
  },
  {
    "id": "bigquery",
    "title": "BigQuery",
    "group": "core",
    "url": "/gcp-icons/core/bigquery.svg",
    "kind": "analytics"
  },
  {
    "id": "cloud_run",
    "title": "Cloud Run",
    "group": "core",
    "url": "/gcp-icons/core/cloud_run.svg",
    "kind": "service"
  },
  {
    "id": "cloud_spanner",
    "title": "Cloud Spanner",
    "group": "core",
    "url": "/gcp-icons/core/cloud_spanner.svg",
    "kind": "database"
  },
  {
    "id": "cloud_sql",
    "title": "Cloud SQL",
    "group": "core",
    "url": "/gcp-icons/core/cloud_sql.svg",
    "kind": "database"
  },
  {
    "id": "cloud_storage",
    "title": "Cloud Storage",
    "group": "core",
    "url": "/gcp-icons/core/cloud_storage.svg",
    "kind": "storage"
  },
  {
    "id": "compute_engine",
    "title": "Compute Engine",
    "group": "core",
    "url": "/gcp-icons/core/compute_engine.svg",
    "kind": "server"
  },
  {
    "id": "distributed_cloud",
    "title": "Distributed Cloud",
    "group": "core",
    "url": "/gcp-icons/core/distributed_cloud.svg",
    "kind": "service"
  },
  {
    "id": "gke",
    "title": "GKE",
    "group": "core",
    "url": "/gcp-icons/core/gke.svg",
    "kind": "container"
  },
  {
    "id": "hyperdisk",
    "title": "Hyperdisk",
    "group": "core",
    "url": "/gcp-icons/core/hyperdisk.svg",
    "kind": "storage"
  },
  {
    "id": "looker",
    "title": "Looker",
    "group": "core",
    "url": "/gcp-icons/core/looker.svg",
    "kind": "analytics"
  },
  {
    "id": "mandiant",
    "title": "Mandiant",
    "group": "core",
    "url": "/gcp-icons/core/mandiant.svg",
    "kind": "security"
  },
  {
    "id": "security_command_center",
    "title": "Security Command Center",
    "group": "core",
    "url": "/gcp-icons/core/security_command_center.svg",
    "kind": "security"
  },
  {
    "id": "security_operations",
    "title": "Security Operations",
    "group": "core",
    "url": "/gcp-icons/core/security_operations.svg",
    "kind": "security"
  },
  {
    "id": "threat_intelligence",
    "title": "Threat Intelligence",
    "group": "core",
    "url": "/gcp-icons/core/threat_intelligence.svg",
    "kind": "security"
  },
  {
    "id": "vertex_ai",
    "title": "Vertex AI",
    "group": "core",
    "url": "/gcp-icons/core/vertex_ai.svg",
    "kind": "ai"
  }
];

export const GCP_CATEGORY_ICONS: GcpIconEntry[] = [
  {
    "id": "agents",
    "title": "Agents",
    "group": "category",
    "url": "/gcp-icons/category/agents.svg",
    "kind": "ai"
  },
  {
    "id": "ai_and_machine_learning",
    "title": "AI & Machine Learning",
    "group": "category",
    "url": "/gcp-icons/category/ai_and_machine_learning.svg",
    "kind": "ai"
  },
  {
    "id": "business_intelligence",
    "title": "Business Intelligence",
    "group": "category",
    "url": "/gcp-icons/category/business_intelligence.svg",
    "kind": "service"
  },
  {
    "id": "collaboration",
    "title": "Collaboration",
    "group": "category",
    "url": "/gcp-icons/category/collaboration.svg",
    "kind": "service"
  },
  {
    "id": "compute",
    "title": "Compute",
    "group": "category",
    "url": "/gcp-icons/category/compute.svg",
    "kind": "service"
  },
  {
    "id": "containers",
    "title": "Containers",
    "group": "category",
    "url": "/gcp-icons/category/containers.svg",
    "kind": "ai"
  },
  {
    "id": "data_analytics",
    "title": "Data Analytics",
    "group": "category",
    "url": "/gcp-icons/category/data_analytics.svg",
    "kind": "analytics"
  },
  {
    "id": "databases",
    "title": "Databases",
    "group": "category",
    "url": "/gcp-icons/category/databases.svg",
    "kind": "database"
  },
  {
    "id": "developer_tools",
    "title": "Developer Tools",
    "group": "category",
    "url": "/gcp-icons/category/developer_tools.svg",
    "kind": "service"
  },
  {
    "id": "devops",
    "title": "DevOps",
    "group": "category",
    "url": "/gcp-icons/category/devops.svg",
    "kind": "service"
  },
  {
    "id": "hybrid_and_multicloud",
    "title": "Hybrid & Multicloud",
    "group": "category",
    "url": "/gcp-icons/category/hybrid_and_multicloud.svg",
    "kind": "service"
  },
  {
    "id": "integration_services",
    "title": "Integration Services",
    "group": "category",
    "url": "/gcp-icons/category/integration_services.svg",
    "kind": "queue"
  },
  {
    "id": "management_tools",
    "title": "Management Tools",
    "group": "category",
    "url": "/gcp-icons/category/management_tools.svg",
    "kind": "service"
  },
  {
    "id": "maps_and_geospatial",
    "title": "Maps & Geospatial",
    "group": "category",
    "url": "/gcp-icons/category/maps_and_geospatial.svg",
    "kind": "service"
  },
  {
    "id": "marketplace",
    "title": "Marketplace",
    "group": "category",
    "url": "/gcp-icons/category/marketplace.svg",
    "kind": "service"
  },
  {
    "id": "media_services",
    "title": "Media Services",
    "group": "category",
    "url": "/gcp-icons/category/media_services.svg",
    "kind": "service"
  },
  {
    "id": "migration",
    "title": "Migration",
    "group": "category",
    "url": "/gcp-icons/category/migration.svg",
    "kind": "service"
  },
  {
    "id": "mixed_reality",
    "title": "Mixed Reality",
    "group": "category",
    "url": "/gcp-icons/category/mixed_reality.svg",
    "kind": "service"
  },
  {
    "id": "networking",
    "title": "Networking",
    "group": "category",
    "url": "/gcp-icons/category/networking.svg",
    "kind": "network"
  },
  {
    "id": "observability",
    "title": "Observability",
    "group": "category",
    "url": "/gcp-icons/category/observability.svg",
    "kind": "service"
  },
  {
    "id": "operations",
    "title": "Operations",
    "group": "category",
    "url": "/gcp-icons/category/operations.svg",
    "kind": "service"
  },
  {
    "id": "security_and_identity",
    "title": "Security & Identity",
    "group": "category",
    "url": "/gcp-icons/category/security_and_identity.svg",
    "kind": "security"
  },
  {
    "id": "serverless_computing",
    "title": "Serverless Computing",
    "group": "category",
    "url": "/gcp-icons/category/serverless_computing.svg",
    "kind": "service"
  },
  {
    "id": "storage",
    "title": "Storage",
    "group": "category",
    "url": "/gcp-icons/category/storage.svg",
    "kind": "storage"
  },
  {
    "id": "web_and_mobile",
    "title": "Web & Mobile",
    "group": "category",
    "url": "/gcp-icons/category/web_and_mobile.svg",
    "kind": "service"
  },
  {
    "id": "web3",
    "title": "Web3",
    "group": "category",
    "url": "/gcp-icons/category/web3.svg",
    "kind": "service"
  }
];

export const GCP_PRODUCT_ICONS: GcpIconEntry[] = [
  {
    "id": "access_context_manager",
    "title": "Access Context Manager",
    "group": "products",
    "url": "/gcp-icons/products/access_context_manager.svg",
    "kind": "security"
  },
  {
    "id": "administration",
    "title": "Administration",
    "group": "products",
    "url": "/gcp-icons/products/administration.svg",
    "kind": "service"
  },
  {
    "id": "advanced_agent_modeling",
    "title": "Advanced Agent Modeling",
    "group": "products",
    "url": "/gcp-icons/products/advanced_agent_modeling.svg",
    "kind": "ai"
  },
  {
    "id": "advanced_solutions_lab",
    "title": "Advanced Solutions Lab",
    "group": "products",
    "url": "/gcp-icons/products/advanced_solutions_lab.svg",
    "kind": "service"
  },
  {
    "id": "agent_assist",
    "title": "Agent Assist",
    "group": "products",
    "url": "/gcp-icons/products/agent_assist.svg",
    "kind": "ai"
  },
  {
    "id": "ai_hub",
    "title": "AI Hub",
    "group": "products",
    "url": "/gcp-icons/products/ai_hub.svg",
    "kind": "ai"
  },
  {
    "id": "ai_platform",
    "title": "AI Platform",
    "group": "products",
    "url": "/gcp-icons/products/ai_platform.svg",
    "kind": "ai"
  },
  {
    "id": "ai_platform_unified",
    "title": "AI Platform Unified",
    "group": "products",
    "url": "/gcp-icons/products/ai_platform_unified.svg",
    "kind": "ai"
  },
  {
    "id": "analytics_hub",
    "title": "Analytics Hub",
    "group": "products",
    "url": "/gcp-icons/products/analytics_hub.svg",
    "kind": "analytics"
  },
  {
    "id": "anthos",
    "title": "Anthos",
    "group": "products",
    "url": "/gcp-icons/products/anthos.svg",
    "kind": "container"
  },
  {
    "id": "anthos_config_management",
    "title": "Anthos Config Management",
    "group": "products",
    "url": "/gcp-icons/products/anthos_config_management.svg",
    "kind": "container"
  },
  {
    "id": "anthos_service_mesh",
    "title": "Anthos Service Mesh",
    "group": "products",
    "url": "/gcp-icons/products/anthos_service_mesh.svg",
    "kind": "container"
  },
  {
    "id": "api",
    "title": "API",
    "group": "products",
    "url": "/gcp-icons/products/api.svg",
    "kind": "service"
  },
  {
    "id": "api_analytics",
    "title": "API Analytics",
    "group": "products",
    "url": "/gcp-icons/products/api_analytics.svg",
    "kind": "analytics"
  },
  {
    "id": "api_monetization",
    "title": "API Monetization",
    "group": "products",
    "url": "/gcp-icons/products/api_monetization.svg",
    "kind": "gateway"
  },
  {
    "id": "apigee_api_platform",
    "title": "Apigee API Platform",
    "group": "products",
    "url": "/gcp-icons/products/apigee_api_platform.svg",
    "kind": "gateway"
  },
  {
    "id": "apigee_sense",
    "title": "Apigee Sense",
    "group": "products",
    "url": "/gcp-icons/products/apigee_sense.svg",
    "kind": "gateway"
  },
  {
    "id": "app_engine",
    "title": "App Engine",
    "group": "products",
    "url": "/gcp-icons/products/app_engine.svg",
    "kind": "service"
  },
  {
    "id": "artifact_registry",
    "title": "Artifact Registry",
    "group": "products",
    "url": "/gcp-icons/products/artifact_registry.svg",
    "kind": "service"
  },
  {
    "id": "asset_inventory",
    "title": "Asset Inventory",
    "group": "products",
    "url": "/gcp-icons/products/asset_inventory.svg",
    "kind": "service"
  },
  {
    "id": "assured_workloads",
    "title": "Assured Workloads",
    "group": "products",
    "url": "/gcp-icons/products/assured_workloads.svg",
    "kind": "security"
  },
  {
    "id": "automl",
    "title": "Automl",
    "group": "products",
    "url": "/gcp-icons/products/automl.svg",
    "kind": "ai"
  },
  {
    "id": "automl_natural_language",
    "title": "Automl Natural Language",
    "group": "products",
    "url": "/gcp-icons/products/automl_natural_language.svg",
    "kind": "ai"
  },
  {
    "id": "automl_tables",
    "title": "Automl Tables",
    "group": "products",
    "url": "/gcp-icons/products/automl_tables.svg",
    "kind": "ai"
  },
  {
    "id": "automl_translation",
    "title": "Automl Translation",
    "group": "products",
    "url": "/gcp-icons/products/automl_translation.svg",
    "kind": "ai"
  },
  {
    "id": "automl_video_intelligence",
    "title": "Automl Video Intelligence",
    "group": "products",
    "url": "/gcp-icons/products/automl_video_intelligence.svg",
    "kind": "ai"
  },
  {
    "id": "automl_vision",
    "title": "Automl Vision",
    "group": "products",
    "url": "/gcp-icons/products/automl_vision.svg",
    "kind": "ai"
  },
  {
    "id": "bare_metal_solutions",
    "title": "Bare Metal Solutions",
    "group": "products",
    "url": "/gcp-icons/products/bare_metal_solutions.svg",
    "kind": "server"
  },
  {
    "id": "batch",
    "title": "Batch",
    "group": "products",
    "url": "/gcp-icons/products/batch.svg",
    "kind": "service"
  },
  {
    "id": "beyondcorp",
    "title": "Beyondcorp",
    "group": "products",
    "url": "/gcp-icons/products/beyondcorp.svg",
    "kind": "security"
  },
  {
    "id": "bigquery",
    "title": "Bigquery",
    "group": "products",
    "url": "/gcp-icons/products/bigquery.svg",
    "kind": "analytics"
  },
  {
    "id": "bigtable",
    "title": "Bigtable",
    "group": "products",
    "url": "/gcp-icons/products/bigtable.svg",
    "kind": "database"
  },
  {
    "id": "billing",
    "title": "Billing",
    "group": "products",
    "url": "/gcp-icons/products/billing.svg",
    "kind": "service"
  },
  {
    "id": "binary_authorization",
    "title": "Binary Authorization",
    "group": "products",
    "url": "/gcp-icons/products/binary_authorization.svg",
    "kind": "security"
  },
  {
    "id": "catalog",
    "title": "Catalog",
    "group": "products",
    "url": "/gcp-icons/products/catalog.svg",
    "kind": "service"
  },
  {
    "id": "certificate_authority_service",
    "title": "Certificate Authority Service",
    "group": "products",
    "url": "/gcp-icons/products/certificate_authority_service.svg",
    "kind": "security"
  },
  {
    "id": "certificate_manager",
    "title": "Certificate Manager",
    "group": "products",
    "url": "/gcp-icons/products/certificate_manager.svg",
    "kind": "security"
  },
  {
    "id": "cloud_api_gateway",
    "title": "Cloud API Gateway",
    "group": "products",
    "url": "/gcp-icons/products/cloud_api_gateway.svg",
    "kind": "gateway"
  },
  {
    "id": "cloud_apis",
    "title": "Cloud Apis",
    "group": "products",
    "url": "/gcp-icons/products/cloud_apis.svg",
    "kind": "service"
  },
  {
    "id": "cloud_armor",
    "title": "Cloud Armor",
    "group": "products",
    "url": "/gcp-icons/products/cloud_armor.svg",
    "kind": "security"
  },
  {
    "id": "cloud_asset_inventory",
    "title": "Cloud Asset Inventory",
    "group": "products",
    "url": "/gcp-icons/products/cloud_asset_inventory.svg",
    "kind": "service"
  },
  {
    "id": "cloud_audit_logs",
    "title": "Cloud Audit Logs",
    "group": "products",
    "url": "/gcp-icons/products/cloud_audit_logs.svg",
    "kind": "service"
  },
  {
    "id": "cloud_build",
    "title": "Cloud Build",
    "group": "products",
    "url": "/gcp-icons/products/cloud_build.svg",
    "kind": "service"
  },
  {
    "id": "cloud_cdn",
    "title": "Cloud CDN",
    "group": "products",
    "url": "/gcp-icons/products/cloud_cdn.svg",
    "kind": "gateway"
  },
  {
    "id": "cloud_code",
    "title": "Cloud Code",
    "group": "products",
    "url": "/gcp-icons/products/cloud_code.svg",
    "kind": "service"
  },
  {
    "id": "cloud_composer",
    "title": "Cloud Composer",
    "group": "products",
    "url": "/gcp-icons/products/cloud_composer.svg",
    "kind": "queue"
  },
  {
    "id": "cloud_data_fusion",
    "title": "Cloud Data Fusion",
    "group": "products",
    "url": "/gcp-icons/products/cloud_data_fusion.svg",
    "kind": "analytics"
  },
  {
    "id": "cloud_deploy",
    "title": "Cloud Deploy",
    "group": "products",
    "url": "/gcp-icons/products/cloud_deploy.svg",
    "kind": "service"
  },
  {
    "id": "cloud_deployment_manager",
    "title": "Cloud Deployment Manager",
    "group": "products",
    "url": "/gcp-icons/products/cloud_deployment_manager.svg",
    "kind": "service"
  },
  {
    "id": "cloud_dns",
    "title": "Cloud DNS",
    "group": "products",
    "url": "/gcp-icons/products/cloud_dns.svg",
    "kind": "network"
  },
  {
    "id": "cloud_domains",
    "title": "Cloud Domains",
    "group": "products",
    "url": "/gcp-icons/products/cloud_domains.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_ekm",
    "title": "Cloud Ekm",
    "group": "products",
    "url": "/gcp-icons/products/cloud_ekm.svg",
    "kind": "service"
  },
  {
    "id": "cloud_endpoints",
    "title": "Cloud Endpoints",
    "group": "products",
    "url": "/gcp-icons/products/cloud_endpoints.svg",
    "kind": "gateway"
  },
  {
    "id": "cloud_external_ip_addresses",
    "title": "Cloud External Ip Addresses",
    "group": "products",
    "url": "/gcp-icons/products/cloud_external_ip_addresses.svg",
    "kind": "service"
  },
  {
    "id": "cloud_firewall_rules",
    "title": "Cloud Firewall Rules",
    "group": "products",
    "url": "/gcp-icons/products/cloud_firewall_rules.svg",
    "kind": "security"
  },
  {
    "id": "cloud_for_marketing",
    "title": "Cloud For Marketing",
    "group": "products",
    "url": "/gcp-icons/products/cloud_for_marketing.svg",
    "kind": "service"
  },
  {
    "id": "cloud_functions",
    "title": "Cloud Functions",
    "group": "products",
    "url": "/gcp-icons/products/cloud_functions.svg",
    "kind": "function"
  },
  {
    "id": "cloud_generic",
    "title": "Cloud Generic",
    "group": "products",
    "url": "/gcp-icons/products/cloud_generic.svg",
    "kind": "service"
  },
  {
    "id": "cloud_gpu",
    "title": "Cloud GPU",
    "group": "products",
    "url": "/gcp-icons/products/cloud_gpu.svg",
    "kind": "service"
  },
  {
    "id": "cloud_healthcare_api",
    "title": "Cloud Healthcare API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_healthcare_api.svg",
    "kind": "service"
  },
  {
    "id": "cloud_healthcare_marketplace",
    "title": "Cloud Healthcare Marketplace",
    "group": "products",
    "url": "/gcp-icons/products/cloud_healthcare_marketplace.svg",
    "kind": "service"
  },
  {
    "id": "cloud_hsm",
    "title": "Cloud Hsm",
    "group": "products",
    "url": "/gcp-icons/products/cloud_hsm.svg",
    "kind": "service"
  },
  {
    "id": "cloud_ids",
    "title": "Cloud IDS",
    "group": "products",
    "url": "/gcp-icons/products/cloud_ids.svg",
    "kind": "security"
  },
  {
    "id": "cloud_inference_api",
    "title": "Cloud Inference API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_inference_api.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_interconnect",
    "title": "Cloud Interconnect",
    "group": "products",
    "url": "/gcp-icons/products/cloud_interconnect.svg",
    "kind": "network"
  },
  {
    "id": "cloud_jobs_api",
    "title": "Cloud Jobs API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_jobs_api.svg",
    "kind": "service"
  },
  {
    "id": "cloud_load_balancing",
    "title": "Cloud Load Balancing",
    "group": "products",
    "url": "/gcp-icons/products/cloud_load_balancing.svg",
    "kind": "loadbalancer"
  },
  {
    "id": "cloud_logging",
    "title": "Cloud Logging",
    "group": "products",
    "url": "/gcp-icons/products/cloud_logging.svg",
    "kind": "service"
  },
  {
    "id": "cloud_media_edge",
    "title": "Cloud Media Edge",
    "group": "products",
    "url": "/gcp-icons/products/cloud_media_edge.svg",
    "kind": "service"
  },
  {
    "id": "cloud_monitoring",
    "title": "Cloud Monitoring",
    "group": "products",
    "url": "/gcp-icons/products/cloud_monitoring.svg",
    "kind": "service"
  },
  {
    "id": "cloud_nat",
    "title": "Cloud NAT",
    "group": "products",
    "url": "/gcp-icons/products/cloud_nat.svg",
    "kind": "network"
  },
  {
    "id": "cloud_natural_language_api",
    "title": "Cloud Natural Language API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_natural_language_api.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_network",
    "title": "Cloud Network",
    "group": "products",
    "url": "/gcp-icons/products/cloud_network.svg",
    "kind": "network"
  },
  {
    "id": "cloud_ops",
    "title": "Cloud Ops",
    "group": "products",
    "url": "/gcp-icons/products/cloud_ops.svg",
    "kind": "service"
  },
  {
    "id": "cloud_optimization_ai",
    "title": "Cloud Optimization AI",
    "group": "products",
    "url": "/gcp-icons/products/cloud_optimization_ai.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_optimization_ai_fleet_routing_api",
    "title": "Cloud Optimization AI Fleet Routing API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_optimization_ai_fleet_routing_api.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_router",
    "title": "Cloud Router",
    "group": "products",
    "url": "/gcp-icons/products/cloud_router.svg",
    "kind": "network"
  },
  {
    "id": "cloud_routes",
    "title": "Cloud Routes",
    "group": "products",
    "url": "/gcp-icons/products/cloud_routes.svg",
    "kind": "network"
  },
  {
    "id": "cloud_run",
    "title": "Cloud Run",
    "group": "products",
    "url": "/gcp-icons/products/cloud_run.svg",
    "kind": "service"
  },
  {
    "id": "cloud_run_for_anthos",
    "title": "Cloud Run For Anthos",
    "group": "products",
    "url": "/gcp-icons/products/cloud_run_for_anthos.svg",
    "kind": "container"
  },
  {
    "id": "cloud_scheduler",
    "title": "Cloud Scheduler",
    "group": "products",
    "url": "/gcp-icons/products/cloud_scheduler.svg",
    "kind": "queue"
  },
  {
    "id": "cloud_security_scanner",
    "title": "Cloud Security Scanner",
    "group": "products",
    "url": "/gcp-icons/products/cloud_security_scanner.svg",
    "kind": "security"
  },
  {
    "id": "cloud_shell",
    "title": "Cloud Shell",
    "group": "products",
    "url": "/gcp-icons/products/cloud_shell.svg",
    "kind": "service"
  },
  {
    "id": "cloud_spanner",
    "title": "Cloud Spanner",
    "group": "products",
    "url": "/gcp-icons/products/cloud_spanner.svg",
    "kind": "database"
  },
  {
    "id": "cloud_sql",
    "title": "Cloud SQL",
    "group": "products",
    "url": "/gcp-icons/products/cloud_sql.svg",
    "kind": "database"
  },
  {
    "id": "cloud_storage",
    "title": "Cloud Storage",
    "group": "products",
    "url": "/gcp-icons/products/cloud_storage.svg",
    "kind": "storage"
  },
  {
    "id": "cloud_tasks",
    "title": "Cloud Tasks",
    "group": "products",
    "url": "/gcp-icons/products/cloud_tasks.svg",
    "kind": "queue"
  },
  {
    "id": "cloud_test_lab",
    "title": "Cloud Test Lab",
    "group": "products",
    "url": "/gcp-icons/products/cloud_test_lab.svg",
    "kind": "service"
  },
  {
    "id": "cloud_tpu",
    "title": "Cloud TPU",
    "group": "products",
    "url": "/gcp-icons/products/cloud_tpu.svg",
    "kind": "service"
  },
  {
    "id": "cloud_translation_api",
    "title": "Cloud Translation API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_translation_api.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_vision_api",
    "title": "Cloud Vision API",
    "group": "products",
    "url": "/gcp-icons/products/cloud_vision_api.svg",
    "kind": "ai"
  },
  {
    "id": "cloud_vpn",
    "title": "Cloud VPN",
    "group": "products",
    "url": "/gcp-icons/products/cloud_vpn.svg",
    "kind": "network"
  },
  {
    "id": "compute_engine",
    "title": "Compute Engine",
    "group": "products",
    "url": "/gcp-icons/products/compute_engine.svg",
    "kind": "server"
  },
  {
    "id": "configuration_management",
    "title": "Configuration Management",
    "group": "products",
    "url": "/gcp-icons/products/configuration_management.svg",
    "kind": "service"
  },
  {
    "id": "connectivity_test",
    "title": "Connectivity Test",
    "group": "products",
    "url": "/gcp-icons/products/connectivity_test.svg",
    "kind": "network"
  },
  {
    "id": "connectors",
    "title": "Connectors",
    "group": "products",
    "url": "/gcp-icons/products/connectors.svg",
    "kind": "queue"
  },
  {
    "id": "contact_center_ai",
    "title": "Contact Center AI",
    "group": "products",
    "url": "/gcp-icons/products/contact_center_ai.svg",
    "kind": "ai"
  },
  {
    "id": "container_optimized_os",
    "title": "Container Optimized OS",
    "group": "products",
    "url": "/gcp-icons/products/container_optimized_os.svg",
    "kind": "ai"
  },
  {
    "id": "container_registry",
    "title": "Container Registry",
    "group": "products",
    "url": "/gcp-icons/products/container_registry.svg",
    "kind": "ai"
  },
  {
    "id": "data_catalog",
    "title": "Data Catalog",
    "group": "products",
    "url": "/gcp-icons/products/data_catalog.svg",
    "kind": "analytics"
  },
  {
    "id": "data_labeling",
    "title": "Data Labeling",
    "group": "products",
    "url": "/gcp-icons/products/data_labeling.svg",
    "kind": "service"
  },
  {
    "id": "data_layers",
    "title": "Data Layers",
    "group": "products",
    "url": "/gcp-icons/products/data_layers.svg",
    "kind": "service"
  },
  {
    "id": "data_loss_prevention_api",
    "title": "Data Loss Prevention API",
    "group": "products",
    "url": "/gcp-icons/products/data_loss_prevention_api.svg",
    "kind": "security"
  },
  {
    "id": "data_qna",
    "title": "Data Qna",
    "group": "products",
    "url": "/gcp-icons/products/data_qna.svg",
    "kind": "analytics"
  },
  {
    "id": "data_studio",
    "title": "Data Studio",
    "group": "products",
    "url": "/gcp-icons/products/data_studio.svg",
    "kind": "analytics"
  },
  {
    "id": "data_transfer",
    "title": "Data Transfer",
    "group": "products",
    "url": "/gcp-icons/products/data_transfer.svg",
    "kind": "storage"
  },
  {
    "id": "database_migration_service",
    "title": "Database Migration Service",
    "group": "products",
    "url": "/gcp-icons/products/database_migration_service.svg",
    "kind": "database"
  },
  {
    "id": "dataflow",
    "title": "Dataflow",
    "group": "products",
    "url": "/gcp-icons/products/dataflow.svg",
    "kind": "analytics"
  },
  {
    "id": "datalab",
    "title": "Datalab",
    "group": "products",
    "url": "/gcp-icons/products/datalab.svg",
    "kind": "ai"
  },
  {
    "id": "dataplex",
    "title": "Dataplex",
    "group": "products",
    "url": "/gcp-icons/products/dataplex.svg",
    "kind": "analytics"
  },
  {
    "id": "datapol",
    "title": "Datapol",
    "group": "products",
    "url": "/gcp-icons/products/datapol.svg",
    "kind": "service"
  },
  {
    "id": "dataprep",
    "title": "Dataprep",
    "group": "products",
    "url": "/gcp-icons/products/dataprep.svg",
    "kind": "analytics"
  },
  {
    "id": "dataproc",
    "title": "Dataproc",
    "group": "products",
    "url": "/gcp-icons/products/dataproc.svg",
    "kind": "analytics"
  },
  {
    "id": "dataproc_metastore",
    "title": "Dataproc Metastore",
    "group": "products",
    "url": "/gcp-icons/products/dataproc_metastore.svg",
    "kind": "analytics"
  },
  {
    "id": "datashare",
    "title": "Datashare",
    "group": "products",
    "url": "/gcp-icons/products/datashare.svg",
    "kind": "analytics"
  },
  {
    "id": "datastore",
    "title": "Datastore",
    "group": "products",
    "url": "/gcp-icons/products/datastore.svg",
    "kind": "database"
  },
  {
    "id": "datastream",
    "title": "Datastream",
    "group": "products",
    "url": "/gcp-icons/products/datastream.svg",
    "kind": "analytics"
  },
  {
    "id": "debugger",
    "title": "Debugger",
    "group": "products",
    "url": "/gcp-icons/products/debugger.svg",
    "kind": "service"
  },
  {
    "id": "developer_portal",
    "title": "Developer Portal",
    "group": "products",
    "url": "/gcp-icons/products/developer_portal.svg",
    "kind": "service"
  },
  {
    "id": "dialogflow",
    "title": "Dialogflow",
    "group": "products",
    "url": "/gcp-icons/products/dialogflow.svg",
    "kind": "ai"
  },
  {
    "id": "dialogflow_cx",
    "title": "Dialogflow Cx",
    "group": "products",
    "url": "/gcp-icons/products/dialogflow_cx.svg",
    "kind": "ai"
  },
  {
    "id": "dialogflow_insights",
    "title": "Dialogflow Insights",
    "group": "products",
    "url": "/gcp-icons/products/dialogflow_insights.svg",
    "kind": "ai"
  },
  {
    "id": "document_ai",
    "title": "Document AI",
    "group": "products",
    "url": "/gcp-icons/products/document_ai.svg",
    "kind": "ai"
  },
  {
    "id": "early_access_center",
    "title": "Early Access Center",
    "group": "products",
    "url": "/gcp-icons/products/early_access_center.svg",
    "kind": "security"
  },
  {
    "id": "error_reporting",
    "title": "Error Reporting",
    "group": "products",
    "url": "/gcp-icons/products/error_reporting.svg",
    "kind": "service"
  },
  {
    "id": "eventarc",
    "title": "Eventarc",
    "group": "products",
    "url": "/gcp-icons/products/eventarc.svg",
    "kind": "queue"
  },
  {
    "id": "filestore",
    "title": "Filestore",
    "group": "products",
    "url": "/gcp-icons/products/filestore.svg",
    "kind": "storage"
  },
  {
    "id": "financial_services_marketplace",
    "title": "Financial Services Marketplace",
    "group": "products",
    "url": "/gcp-icons/products/financial_services_marketplace.svg",
    "kind": "service"
  },
  {
    "id": "firestore",
    "title": "Firestore",
    "group": "products",
    "url": "/gcp-icons/products/firestore.svg",
    "kind": "database"
  },
  {
    "id": "fleet_engine",
    "title": "Fleet Engine",
    "group": "products",
    "url": "/gcp-icons/products/fleet_engine.svg",
    "kind": "service"
  },
  {
    "id": "free_trial",
    "title": "Free Trial",
    "group": "products",
    "url": "/gcp-icons/products/free_trial.svg",
    "kind": "service"
  },
  {
    "id": "game_servers",
    "title": "Game Servers",
    "group": "products",
    "url": "/gcp-icons/products/game_servers.svg",
    "kind": "server"
  },
  {
    "id": "gce_systems_management",
    "title": "Gce Systems Management",
    "group": "products",
    "url": "/gcp-icons/products/gce_systems_management.svg",
    "kind": "service"
  },
  {
    "id": "genomics",
    "title": "Genomics",
    "group": "products",
    "url": "/gcp-icons/products/genomics.svg",
    "kind": "ai"
  },
  {
    "id": "gke_on_prem",
    "title": "Gke On Prem",
    "group": "products",
    "url": "/gcp-icons/products/gke_on_prem.svg",
    "kind": "container"
  },
  {
    "id": "google_cloud_marketplace",
    "title": "Google Cloud Marketplace",
    "group": "products",
    "url": "/gcp-icons/products/google_cloud_marketplace.svg",
    "kind": "service"
  },
  {
    "id": "google_kubernetes_engine",
    "title": "Google Kubernetes Engine",
    "group": "products",
    "url": "/gcp-icons/products/google_kubernetes_engine.svg",
    "kind": "container"
  },
  {
    "id": "google_maps_platform",
    "title": "Google Maps Platform",
    "group": "products",
    "url": "/gcp-icons/products/google_maps_platform.svg",
    "kind": "service"
  },
  {
    "id": "healthcare_nlp_api",
    "title": "Healthcare Nlp API",
    "group": "products",
    "url": "/gcp-icons/products/healthcare_nlp_api.svg",
    "kind": "service"
  },
  {
    "id": "home",
    "title": "Home",
    "group": "products",
    "url": "/gcp-icons/products/home.svg",
    "kind": "service"
  },
  {
    "id": "identity_and_access_management",
    "title": "Identity And Access Management",
    "group": "products",
    "url": "/gcp-icons/products/identity_and_access_management.svg",
    "kind": "security"
  },
  {
    "id": "identity_aware_proxy",
    "title": "Identity Aware Proxy",
    "group": "products",
    "url": "/gcp-icons/products/identity_aware_proxy.svg",
    "kind": "security"
  },
  {
    "id": "identity_platform",
    "title": "Identity Platform",
    "group": "products",
    "url": "/gcp-icons/products/identity_platform.svg",
    "kind": "security"
  },
  {
    "id": "iot_core",
    "title": "IOT Core",
    "group": "products",
    "url": "/gcp-icons/products/iot_core.svg",
    "kind": "service"
  },
  {
    "id": "iot_edge",
    "title": "IOT Edge",
    "group": "products",
    "url": "/gcp-icons/products/iot_edge.svg",
    "kind": "service"
  },
  {
    "id": "key_access_justifications",
    "title": "Key Access Justifications",
    "group": "products",
    "url": "/gcp-icons/products/key_access_justifications.svg",
    "kind": "security"
  },
  {
    "id": "key_management_service",
    "title": "Key Management Service",
    "group": "products",
    "url": "/gcp-icons/products/key_management_service.svg",
    "kind": "security"
  },
  {
    "id": "kuberun",
    "title": "Kuberun",
    "group": "products",
    "url": "/gcp-icons/products/kuberun.svg",
    "kind": "container"
  },
  {
    "id": "launcher",
    "title": "Launcher",
    "group": "products",
    "url": "/gcp-icons/products/launcher.svg",
    "kind": "service"
  },
  {
    "id": "local_ssd",
    "title": "Local Ssd",
    "group": "products",
    "url": "/gcp-icons/products/local_ssd.svg",
    "kind": "storage"
  },
  {
    "id": "looker",
    "title": "Looker",
    "group": "products",
    "url": "/gcp-icons/products/looker.svg",
    "kind": "analytics"
  },
  {
    "id": "managed_service_for_microsoft_active_directory",
    "title": "Managed Service For Microsoft Active Directory",
    "group": "products",
    "url": "/gcp-icons/products/managed_service_for_microsoft_active_directory.svg",
    "kind": "service"
  },
  {
    "id": "media_translation_api",
    "title": "Media Translation API",
    "group": "products",
    "url": "/gcp-icons/products/media_translation_api.svg",
    "kind": "ai"
  },
  {
    "id": "memorystore",
    "title": "Memorystore",
    "group": "products",
    "url": "/gcp-icons/products/memorystore.svg",
    "kind": "cache"
  },
  {
    "id": "migrate_for_anthos",
    "title": "Migrate For Anthos",
    "group": "products",
    "url": "/gcp-icons/products/migrate_for_anthos.svg",
    "kind": "container"
  },
  {
    "id": "migrate_for_compute_engine",
    "title": "Migrate For Compute Engine",
    "group": "products",
    "url": "/gcp-icons/products/migrate_for_compute_engine.svg",
    "kind": "server"
  },
  {
    "id": "my_cloud",
    "title": "My Cloud",
    "group": "products",
    "url": "/gcp-icons/products/my_cloud.svg",
    "kind": "service"
  },
  {
    "id": "network_connectivity_center",
    "title": "Network Connectivity Center",
    "group": "products",
    "url": "/gcp-icons/products/network_connectivity_center.svg",
    "kind": "network"
  },
  {
    "id": "network_intelligence_center",
    "title": "Network Intelligence Center",
    "group": "products",
    "url": "/gcp-icons/products/network_intelligence_center.svg",
    "kind": "network"
  },
  {
    "id": "network_security",
    "title": "Network Security",
    "group": "products",
    "url": "/gcp-icons/products/network_security.svg",
    "kind": "security"
  },
  {
    "id": "network_tiers",
    "title": "Network Tiers",
    "group": "products",
    "url": "/gcp-icons/products/network_tiers.svg",
    "kind": "network"
  },
  {
    "id": "network_topology",
    "title": "Network Topology",
    "group": "products",
    "url": "/gcp-icons/products/network_topology.svg",
    "kind": "network"
  },
  {
    "id": "onboarding",
    "title": "Onboarding",
    "group": "products",
    "url": "/gcp-icons/products/onboarding.svg",
    "kind": "service"
  },
  {
    "id": "os_configuration_management",
    "title": "OS Configuration Management",
    "group": "products",
    "url": "/gcp-icons/products/os_configuration_management.svg",
    "kind": "server"
  },
  {
    "id": "os_inventory_management",
    "title": "OS Inventory Management",
    "group": "products",
    "url": "/gcp-icons/products/os_inventory_management.svg",
    "kind": "server"
  },
  {
    "id": "os_patch_management",
    "title": "OS Patch Management",
    "group": "products",
    "url": "/gcp-icons/products/os_patch_management.svg",
    "kind": "server"
  },
  {
    "id": "partner_interconnect",
    "title": "Partner Interconnect",
    "group": "products",
    "url": "/gcp-icons/products/partner_interconnect.svg",
    "kind": "network"
  },
  {
    "id": "partner_portal",
    "title": "Partner Portal",
    "group": "products",
    "url": "/gcp-icons/products/partner_portal.svg",
    "kind": "service"
  },
  {
    "id": "performance_dashboard",
    "title": "Performance Dashboard",
    "group": "products",
    "url": "/gcp-icons/products/performance_dashboard.svg",
    "kind": "service"
  },
  {
    "id": "permissions",
    "title": "Permissions",
    "group": "products",
    "url": "/gcp-icons/products/permissions.svg",
    "kind": "security"
  },
  {
    "id": "persistent_disk",
    "title": "Persistent Disk",
    "group": "products",
    "url": "/gcp-icons/products/persistent_disk.svg",
    "kind": "storage"
  },
  {
    "id": "phishing_protection",
    "title": "Phishing Protection",
    "group": "products",
    "url": "/gcp-icons/products/phishing_protection.svg",
    "kind": "security"
  },
  {
    "id": "policy_analyzer",
    "title": "Policy Analyzer",
    "group": "products",
    "url": "/gcp-icons/products/policy_analyzer.svg",
    "kind": "security"
  },
  {
    "id": "premium_network_tier",
    "title": "Premium Network Tier",
    "group": "products",
    "url": "/gcp-icons/products/premium_network_tier.svg",
    "kind": "network"
  },
  {
    "id": "private_connectivity",
    "title": "Private Connectivity",
    "group": "products",
    "url": "/gcp-icons/products/private_connectivity.svg",
    "kind": "network"
  },
  {
    "id": "private_service_connect",
    "title": "Private Service Connect",
    "group": "products",
    "url": "/gcp-icons/products/private_service_connect.svg",
    "kind": "network"
  },
  {
    "id": "producer_portal",
    "title": "Producer Portal",
    "group": "products",
    "url": "/gcp-icons/products/producer_portal.svg",
    "kind": "service"
  },
  {
    "id": "profiler",
    "title": "Profiler",
    "group": "products",
    "url": "/gcp-icons/products/profiler.svg",
    "kind": "service"
  },
  {
    "id": "project",
    "title": "Project",
    "group": "products",
    "url": "/gcp-icons/products/project.svg",
    "kind": "service"
  },
  {
    "id": "pubsub",
    "title": "Pubsub",
    "group": "products",
    "url": "/gcp-icons/products/pubsub.svg",
    "kind": "queue"
  },
  {
    "id": "quantum_engine",
    "title": "Quantum Engine",
    "group": "products",
    "url": "/gcp-icons/products/quantum_engine.svg",
    "kind": "ai"
  },
  {
    "id": "quotas",
    "title": "Quotas",
    "group": "products",
    "url": "/gcp-icons/products/quotas.svg",
    "kind": "service"
  },
  {
    "id": "real_world_insights",
    "title": "Real World Insights",
    "group": "products",
    "url": "/gcp-icons/products/real_world_insights.svg",
    "kind": "analytics"
  },
  {
    "id": "recommendations_ai",
    "title": "Recommendations AI",
    "group": "products",
    "url": "/gcp-icons/products/recommendations_ai.svg",
    "kind": "ai"
  },
  {
    "id": "release_notes",
    "title": "Release Notes",
    "group": "products",
    "url": "/gcp-icons/products/release_notes.svg",
    "kind": "service"
  },
  {
    "id": "retail_api",
    "title": "Retail API",
    "group": "products",
    "url": "/gcp-icons/products/retail_api.svg",
    "kind": "ai"
  },
  {
    "id": "risk_manager",
    "title": "Risk Manager",
    "group": "products",
    "url": "/gcp-icons/products/risk_manager.svg",
    "kind": "security"
  },
  {
    "id": "runtime_config",
    "title": "Runtime Config",
    "group": "products",
    "url": "/gcp-icons/products/runtime_config.svg",
    "kind": "service"
  },
  {
    "id": "secret_manager",
    "title": "Secret Manager",
    "group": "products",
    "url": "/gcp-icons/products/secret_manager.svg",
    "kind": "security"
  },
  {
    "id": "security",
    "title": "Security",
    "group": "products",
    "url": "/gcp-icons/products/security.svg",
    "kind": "security"
  },
  {
    "id": "security_command_center",
    "title": "Security Command Center",
    "group": "products",
    "url": "/gcp-icons/products/security_command_center.svg",
    "kind": "security"
  },
  {
    "id": "security_health_advisor",
    "title": "Security Health Advisor",
    "group": "products",
    "url": "/gcp-icons/products/security_health_advisor.svg",
    "kind": "security"
  },
  {
    "id": "security_key_enforcement",
    "title": "Security Key Enforcement",
    "group": "products",
    "url": "/gcp-icons/products/security_key_enforcement.svg",
    "kind": "security"
  },
  {
    "id": "service_discovery",
    "title": "Service Discovery",
    "group": "products",
    "url": "/gcp-icons/products/service_discovery.svg",
    "kind": "service"
  },
  {
    "id": "speech_to_text",
    "title": "Speech To Text",
    "group": "products",
    "url": "/gcp-icons/products/speech_to_text.svg",
    "kind": "ai"
  },
  {
    "id": "stackdriver",
    "title": "Stackdriver",
    "group": "products",
    "url": "/gcp-icons/products/stackdriver.svg",
    "kind": "service"
  },
  {
    "id": "standard_network_tier",
    "title": "Standard Network Tier",
    "group": "products",
    "url": "/gcp-icons/products/standard_network_tier.svg",
    "kind": "network"
  },
  {
    "id": "stream_suite",
    "title": "Stream Suite",
    "group": "products",
    "url": "/gcp-icons/products/stream_suite.svg",
    "kind": "analytics"
  },
  {
    "id": "support",
    "title": "Support",
    "group": "products",
    "url": "/gcp-icons/products/support.svg",
    "kind": "service"
  },
  {
    "id": "tensorflow_enterprise",
    "title": "Tensorflow Enterprise",
    "group": "products",
    "url": "/gcp-icons/products/tensorflow_enterprise.svg",
    "kind": "service"
  },
  {
    "id": "text_to_speech",
    "title": "Text To Speech",
    "group": "products",
    "url": "/gcp-icons/products/text_to_speech.svg",
    "kind": "ai"
  },
  {
    "id": "tools_for_powershell",
    "title": "Tools For Powershell",
    "group": "products",
    "url": "/gcp-icons/products/tools_for_powershell.svg",
    "kind": "service"
  },
  {
    "id": "trace",
    "title": "Trace",
    "group": "products",
    "url": "/gcp-icons/products/trace.svg",
    "kind": "service"
  },
  {
    "id": "traffic_director",
    "title": "Traffic Director",
    "group": "products",
    "url": "/gcp-icons/products/traffic_director.svg",
    "kind": "network"
  },
  {
    "id": "transfer",
    "title": "Transfer",
    "group": "products",
    "url": "/gcp-icons/products/transfer.svg",
    "kind": "storage"
  },
  {
    "id": "transfer_appliance",
    "title": "Transfer Appliance",
    "group": "products",
    "url": "/gcp-icons/products/transfer_appliance.svg",
    "kind": "storage"
  },
  {
    "id": "user_preferences",
    "title": "User Preferences",
    "group": "products",
    "url": "/gcp-icons/products/user_preferences.svg",
    "kind": "service"
  },
  {
    "id": "vertexai",
    "title": "Vertexai",
    "group": "products",
    "url": "/gcp-icons/products/vertexai.svg",
    "kind": "ai"
  },
  {
    "id": "video_intelligence_api",
    "title": "Video Intelligence API",
    "group": "products",
    "url": "/gcp-icons/products/video_intelligence_api.svg",
    "kind": "service"
  },
  {
    "id": "virtual_private_cloud",
    "title": "Virtual Private Cloud",
    "group": "products",
    "url": "/gcp-icons/products/virtual_private_cloud.svg",
    "kind": "network"
  },
  {
    "id": "visual_inspection",
    "title": "Visual Inspection",
    "group": "products",
    "url": "/gcp-icons/products/visual_inspection.svg",
    "kind": "service"
  },
  {
    "id": "vmware_engine",
    "title": "Vmware Engine",
    "group": "products",
    "url": "/gcp-icons/products/vmware_engine.svg",
    "kind": "server"
  },
  {
    "id": "web_risk",
    "title": "Web Risk",
    "group": "products",
    "url": "/gcp-icons/products/web_risk.svg",
    "kind": "security"
  },
  {
    "id": "web_security_scanner",
    "title": "Web Security Scanner",
    "group": "products",
    "url": "/gcp-icons/products/web_security_scanner.svg",
    "kind": "security"
  },
  {
    "id": "workflows",
    "title": "Workflows",
    "group": "products",
    "url": "/gcp-icons/products/workflows.svg",
    "kind": "queue"
  },
  {
    "id": "workload_identity_pool",
    "title": "Workload Identity Pool",
    "group": "products",
    "url": "/gcp-icons/products/workload_identity_pool.svg",
    "kind": "security"
  }
];

export const ALL_GCP_ICONS: GcpIconEntry[] = [
  ...GCP_CORE_ICONS,
  ...GCP_CATEGORY_ICONS,
  ...GCP_PRODUCT_ICONS,
];

const CORE_BY_ID = new Map<string, string>(GCP_CORE_ICONS.map((i) => [i.id, i.url]));
const CATEGORY_BY_ID = new Map<string, string>(GCP_CATEGORY_ICONS.map((i) => [i.id, i.url]));
const PRODUCT_BY_ID = new Map<string, string>(GCP_PRODUCT_ICONS.map((i) => [i.id, i.url]));

/**
 * Priority mapping from product/technology keywords to the official Google Cloud SVG icon URL.
 * Prefers the 2024/2025 Core Product SVGs and Category SVGs where available, falling back to
 * the 216 Product SVGs so every Google Cloud service gets its authentic icon.
 */
const GCP_TECH_RULES: [RegExp, string][] = [
  // Core Products & Gen AI / Agents
  [/\b(agent builder|adk|agent development kit|multi[- ]agent|conversational agent)/i, "/gcp-icons/category/agents.svg"],
  [/\b(agent assist)/i, "/gcp-icons/products/agent_assist.svg"],
  [/\b(contact center ai|ccai)/i, "/gcp-icons/products/contact_center_ai.svg"],
  [/\b(dialogflow cx)/i, "/gcp-icons/products/dialogflow_cx.svg"],
  [/\b(dialogflow)/i, "/gcp-icons/products/dialogflow.svg"],
  [/\b(document ai|docai)/i, "/gcp-icons/products/document_ai.svg"],
  [/\b(speech[- ]to[- ]text)/i, "/gcp-icons/products/speech_to_text.svg"],
  [/\b(text[- ]to[- ]speech)/i, "/gcp-icons/products/text_to_speech.svg"],
  [/\b(video intelligence)/i, "/gcp-icons/products/video_intelligence_api.svg"],
  [/\b(vision api|cloud vision|visual inspection)/i, "/gcp-icons/products/cloud_vision_api.svg"],
  [/\b(translation api|cloud translation)/i, "/gcp-icons/products/cloud_translation_api.svg"],
  [/\b(natural language api|healthcare nlp)/i, "/gcp-icons/products/cloud_natural_language_api.svg"],
  [/\b(recommendations ai|retail api)/i, "/gcp-icons/products/recommendations_ai.svg"],
  [/\b(automl)/i, "/gcp-icons/products/automl.svg"],
  [/\b(ai hypercomputer)/i, "/gcp-icons/core/ai_hypercomputer.svg"],
  [/\b(cloud tpu|\btpu\b)/i, "/gcp-icons/products/cloud_tpu.svg"],
  [/\b(cloud gpu|\bgpu\b)/i, "/gcp-icons/products/cloud_gpu.svg"],
  [/\b(tensorflow)/i, "/gcp-icons/products/tensorflow_enterprise.svg"],
  [/\b(vertex ai|gemini|imagen|veo|chirp|codey|medlm|sec-palm|embeddings)/i, "/gcp-icons/core/vertex_ai.svg"],

  // Compute, Containers & Serverless
  [/\b(cloud run functions|cloud functions)/i, "/gcp-icons/products/cloud_functions.svg"],
  [/\b(cloud run for anthos)/i, "/gcp-icons/products/cloud_run_for_anthos.svg"],
  [/\b(cloud run)/i, "/gcp-icons/core/cloud_run.svg"],
  [/\b(app engine)/i, "/gcp-icons/products/app_engine.svg"],
  [/\b(gke on[- ]prem)/i, "/gcp-icons/products/gke_on_prem.svg"],
  [/\b(google kubernetes engine|\bgke\b)/i, "/gcp-icons/core/gke.svg"],
  [/\b(anthos service mesh)/i, "/gcp-icons/products/anthos_service_mesh.svg"],
  [/\b(anthos config management)/i, "/gcp-icons/products/anthos_config_management.svg"],
  [/\b(anthos)/i, "/gcp-icons/core/anthos.svg"],
  [/\b(distributed cloud|gdce)/i, "/gcp-icons/core/distributed_cloud.svg"],
  [/\b(compute engine|\bgce\b)/i, "/gcp-icons/core/compute_engine.svg"],
  [/\b(vmware engine)/i, "/gcp-icons/products/vmware_engine.svg"],
  [/\b(bare metal)/i, "/gcp-icons/products/bare_metal_solutions.svg"],
  [/\b(cloud batch|\bbatch\b)/i, "/gcp-icons/products/batch.svg"],

  // Databases, Storage & Caching
  [/\b(alloydb)/i, "/gcp-icons/core/alloydb.svg"],
  [/\b(cloud sql)/i, "/gcp-icons/core/cloud_sql.svg"],
  [/\b(cloud spanner|\bspanner\b)/i, "/gcp-icons/core/cloud_spanner.svg"],
  [/\b(bigtable)/i, "/gcp-icons/products/bigtable.svg"],
  [/\b(firestore)/i, "/gcp-icons/products/firestore.svg"],
  [/\b(datastore)/i, "/gcp-icons/products/datastore.svg"],
  [/\b(memorystore)/i, "/gcp-icons/products/memorystore.svg"],
  [/\b(database migration|\bdms\b)/i, "/gcp-icons/products/database_migration_service.svg"],
  [/\b(cloud storage|\bgcs\b)/i, "/gcp-icons/core/cloud_storage.svg"],
  [/\b(hyperdisk)/i, "/gcp-icons/core/hyperdisk.svg"],
  [/\b(persistent disk)/i, "/gcp-icons/products/persistent_disk.svg"],
  [/\b(local ssd)/i, "/gcp-icons/products/local_ssd.svg"],
  [/\b(filestore)/i, "/gcp-icons/products/filestore.svg"],
  [/\b(storage transfer|transfer appliance)/i, "/gcp-icons/products/data_transfer.svg"],

  // Data Analytics & BI
  [/\b(bigquery)/i, "/gcp-icons/core/bigquery.svg"],
  [/\b(looker studio|data studio)/i, "/gcp-icons/products/data_studio.svg"],
  [/\b(looker)/i, "/gcp-icons/core/looker.svg"],
  [/\b(dataflow)/i, "/gcp-icons/products/dataflow.svg"],
  [/\b(dataproc metastore)/i, "/gcp-icons/products/dataproc_metastore.svg"],
  [/\b(dataproc)/i, "/gcp-icons/products/dataproc.svg"],
  [/\b(datastream)/i, "/gcp-icons/products/datastream.svg"],
  [/\b(dataplex)/i, "/gcp-icons/products/dataplex.svg"],
  [/\b(data catalog)/i, "/gcp-icons/products/data_catalog.svg"],
  [/\b(data fusion|cloud data fusion)/i, "/gcp-icons/products/cloud_data_fusion.svg"],
  [/\b(analytics hub)/i, "/gcp-icons/products/analytics_hub.svg"],
  [/\b(cloud composer|\bcomposer\b)/i, "/gcp-icons/products/cloud_composer.svg"],

  // Integration, Messaging & Orchestration
  [/\b(pub\/?sub|pubsub)/i, "/gcp-icons/products/pubsub.svg"],
  [/\b(eventarc)/i, "/gcp-icons/products/eventarc.svg"],
  [/\b(workflows|cloud workflows)/i, "/gcp-icons/products/workflows.svg"],
  [/\b(cloud tasks)/i, "/gcp-icons/products/cloud_tasks.svg"],
  [/\b(cloud scheduler)/i, "/gcp-icons/products/cloud_scheduler.svg"],
  [/\b(application integration|integration connectors)/i, "/gcp-icons/category/integration_services.svg"],

  // Networking & Edge
  [/\b(apigee)/i, "/gcp-icons/core/apigee.svg"],
  [/\b(api gateway|cloud api gateway)/i, "/gcp-icons/products/cloud_api_gateway.svg"],
  [/\b(cloud endpoints)/i, "/gcp-icons/products/cloud_endpoints.svg"],
  [/\b(cloud load balancing)/i, "/gcp-icons/products/cloud_load_balancing.svg"],
  [/\b(cloud cdn)/i, "/gcp-icons/products/cloud_cdn.svg"],
  [/\b(cloud dns)/i, "/gcp-icons/products/cloud_dns.svg"],
  [/\b(cloud armor|model armor)/i, "/gcp-icons/products/cloud_armor.svg"],
  [/\b(cloud nat)/i, "/gcp-icons/products/cloud_nat.svg"],
  [/\b(cloud router)/i, "/gcp-icons/products/cloud_router.svg"],
  [/\b(cloud vpn|ha vpn)/i, "/gcp-icons/products/cloud_vpn.svg"],
  [/\b(partner interconnect)/i, "/gcp-icons/products/partner_interconnect.svg"],
  [/\b(cloud interconnect|cross-cloud interconnect)/i, "/gcp-icons/products/cloud_interconnect.svg"],
  [/\b(network connectivity center)/i, "/gcp-icons/products/network_connectivity_center.svg"],
  [/\b(network intelligence center)/i, "/gcp-icons/products/network_intelligence_center.svg"],
  [/\b(private service connect)/i, "/gcp-icons/products/private_service_connect.svg"],
  [/\b(traffic director)/i, "/gcp-icons/products/traffic_director.svg"],
  [/\b(service discovery|service directory)/i, "/gcp-icons/products/service_discovery.svg"],
  [/\b(cloud firewall)/i, "/gcp-icons/products/cloud_firewall_rules.svg"],
  [/\b(cloud ids|intrusion detection)/i, "/gcp-icons/products/cloud_ids.svg"],
  [/\b(virtual private cloud|shared vpc)/i, "/gcp-icons/products/virtual_private_cloud.svg"],

  // Security, Identity & SecOps
  [/\b(google security operations|secops|chronicle)/i, "/gcp-icons/core/security_operations.svg"],
  [/\b(security command center|\bscc\b)/i, "/gcp-icons/core/security_command_center.svg"],
  [/\b(threat intelligence)/i, "/gcp-icons/core/threat_intelligence.svg"],
  [/\b(mandiant)/i, "/gcp-icons/core/mandiant.svg"],
  [/\b(identity[- ]aware proxy|\biap\b)/i, "/gcp-icons/products/identity_aware_proxy.svg"],
  [/\b(beyondcorp)/i, "/gcp-icons/products/beyondcorp.svg"],
  [/\b(cloud iam|identity and access management)/i, "/gcp-icons/products/identity_and_access_management.svg"],
  [/\b(identity platform)/i, "/gcp-icons/products/identity_platform.svg"],
  [/\b(workload identity)/i, "/gcp-icons/products/workload_identity_pool.svg"],
  [/\b(secret manager)/i, "/gcp-icons/products/secret_manager.svg"],
  [/\b(cloud kms|key management service)/i, "/gcp-icons/products/key_management_service.svg"],
  [/\b(cloud hsm)/i, "/gcp-icons/products/cloud_hsm.svg"],
  [/\b(cloud ekm)/i, "/gcp-icons/products/cloud_ekm.svg"],
  [/\b(certificate authority|certificate manager)/i, "/gcp-icons/products/certificate_manager.svg"],
  [/\b(binary authorization)/i, "/gcp-icons/products/binary_authorization.svg"],
  [/\b(assured workloads)/i, "/gcp-icons/products/assured_workloads.svg"],
  [/\b(access context manager|vpc service controls)/i, "/gcp-icons/products/access_context_manager.svg"],
  [/\b(sensitive data protection|data loss prevention|\bdlp\b)/i, "/gcp-icons/products/data_loss_prevention_api.svg"],

  // DevOps, CI/CD & Observability
  [/\b(cloud build)/i, "/gcp-icons/products/cloud_build.svg"],
  [/\b(cloud deploy)/i, "/gcp-icons/products/cloud_deploy.svg"],
  [/\b(artifact registry)/i, "/gcp-icons/products/artifact_registry.svg"],
  [/\b(container registry)/i, "/gcp-icons/products/container_registry.svg"],
  [/\b(cloud code|cloud workstations)/i, "/gcp-icons/products/cloud_code.svg"],
  [/\b(cloud shell)/i, "/gcp-icons/products/cloud_shell.svg"],
  [/\b(cloud monitoring|managed prometheus)/i, "/gcp-icons/products/cloud_monitoring.svg"],
  [/\b(cloud logging)/i, "/gcp-icons/products/cloud_logging.svg"],
  [/\b(cloud audit logs)/i, "/gcp-icons/products/cloud_audit_logs.svg"],
  [/\b(cloud trace|\btrace\b)/i, "/gcp-icons/products/trace.svg"],
  [/\b(cloud profiler|\bprofiler\b)/i, "/gcp-icons/products/profiler.svg"],
  [/\b(error reporting)/i, "/gcp-icons/products/error_reporting.svg"],
  [/\b(cloud asset inventory)/i, "/gcp-icons/products/cloud_asset_inventory.svg"],
  [/\b(cloud billing)/i, "/gcp-icons/products/billing.svg"],
  [/\b(google maps|maps platform|fleet engine)/i, "/gcp-icons/products/google_maps_platform.svg"],
  [/\b(healthcare api|cloud healthcare)/i, "/gcp-icons/products/cloud_healthcare_api.svg"],
];

const KIND_CATEGORY_ICON: Partial<Record<NodeKind, string>> = {
  ai: "/gcp-icons/category/ai_and_machine_learning.svg",
  analytics: "/gcp-icons/category/data_analytics.svg",
  database: "/gcp-icons/category/databases.svg",
  cache: "/gcp-icons/products/memorystore.svg",
  storage: "/gcp-icons/core/cloud_storage.svg",
  container: "/gcp-icons/core/gke.svg",
  function: "/gcp-icons/category/serverless_computing.svg",
  service: "/gcp-icons/core/cloud_run.svg",
  server: "/gcp-icons/core/compute_engine.svg",
  queue: "/gcp-icons/category/integration_services.svg",
  loadbalancer: "/gcp-icons/products/cloud_load_balancing.svg",
  gateway: "/gcp-icons/core/apigee.svg",
  security: "/gcp-icons/category/security_and_identity.svg",
  network: "/gcp-icons/category/networking.svg",
};

/**
 * Resolves a diagram node to an official Google Cloud SVG icon URL in `/gcp-icons/...`
 * whenever the node uses a Google Cloud product or has `provider === "gcp"`.
 * Returns `null` for non-GCP nodes so they render their Material Symbol icon.
 */
export function resolveGcpIconUrl(node: Pick<DNode, "kind" | "label" | "tech" | "provider">): string | null {
  if (node.provider && node.provider !== "gcp") return null;

  const text = `${node.tech ?? ""} ${node.label ?? ""}`.trim();
  if (text) {
    for (const [re, url] of GCP_TECH_RULES) {
      if (re.test(text)) return url;
    }
    // Check direct slug match in Core, Category, or Products when provider is gcp (or tech matches exactly)
    const techSlug = normalize(node.tech ?? "").replace(/\s+/g, "_");
    if (techSlug) {
      if (CORE_BY_ID.has(techSlug)) return CORE_BY_ID.get(techSlug)!;
      if (PRODUCT_BY_ID.has(techSlug)) return PRODUCT_BY_ID.get(techSlug)!;
      if (CATEGORY_BY_ID.has(techSlug)) return CATEGORY_BY_ID.get(techSlug)!;
    }
  }

  if (node.provider === "gcp") {
    const labelSlug = normalize(node.label ?? "").replace(/\s+/g, "_");
    if (labelSlug) {
      if (CORE_BY_ID.has(labelSlug)) return CORE_BY_ID.get(labelSlug)!;
      if (PRODUCT_BY_ID.has(labelSlug)) return PRODUCT_BY_ID.get(labelSlug)!;
      if (CATEGORY_BY_ID.has(labelSlug)) return CATEGORY_BY_ID.get(labelSlug)!;
    }
    return KIND_CATEGORY_ICON[node.kind] ?? "/gcp-icons/products/cloud_generic.svg";
  }

  return null;
}

/** Searches all 261 official Google Cloud icons by name, id, or category group. */
export function searchGcpIcons(
  query = "",
  opts: { group?: GcpIconGroup; limit?: number } = {},
): GcpIconEntry[] {
  const q = normalize(query);
  const tokens = q.split(/\s+/).filter(Boolean);
  const limit = opts.limit ?? 60;

  return ALL_GCP_ICONS
    .filter((item) => !opts.group || item.group === opts.group)
    .map((item) => {
      if (tokens.length === 0) {
        const base = item.group === "core" ? 30 : item.group === "category" ? 20 : 10;
        return { item, score: base };
      }
      const titleNorm = normalize(item.title);
      const idNorm = item.id.replace(/_/g, " ");
      let score = 0;
      if (titleNorm === q || idNorm === q) score += 25;
      else if (titleNorm.includes(q) || idNorm.includes(q)) score += 12;
      for (const t of tokens) {
        if (titleNorm.includes(t) || idNorm.includes(t)) score += 6;
        if (item.kind.includes(t) || item.group.includes(t)) score += 2;
      }
      if (score > 0 && item.group === "core") score += 3;
      else if (score > 0 && item.group === "category") score += 1;
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((x) => x.item);
}
