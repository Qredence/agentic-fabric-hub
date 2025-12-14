# Architecture Overview

This document provides a comprehensive overview of the Agentic Factory system architecture, component structure, and design decisions.

## System Overview

Agentic Factory is a client-side React application that provides a 3D visualization interface for designing AI agent architectures. The application uses Three.js for 3D rendering, React for UI management, and Google Gemini API for AI-powered architecture generation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   App    │  │  Scene   │  │ Sidebar │  │ Toolbar  │ │
│  │  (State) │  │  (3D)    │  │  (UI)   │  │   (UI)   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       │              │              │              │      │
│       └──────────────┴──────────────┴──────────────┘      │
│                          │                                │
└──────────────────────────┼────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────┐
│                    Service Layer                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  geminiService   │  │   fileFormat     │             │
│  │  (AI Generation) │  │  (Import/Export) │             │
│  └──────────────────┘  └──────────────────┘             │
│                          │                                │
└──────────────────────────┼────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────┐
│                    External Services                      │
│  ┌──────────────────┐                                    │
│  │  Google Gemini   │                                    │
│  │      API         │                                    │
│  └──────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

## Component Structure

### Core Components

#### `App.tsx`
The main application component that manages global state and coordinates all other components.

**Responsibilities:**
- State management (nodes, connections, selections)
- Theme management (dark/light mode)
- Event handlers (add, delete, move, update nodes/connections)
- AI generation orchestration
- Import/export handling

**Key State:**
- `nodes: NodeData[]` - All nodes in the scene
- `connections: Connection[]` - All connections between nodes
- `selectedIds: Set<string>` - Currently selected nodes
- `isDarkMode: boolean` - Theme state

#### `Scene.tsx`
The 3D visualization component using Three.js and React Three Fiber.

**Responsibilities:**
- Rendering 3D scene with Three.js Canvas
- Displaying nodes as 3D blocks
- Rendering connections as animated lines
- Handling camera controls
- Managing floor grid and environment
- Node selection and dragging interactions

**Key Features:**
- Grid-based layout system
- Interactive node selection
- Drag-and-drop node movement
- Theme-aware rendering

#### `Sidebar.tsx`
Left sidebar for adding nodes and templates.

**Responsibilities:**
- Displaying node type buttons
- Displaying template buttons
- Triggering node/template creation

#### `Toolbar.tsx`
Top toolbar for global actions.

**Responsibilities:**
- AI generation input
- Export/import buttons
- Theme toggle
- Global actions

#### `PropertyPanel.tsx`
Right panel for editing selected node properties.

**Responsibilities:**
- Displaying node properties
- Editing node metadata
- Managing connections
- Grouping nodes
- Deleting nodes

#### `AssetBlock.tsx`
Individual 3D node representation.

**Responsibilities:**
- Rendering node as 3D mesh
- Handling click events
- Displaying node label
- Showing selection state
- Rendering node-specific visuals (surfaces, annotations)

#### `ConnectionLine.tsx`
3D connection line between nodes.

**Responsibilities:**
- Rendering animated connection lines
- Calculating 3D paths
- Displaying connection labels
- Animating data flow

## Data Models

### Node Types

```typescript
enum NodeType {
  CONFIG = 'CONFIG',           // Configuration files
  DSPY_MODULE = 'DSPY_MODULE', // DSPy program modules
  PHASE = 'PHASE',             // Pipeline phases
  STRATEGY = 'STRATEGY',        // Decision strategies
  AGENT = 'AGENT',              // AI agents
  TOOL = 'TOOL',                // External tools
  TASK = 'TASK',                // Processing tasks
  SURFACE = 'SURFACE',          // Grouping zones
  ANNOTATION = 'ANNOTATION'     // Text labels
}
```

### Node Data Structure

```typescript
interface NodeData {
  id: string;                    // Unique identifier
  type: NodeType;                // Node type
  label: string;                  // Display label
  x: number;                     // X position (grid units)
  z: number;                     // Z position (grid units)
  y?: number;                    // Y position (vertical layer)
  color: string;                 // Node color
  provider?: NodeProvider;       // Ecosystem provider
  kind?: string;                 // Provider-specific kind
  parentId?: string;             // Parent node (hierarchy)
  collapsed?: boolean;           // Collapse state
  metadata?: Record<string, string>; // Custom metadata
  dimensions?: { width: number; depth: number }; // For surfaces
  fontSize?: number;             // For annotations
}
```

### Connection Structure

```typescript
interface Connection {
  id: string;                   // Unique identifier
  fromId: string;               // Source node ID
  toId: string;                 // Target node ID
  label?: string;               // Connection label
  animated?: boolean;           // Animation state
  category?: EdgeCategory;      // Connection category
}
```

### Connection Categories

