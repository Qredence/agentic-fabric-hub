# User Guide

This guide will help you use Agentic Factory to design and visualize AI agent architectures.

## Overview

Agentic Factory provides an interactive 3D interface for creating, editing, and managing agent architectures. You can add nodes, create connections, use templates, generate architectures with AI, and export/import your work.

## Interface Overview

### Main Components

1. **3D Scene** (Center) - The main visualization area where nodes and connections are displayed
2. **Sidebar** (Left) - Node creation and template buttons
3. **Toolbar** (Top) - AI generation, export/import, and theme toggle
4. **Property Panel** (Right) - Node editing and connection management

## Basic Operations

### Adding Nodes

1. **From Sidebar:**
   - Click any node type button in the left sidebar
   - A new node appears in the 3D scene
   - The node is automatically selected

2. **Available Node Types:**
   - **Config**: Configuration files and settings
   - **DSPy Module**: DSPy program modules
   - **Pipeline Phase**: Workflow phases
   - **Strategy**: Decision strategies
   - **Agent**: AI agents
   - **Tool**: External tools and APIs
   - **Task**: Processing tasks
   - **Zone**: Grouping surfaces
   - **Text**: Annotation labels

### Selecting Nodes

- **Single Selection**: Click on a node
- **Multi-Selection**: Hold `Shift` and click additional nodes
- **Deselect**: Click on empty space in the scene
- **Select All in Group**: Select a surface/zone to see contained nodes

### Moving Nodes

1. Click and hold on a node
2. Drag to move it in the X/Z plane
3. Release to drop the node

**Note:** Nodes snap to a grid for alignment. When moving a surface/zone, all contained nodes move together.

### Editing Node Properties

1. Select a node (or multiple nodes)
2. The Property Panel appears on the right
3. Edit properties:
   - **Label**: Node display name
   - **Metadata**: Custom key-value pairs
   - **Provider**: Ecosystem (AgentFramework, DSPy, Foundry)
   - **Kind**: Provider-specific classification
   - **Position**: X, Z coordinates (Y for vertical layers)

### Deleting Nodes

1. Select the node(s) to delete
2. Click the "Delete" button in the Property Panel
3. Or press `Delete` key (if supported)

**Warning:** Deleting a node also deletes all its connections. Deleting a surface/zone may affect contained nodes.

## Creating Connections

### Method 1: Property Panel

1. Select a source node
2. In the Property Panel, find the "Connections" section
3. Click "Add Connection"
4. Select target node from dropdown
5. Optionally set connection label and category

### Method 2: Direct Connection

1. Select source node
2. Look for connection handles or use keyboard shortcuts
3. Click and drag to target node

### Connection Categories

- **Data Flow**: Data passing between nodes
- **Control Flow**: Execution and control flow
- **Calls Tool**: Tool invocation
- **Retrieves From**: Knowledge retrieval
- **Deploys To**: Deployment relationships
- **Depends On**: Dependency relationships

### Editing Connections

1. Select a node with connections
2. In Property Panel, find the connection
3. Edit label, category, or animation state
4. Remove connection if needed

## Using Templates

Templates provide pre-configured architecture patterns:

### AgentFramework Orchestrator

Creates an orchestrator with sub-agents:
- Orchestrator (main coordinator)
- Planner (planning agent)
- Router (routing agent)
- Retriever (retrieval agent)
- Tool-Caller (tool execution agent)
- Supervisor (supervision agent)

**Use Case:** Multi-agent orchestration patterns

### DSPy Program

Creates a DSPy program structure:
- DSPy Program Spec
- Training Data
- Eval Suite
- Compiled Artifact

**Use Case:** DSPy program development workflows

### Foundry Resources

Creates a Foundry zone with resources:
- Foundry Zone (container)
- Model Endpoint
- Knowledge Base
- AI Search Index
- Foundry Tool

**Use Case:** Microsoft Foundry resource organization

## AI-Powered Generation

### Generating Architectures

1. Click the "Generate" button in the toolbar
2. Enter a natural language prompt describing your desired architecture
3. Click "Generate" or press Enter
4. The AI will create or modify the architecture

### Example Prompts

- "Create an orchestrator with planner and router agents"
- "Add a DSPy program with training data and evaluation suite"
- "Build a Foundry zone with model endpoint and knowledge base"
- "Add a tool-caller agent that uses a search index"

