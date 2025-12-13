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

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  z: number; // We use x/z plane for grid, y is height
  color: string;
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
}

export interface ArchitectureState {
  nodes: NodeData[];
  connections: Connection[];
}

export const GRID_SIZE = 2; // Size of one grid cell unit