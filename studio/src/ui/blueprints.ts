/**
 * Reference architectures and technical blueprints grounded in:
 * - Google Cloud Architecture Center (https://docs.cloud.google.com/architecture)
 * - Google Cloud Architecture Framework (https://docs.cloud.google.com/architecture/framework)
 * - Google Cloud Official Icons & Diagramming Guidelines (https://cloud.google.com/icons?hl=en)
 * - Real-World Gen AI Use Cases with Technical Blueprints
 *   (https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints)
 */
import {
  AGENT_CATEGORY_LABELS,
  BLUEPRINT_CATALOG,
  COMPONENT_CATALOG,
  LAYER_LABELS,
  retrieveCatalogContext,
  searchBlueprints,
  searchComponents,
  type AgentCategory,
  type ArchitectureLayer,
  type BlueprintEntry,
  type ComponentEntry,
} from '../engine/catalog';
import type { CreateRequest } from '../engine/ops';
import type { IconName } from './icons';

export {
  AGENT_CATEGORY_LABELS,
  BLUEPRINT_CATALOG,
  COMPONENT_CATALOG,
  LAYER_LABELS,
  retrieveCatalogContext,
  searchBlueprints,
  searchComponents,
  type AgentCategory,
  type ArchitectureLayer,
  type BlueprintEntry,
  type ComponentEntry,
};

export interface Blueprint {
  id: string;
  title: string;
  category: string;
  icon: IconName;
  prompt: string;
  diagram: CreateRequest;
}

/** Featured 6 blueprints shown on the empty canvas starter grid; all 8+ blueprints are searchable in the Catalog & RAG tool. */
export const BLUEPRINTS: Blueprint[] = BLUEPRINT_CATALOG.slice(0, 6).map((b) => ({
  id: b.id,
  title: b.title,
  category: b.category,
  icon: b.icon as IconName,
  prompt: b.prompt,
  diagram: b.diagram,
}));
