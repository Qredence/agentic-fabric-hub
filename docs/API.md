# API Reference

This document provides a comprehensive reference for the Agentic Factory APIs, services, and type definitions.

## Service APIs

### Gemini Service (`services/geminiService.ts`)

#### `generateArchitecture`

Generates an architecture from a natural language prompt using Google Gemini AI.

```typescript
function generateArchitecture(
  prompt: string,
  currentNodes: NodeData[] = [],
  currentConnections: Connection[] = []
): Promise<ArchitectureResponse>
```

**Parameters:**
- `prompt: string` - Natural language description of desired architecture
- `currentNodes: NodeData[]` - Existing nodes (for MERGE operations)
- `currentConnections: Connection[]` - Existing connections (for MERGE operations)

**Returns:**
- `Promise<ArchitectureResponse>` - Generated architecture with action type

**Example:**
```typescript
const response = await generateArchitecture(
  "Create an orchestrator with planner and router agents",
  nodes,
  connections
);
```

**Response Structure:**
```typescript
interface ArchitectureResponse {
  action: 'MERGE' | 'REPLACE';
  nodes: GeneratedNode[];
  connections: GeneratedConnection[];
}
```

**Action Types:**
- `MERGE`: Add to or update existing architecture
- `REPLACE`: Replace entire architecture

#### `generateNodeTexture`

Generates a texture image for a node using Gemini's image generation (future feature).

```typescript
function generateNodeTexture(node: NodeData): Promise<string>
```

**Parameters:**
- `node: NodeData` - Node to generate texture for

**Returns:**
- `Promise<string>` - Data URL of generated texture

### File Format Service (`services/fileFormat.ts`)

#### `createAgenticFactoryFile`

Creates an Agentic Factory file structure from nodes and connections.

```typescript
function createAgenticFactoryFile(input: {
  nodes: NodeData[];
  connections: Connection[];
  appVersion?: string;
  createdAt?: string;
  views?: Record<string, unknown>;
}): AgenticFactoryFileV1
```

**Parameters:**
- `input.nodes: NodeData[]` - Array of nodes
- `input.connections: Connection[]` - Array of connections
- `input.appVersion?: string` - Optional app version
- `input.createdAt?: string` - Optional creation timestamp
- `input.views?: Record<string, unknown>` - Optional view data

**Returns:**
- `AgenticFactoryFileV1` - Complete file structure

**Example:**
```typescript
const file = createAgenticFactoryFile({
  nodes: myNodes,
  connections: myConnections,
  appVersion: '1.0.0'
});
```

#### `parseAgenticFactoryJson`

Parses and validates JSON text into an Agentic Factory file.

```typescript
function parseAgenticFactoryJson(jsonText: string): AgenticFactoryFileV1
```

**Parameters:**
- `jsonText: string` - JSON string to parse

**Returns:**
- `AgenticFactoryFileV1` - Parsed and normalized file

**Throws:**
- `Error` if JSON is invalid or format is unsupported

**Example:**
```typescript
const file = parseAgenticFactoryJson(jsonString);
```

#### `serializeAgenticFactoryFile`

Serializes an Agentic Factory file to JSON string.

```typescript
function serializeAgenticFactoryFile(file: AgenticFactoryFileV1): string
```

**Parameters:**
- `file: AgenticFactoryFileV1` - File to serialize

**Returns:**
- `string` - JSON string

**Example:**
```typescript
const json = serializeAgenticFactoryFile(file);
```

#### `isAgenticFactoryFileV1`

Type guard to check if an object is a valid Agentic Factory file v1.

```typescript
function isAgenticFactoryFileV1(v: unknown): v is AgenticFactoryFileV1
```

#### `isLegacyGraph`

Type guard to check if an object is a legacy graph format.

```typescript
function isLegacyGraph(v: unknown): v is LegacyGraph
```

## Type Definitions

### Core Types (`types.ts`)

#### `NodeType`

Enumeration of all node types.

```typescript
enum NodeType {
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
```

#### `NodeProvider`

Enumeration of provider ecosystems.

```typescript
enum NodeProvider {
  GENERIC = 'Generic',
  AGENT_FRAMEWORK = 'AgentFramework',
  DSPY = 'DSPy',
  FOUNDRY = 'Foundry'
}
```

#### `EdgeCategory`

Enumeration of connection categories.

```typescript
enum EdgeCategory {
  DATA_FLOW = 'dataFlow',
  CONTROL_FLOW = 'controlFlow',
  CALLS_TOOL = 'callsTool',
  RETRIEVES_FROM = 'retrievesFrom',
  DEPLOYS_TO = 'deploysTo',
  DEPENDS_ON = 'dependsOn'
}
```

#### `NodeData`

Complete node data structure.

