import { Connection, EdgeCategory, NodeData, NodeProvider, NodeType } from '../types';

export const AGENTIC_FACTORY_SCHEMA_VERSION = 1 as const;

export interface AgenticFactoryFileV1 {
  schemaVersion: typeof AGENTIC_FACTORY_SCHEMA_VERSION;
  createdAt: string;
  appVersion?: string;
  nodes: NodeData[];
  connections: Connection[];
  views?: Record<string, unknown>;
}

export type AgenticFactoryFile = AgenticFactoryFileV1;

type LegacyGraph = {
  nodes: unknown[];
  connections: unknown[];
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asOptionalNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === 'boolean' ? v : fallback;
}

function normalizeNode(n: unknown): NodeData {
  if (!isObject(n)) throw new Error('Invalid node: expected object');

  const id = asString(n.id);
  const type = asString(n.type) as NodeType;
  const label = asString(n.label);

  if (!id) throw new Error('Invalid node: missing id');
  if (!Object.values(NodeType).includes(type)) throw new Error(`Invalid node: unknown type "${String(n.type)}"`);
  if (!label) throw new Error(`Invalid node "${id}": missing label`);

  const node: NodeData = {
    id,
    type,
    label,
    x: asNumber(n.x),
    z: asNumber(n.z),
    y: asOptionalNumber(n.y),
    color: asString(n.color, '#64748b'),
    provider: Object.values(NodeProvider).includes(n.provider as any) ? (n.provider as NodeProvider) : undefined,
    kind: typeof n.kind === 'string' ? n.kind : undefined,
    parentId: typeof n.parentId === 'string' ? n.parentId : undefined,
    collapsed: typeof n.collapsed === 'boolean' ? n.collapsed : undefined,
    metadata: isObject(n.metadata) ? (n.metadata as Record<string, string>) : undefined,
    textureUrl: typeof n.textureUrl === 'string' ? n.textureUrl : undefined,
    dimensions: isObject(n.dimensions)
      ? {
          width: asNumber((n.dimensions as any).width, 4),
          depth: asNumber((n.dimensions as any).depth, 4),
        }
      : undefined,
    fontSize: typeof n.fontSize === 'number' ? n.fontSize : undefined,
  };

  return node;
}

function normalizeConnection(c: unknown): Connection {
  if (!isObject(c)) throw new Error('Invalid connection: expected object');

  const fromId = asString(c.fromId);
  const toId = asString(c.toId);
  if (!fromId || !toId) throw new Error('Invalid connection: missing fromId/toId');

  const category = typeof c.category === 'string' ? (c.category as EdgeCategory) : undefined;

  return {
    id: asString(c.id) || `${fromId}->${toId}`,
    fromId,
    toId,
    label: typeof c.label === 'string' ? c.label : undefined,
    animated: typeof c.animated === 'boolean' ? c.animated : undefined,
    category: Object.values(EdgeCategory).includes(category as any) ? category : undefined,
  };
}

export function createAgenticFactoryFile(input: {
  nodes: NodeData[];
  connections: Connection[];
  appVersion?: string;
  createdAt?: string;
  views?: Record<string, unknown>;
}): AgenticFactoryFileV1 {
  return {
    schemaVersion: AGENTIC_FACTORY_SCHEMA_VERSION,
    createdAt: input.createdAt || new Date().toISOString(),
    appVersion: input.appVersion,
    nodes: input.nodes,
    connections: input.connections,
    views: input.views,
  };
}

export function isAgenticFactoryFileV1(v: unknown): v is AgenticFactoryFileV1 {
  if (!isObject(v)) return false;
  return v.schemaVersion === 1 && Array.isArray(v.nodes) && Array.isArray(v.connections);
}

export function isLegacyGraph(v: unknown): v is LegacyGraph {
  if (!isObject(v)) return false;
  return Array.isArray(v.nodes) && Array.isArray(v.connections) && v.schemaVersion === undefined;
}

export function parseAgenticFactoryJson(jsonText: string): AgenticFactoryFileV1 {
  const parsed = JSON.parse(jsonText) as unknown;

  if (isAgenticFactoryFileV1(parsed)) {
    return {
      ...parsed,
      schemaVersion: 1,
      createdAt: asString(parsed.createdAt, new Date().toISOString()),
      nodes: parsed.nodes.map(normalizeNode),
      connections: parsed.connections.map(normalizeConnection),
    };
  }

  if (isLegacyGraph(parsed)) {
    return createAgenticFactoryFile({
      nodes: parsed.nodes.map(normalizeNode),
      connections: parsed.connections.map(normalizeConnection),
    });
  }

  throw new Error('Unsupported file format: expected AgenticFactoryFile v1 or legacy {nodes,connections}.');
}

export function serializeAgenticFactoryFile(file: AgenticFactoryFileV1): string {
  return JSON.stringify(file, null, 2);
}

