# Agentic Factory

<div align="center">

**A 3D visual editor for designing and architecting AI agent systems**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)

</div>

## Overview

Agentic Factory (also known as **Agent Fleet** in the UI) is an interactive 3D visualization tool for designing, organizing, and managing AI agent architectures. Think of it as "Cloudcraft for agents" - a visual way to map out your agentic stack, from orchestrators and sub-agents to DSPy programs and Foundry resources.

### Key Features

- **3D Visualization**: Immersive Three.js-based 3D scene for visualizing agent architectures
- **AI-Powered Generation**: Use Google Gemini AI to generate architectures from natural language prompts
- **Multiple Node Types**: Support for agents, tools, tasks, DSPy modules, strategies, phases, configs, surfaces, and annotations
- **Provider System**: Built-in support for Agent Framework, DSPy, and Foundry ecosystems
- **Templates**: Pre-built templates for common patterns (orchestrator, DSPy programs, Foundry stacks)
- **Export/Import**: Save and load your architectures in `.af.json` format
- **Interactive Editing**: Drag-and-drop nodes, create connections, group nodes into zones
- **Dark/Light Mode**: Automatic theme switching based on system preferences

## Technology Stack

- **Frontend**: React 19, TypeScript
- **3D Rendering**: Three.js via @react-three/fiber and @react-three/drei
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini API (@google/genai)
- **State Management**: React Hooks

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Google Gemini API Key** - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agentic-factory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### Basic Workflow

1. **Add Nodes**: Use the sidebar to add different types of nodes (agents, tools, tasks, etc.)
2. **Create Connections**: Click and drag from one node to another to create connections
3. **Edit Properties**: Select a node to edit its properties in the right panel
4. **Use Templates**: Click template buttons to add pre-configured architecture patterns
5. **AI Generation**: Use the toolbar to generate architectures from natural language prompts
6. **Export/Import**: Save your work as `.af.json` files and import them later

### Node Types

- **AGENT**: AI agents with roles and system prompts
- **TOOL**: External tools and APIs
- **TASK**: Data processing tasks and workflows
- **DSPY_MODULE**: DSPy program specifications
- **CONFIG**: Configuration files and settings
- **PHASE**: Workflow phases and stages
- **STRATEGY**: Decision strategies and routing logic
- **SURFACE**: Grouping zones for visual organization
- **ANNOTATION**: Text labels for documentation

### Connection Categories

- **dataFlow**: Data passing between nodes
- **controlFlow**: Control and execution flow
- **callsTool**: Tool invocation
- **retrievesFrom**: Knowledge retrieval
- **deploysTo**: Deployment relationships
- **dependsOn**: Dependency relationships

## Project Structure

```
agentic-factory/
├── components/          # React components
│   ├── Scene.tsx       # 3D scene rendering
│   ├── Sidebar.tsx     # Node creation sidebar
│   ├── Toolbar.tsx     # Top toolbar
│   ├── PropertyPanel.tsx # Node property editor
│   └── ...
├── services/           # Business logic
│   ├── geminiService.ts # AI generation service
│   └── fileFormat.ts   # Import/export handling
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
├── src/                # Styles
│   └── globals.css     # Global styles
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development setup and guidelines.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- [Getting Started](docs/GETTING_STARTED.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [API Reference](docs/API.md) - Service APIs and type definitions
- [User Guide](docs/USER_GUIDE.md) - Application usage guide
- [Development Guide](docs/DEVELOPMENT.md) - Development environment setup
- [Contributing Guide](docs/CONTRIBUTING_GUIDE.md) - Contribution workflow

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

For security concerns, please see [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Three.js](https://threejs.org/) for 3D rendering
- Powered by [Google Gemini](https://deepmind.google/technologies/gemini/) for AI generation
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## Support

For issues, questions, or contributions, please use the [GitHub Issues](https://github.com/your-org/agentic-factory/issues) page.