### Generation Modes

- **MERGE**: Adds to or updates existing architecture
- **REPLACE**: Replaces entire architecture

The AI automatically determines the appropriate mode based on your prompt and current state.

### Tips for Better Results

- Be specific about node types and relationships
- Mention provider ecosystems when relevant (AgentFramework, DSPy, Foundry)
- Describe connections and data flow
- Reference existing nodes by label if merging

## Grouping Nodes

### Creating Groups

1. Select multiple nodes (hold `Shift` and click)
2. Click "Group Nodes" in the Property Panel
3. A new surface/zone is created containing the selected nodes

### Working with Groups

- **Move Group**: Click and drag the surface/zone
- **Edit Group**: Select the surface to edit dimensions
- **Ungroup**: Delete the surface (nodes remain)

## Export and Import

### Exporting

1. Click "Export" in the toolbar
2. A `.af.json` file is downloaded
3. File contains complete architecture state

### Importing

1. Click "Import" in the toolbar
2. Select a `.af.json` file
3. Architecture is loaded into the scene

**Note:** Importing replaces the current architecture. Export first if you want to keep it.

### File Format

The `.af.json` format includes:
- Schema version
- Creation timestamp
- All nodes and connections
- Metadata and properties

## Theme

### Switching Themes

- Click the theme toggle in the toolbar
- Or the app automatically follows system preference

### Theme Features

- **Dark Mode**: Dark background with light text
- **Light Mode**: Light background with dark text
- Grid and colors adapt to theme

## Keyboard Shortcuts

(Note: Keyboard shortcuts may vary. Check the application for current shortcuts.)

- `Delete` - Delete selected nodes
- `Shift + Click` - Multi-select
- `Escape` - Deselect all

## Advanced Features

### Vertical Layers

Nodes can be positioned at different Y (vertical) levels:
- Edit Y coordinate in Property Panel
- Useful for layering architectures
- Default is 0 (ground level)

### Node Hierarchy

- Set `parentId` to create parent-child relationships
- Children can be hidden when parent is collapsed
- Useful for organizing complex architectures

### Custom Metadata

Add custom key-value pairs in node metadata:
- Role descriptions
- System prompts
- File paths
- Configuration values
- Any custom data

### Provider and Kind

- **Provider**: Ecosystem (AgentFramework, DSPy, Foundry, Generic)
- **Kind**: Provider-specific classification (e.g., "AgentFramework.Orchestrator")

These help categorize and organize nodes by ecosystem.

## Best Practices

### Organization

1. **Use Zones**: Group related nodes in surfaces/zones
2. **Name Clearly**: Use descriptive labels
3. **Add Annotations**: Use text nodes for documentation
4. **Color Coding**: Use colors to distinguish node types

### Architecture Design

1. **Start Simple**: Begin with core nodes, add complexity gradually
2. **Use Templates**: Leverage templates for common patterns
3. **Document**: Add annotations and metadata
4. **Iterate**: Use AI generation to explore variations

### Performance

1. **Limit Node Count**: Very large architectures (100+ nodes) may impact performance
2. **Group Related Nodes**: Use surfaces to organize
3. **Export Regularly**: Save your work frequently

## Troubleshooting

### Scene Not Responding

- Refresh the page
- Check browser console for errors
- Ensure WebGL is enabled

### Nodes Not Appearing

- Check if nodes are outside visible area
- Reset camera view
- Verify nodes were created (check sidebar)

### AI Generation Fails

- Verify API key is set in `.env.local`
- Check internet connection
- Review prompt clarity
- Check browser console for errors

### Import Fails

- Verify file is valid `.af.json` format
- Check file isn't corrupted
- Ensure schema version is supported

## Tips and Tricks

1. **Quick Templates**: Use templates as starting points, then customize
2. **AI Iteration**: Generate, review, refine prompts, generate again
3. **Export Snapshots**: Export different versions for comparison
4. **Metadata for Documentation**: Use metadata fields for notes
5. **Color Organization**: Use consistent colors for node types

## Next Steps

- Explore [Architecture Documentation](ARCHITECTURE.md) to understand the system
- Check [API Reference](API.md) for advanced usage
- Read [Development Guide](DEVELOPMENT.md) to contribute
- Review [Contributing Guide](CONTRIBUTING_GUIDE.md) for contribution workflow

Happy architecting! 🏗️
