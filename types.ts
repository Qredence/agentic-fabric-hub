export enum NodeType {
  CONFIG = 'CONFIG',
  DSPY_MODULE = 'DSPY_MODULE',
  PHASE = 'PHASE',
  STRATEGY = 'STRATEGY',
  AGENT = 'AGENT',
  TOOL = 'TOOL',
  TASK = 'TASK',
  SURFACE = 'SURFACE',
  ANNOTATION = 'ANNOTATION'
}

/**
 * Agentic Factory domain model notes (current + forward-compatible extensions)
 *
 * Current behavior:
 * - Nodes are laid out on an X/Z grid (Y is used as height in Three.js).
 * - `SURFACE` nodes are floor zones used for visual grouping (and are moved as a unit
 *   with contained nodes via coordinate containment logic in `App.tsx`).
 * - `ANNOTATION` nodes are 3D text labels drawn on the floor.
 * - Connections are directed edges rendered as “pipes”, optionally animated to suggest flow.
 *
 * Extensions in this file are OPTIONAL fields, so existing saves and AI outputs remain valid.
 * These fields enable “Cloudcraft for agents” primitives: provider/kind taxonomy, hierarchy,
 * vertical layering, and typed edge categories.
 */
export enum NodeProvider {
  GENERIC = 'Generic',
  AGENT_FRAMEWORK = 'AgentFramework',
  DSPY = 'DSPy',
  FOUNDRY = 'Foundry',
}

export enum EdgeCategory {
  DATA_FLOW = 'dataFlow',
  CONTROL_FLOW = 'controlFlow',
  CALLS_TOOL = 'callsTool',
  RETRIEVES_FROM = 'retrievesFrom',
  DEPLOYS_TO = 'deploysTo',
  DEPENDS_ON = 'dependsOn',
}

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  z: number; // We use x/z plane for grid, y is height
  /**
   * Optional vertical layer. Rendered as world-space Y offset.
   * Keeping X/Z grid enables the existing board metaphor.
   */
  y?: number;
  color: string;
  /**
   * Domain taxonomy for “primitives” (Agent Framework/DSPy/Foundry/etc).
   * Example:
   * - provider: AgentFramework
   * - kind: AgentFramework.Orchestrator or AgentFramework.Agent.Planner
   */
  provider?: NodeProvider;
  kind?: string;
  /**
   * Optional hierarchy. When a parent is collapsed, descendants may be hidden.
   * Positions remain absolute for now; `parentId` is used for grouping semantics.
   */
  parentId?: string;
  collapsed?: boolean;
  metadata?: Record<string, string>;
  textureUrl?: string;
  dimensions?: { width: number; depth: number }; // For surfaces
  fontSize?: number; // For annotations
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  animated?: boolean;
  category?: EdgeCategory;
}

export interface ArchitectureState {
  nodes: NodeData[];
  connections: Connection[];
}

export const GRID_SIZE = 2; // Size of one grid cell unit