```typescript
enum EdgeCategory {
  DATA_FLOW = 'dataFlow',        // Data passing
  CONTROL_FLOW = 'controlFlow',  // Control flow
  CALLS_TOOL = 'callsTool',      // Tool invocation
  RETRIEVES_FROM = 'retrievesFrom', // Knowledge retrieval
  DEPLOYS_TO = 'deploysTo',     // Deployment
  DEPENDS_ON = 'dependsOn'       // Dependencies
}
```

### Provider System

```typescript
enum NodeProvider {
  GENERIC = 'Generic',
  AGENT_FRAMEWORK = 'AgentFramework',
  DSPY = 'DSPy',
  FOUNDRY = 'Foundry'
}
```

The provider system allows nodes to be categorized by ecosystem, enabling domain-specific semantics and future integrations.

## Data Flow

### Node Creation Flow

```
User clicks node type in Sidebar
    ↓
Sidebar calls onAddNode(type)
    ↓
App.handleAddNode creates new NodeData
    ↓
App updates nodes state
    ↓
Scene receives new nodes prop
    ↓
Scene renders new AssetBlock components
```

### AI Generation Flow

```
User enters prompt in Toolbar
    ↓
Toolbar calls onGenerate(prompt)
    ↓
App.handleGenerate calls geminiService.generateArchitecture
    ↓
geminiService sends request to Gemini API
    ↓
Gemini returns ArchitectureResponse
    ↓
App processes response (MERGE or REPLACE)
    ↓
App updates nodes and connections state
    ↓
Scene re-renders with new architecture
```

### Export/Import Flow

```
Export:
  App.handleExport
    ↓
  fileFormat.createAgenticFactoryFile
    ↓
  fileFormat.serializeAgenticFactoryFile
    ↓
  Download .af.json file

Import:
  User selects .af.json file
    ↓
  App.handleImport reads file
    ↓
  fileFormat.parseAgenticFactoryJson
    ↓
  App updates nodes and connections
    ↓
  Scene re-renders
```

## File Format

The application uses a custom `.af.json` format for saving and loading architectures.

### Schema Version 1

```typescript
interface AgenticFactoryFileV1 {
  schemaVersion: 1;
  createdAt: string;
  appVersion?: string;
  nodes: NodeData[];
  connections: Connection[];
  views?: Record<string, unknown>;
}
```

The format supports:
- Versioning for future compatibility
- Metadata (creation date, app version)
- Full node and connection data
- Extensible views for future features

## 3D Rendering System

### Three.js Integration

The application uses:
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and abstractions

### Scene Setup

- **Camera**: Perspective camera with MapControls
- **Lighting**: Environment lighting with shadows
- **Floor**: Grid-based floor with theme-aware textures
- **Controls**: Orbit controls for navigation

### Grid System

- Grid size: 2 units
- Nodes positioned on grid coordinates
- Surfaces can span multiple grid cells
- Connections follow grid-aligned paths

## State Management

The application uses React's built-in state management:

- **Local State**: Component-level state with `useState`
- **Lifted State**: Shared state in `App.tsx`
- **Derived State**: Computed values with `useMemo`
- **Event Handlers**: Callbacks passed as props

No external state management library is used, keeping the architecture simple and maintainable.

## Service Layer

### `geminiService.ts`

Handles AI-powered architecture generation:

- **generateArchitecture**: Main function for generating architectures from prompts
- **generateNodeTexture**: Generates textures for nodes (future feature)

Uses Google Gemini API with structured JSON responses.

### `fileFormat.ts`

Handles import/export functionality:

- **createAgenticFactoryFile**: Creates file structure
- **parseAgenticFactoryJson**: Parses and validates JSON
- **serializeAgenticFactoryFile**: Serializes to JSON
- **Normalization**: Validates and normalizes node/connection data

## Design Decisions

### Why Three.js?

- Provides immersive 3D visualization
- Better spatial understanding than 2D diagrams
- Enables future features (layers, animations, VR)

### Why No State Management Library?

- Application state is relatively simple
- React hooks provide sufficient functionality
- Reduces dependencies and complexity

### Why Custom File Format?

- Enables versioning and migration
- Supports future features (views, metadata)
- Maintains compatibility with legacy format

### Why Provider System?

- Enables ecosystem-specific semantics
- Supports future integrations
- Allows domain-specific node kinds

## Future Architecture Considerations

### Potential Enhancements

1. **Backend Service**: For secure API key handling
2. **Collaboration**: Real-time multi-user editing
3. **Version Control**: Git-like versioning for architectures
4. **Plugins**: Extensible provider system
5. **Code Generation**: Generate code from architectures
6. **Validation**: Runtime validation of architectures

### Scalability

The current architecture supports:
- Hundreds of nodes (performance tested)
- Complex connection graphs
- Multiple provider ecosystems

For larger architectures, consider:
- Virtualization for node rendering
- LOD (Level of Detail) for distant nodes
- Spatial indexing for efficient queries