```typescript
interface NodeData {
  id: string;                              // Required: Unique identifier
  type: NodeType;                          // Required: Node type
  label: string;                           // Required: Display label
  x: number;                               // Required: X position (grid units)
  z: number;                               // Required: Z position (grid units)
  y?: number;                              // Optional: Y position (vertical layer)
  color: string;                           // Required: Node color (hex)
  provider?: NodeProvider;                 // Optional: Ecosystem provider
  kind?: string;                           // Optional: Provider-specific kind
  parentId?: string;                       // Optional: Parent node ID
  collapsed?: boolean;                     // Optional: Collapse state
  metadata?: Record<string, string>;       // Optional: Custom metadata
  textureUrl?: string;                     // Optional: Texture URL
  dimensions?: { width: number; depth: number }; // Optional: For SURFACE nodes
  fontSize?: number;                       // Optional: For ANNOTATION nodes
}
```

**Metadata Fields:**
- `role`: Agent role description
- `systemPrompt`: System prompt for agents
- `model`: Model identifier
- `path`: File path
- `category`: Tool category
- `signature`: DSPy signature
- `optimizer`: DSPy optimizer
- `executor`: Executor type
- `status`: Status information

#### `Connection`

Connection between two nodes.

```typescript
interface Connection {
  id: string;                    // Required: Unique identifier
  fromId: string;                // Required: Source node ID
  toId: string;                  // Required: Target node ID
  label?: string;                // Optional: Connection label
  animated?: boolean;            // Optional: Animation state (default: true)
  category?: EdgeCategory;       // Optional: Connection category
}
```

#### `ArchitectureState`

Complete architecture state.

```typescript
interface ArchitectureState {
  nodes: NodeData[];
  connections: Connection[];
}
```

### File Format Types

#### `AgenticFactoryFileV1`

Version 1 of the Agentic Factory file format.

```typescript
interface AgenticFactoryFileV1 {
  schemaVersion: 1;
  createdAt: string;                      // ISO 8601 timestamp
  appVersion?: string;                     // Optional app version
  nodes: NodeData[];
  connections: Connection[];
  views?: Record<string, unknown>;        // Optional view data
}
```

## Component Props

### `App` Component

Main application component (no external props - manages own state).

### `Scene` Component

```typescript
interface SceneProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedIds: Set<string>;
  onSelectNode: (id: string | null, multi: boolean) => void;
  onMoveNode: (id: string, x: number, z: number) => void;
  isDarkMode: boolean;
}
```

### `Sidebar` Component

```typescript
interface SidebarProps {
  onAddNode: (type: NodeType) => void;
  onAddTemplate: (templateId: string) => void;
  isDarkMode: boolean;
}
```

**Template IDs:**
- `'af_orchestrator'` - Agent Framework orchestrator pattern
- `'dspy_program'` - DSPy program pattern
- `'foundry_stack'` - Foundry resources pattern

### `Toolbar` Component

```typescript
interface ToolbarProps {
  onGenerate: (prompt: string) => Promise<void>;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}
```

### `PropertyPanel` Component

```typescript
interface PropertyPanelProps {
  node: NodeData | null;
  nodes: NodeData[];
  connections: Connection[];
  selectedIds: Set<string>;
  onGroupNodes: () => void;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onRemoveConnection: (id: string) => void;
  onUpdateConnection: (id: string, data: Partial<Connection>) => void;
  isDarkMode: boolean;
}
```

### `AssetBlock` Component

```typescript
interface AssetBlockProps {
  node: NodeData;
  isSelected: boolean;
  onClick: (e: any) => void;
  onDrag: (x: number, z: number) => void;
  isDarkMode: boolean;
}
```

### `ConnectionLine` Component

```typescript
interface ConnectionLineProps {
  connection: Connection;
  fromNode: NodeData;
  toNode: NodeData;
  isDarkMode: boolean;
}
```

## Constants

### `GRID_SIZE`

Grid cell size in Three.js units.

```typescript
const GRID_SIZE = 2;
```

### `AGENTIC_FACTORY_SCHEMA_VERSION`

Current schema version.

```typescript
const AGENTIC_FACTORY_SCHEMA_VERSION = 1;
```

## Utility Functions

### `cn` (`lib/utils.ts`)

Utility function for merging Tailwind CSS classes.

```typescript
function cn(...inputs: ClassValue[]): string
```

**Example:**
```typescript
const className = cn('base-class', isActive && 'active-class', customClass);
```

## Error Handling

### Common Errors

**API Key Missing:**
```typescript
throw new Error("API Key not found");
```

**Invalid File Format:**
```typescript
throw new Error('Unsupported file format: expected AgenticFactoryFile v1 or legacy {nodes,connections}.');
```

**Invalid Node:**
```typescript
throw new Error('Invalid node: missing id');
throw new Error(`Invalid node: unknown type "${type}"`);
```

**Invalid Connection:**
```typescript
throw new Error('Invalid connection: missing fromId/toId');
```

## Best Practices

### Using the API

1. **Always validate inputs** before calling service functions
2. **Handle errors** appropriately in UI
3. **Use TypeScript types** for type safety
4. **Normalize data** when importing from external sources
5. **Check file format version** before parsing

### Type Safety

- Use TypeScript interfaces for all data structures
- Use type guards (`isAgenticFactoryFileV1`) when needed
- Avoid `any` types - use `unknown` and type guards instead

### Performance

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Batch state updates when possible
