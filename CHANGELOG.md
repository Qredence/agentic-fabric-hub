# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation structure in `docs/` folder
- CONTRIBUTING.md with contribution guidelines
- SECURITY.md with security policy
- CODE_OF_CONDUCT.md
- GitHub issue and PR templates
- CI workflow for type checking and builds

### Changed
- Enhanced README.md with comprehensive project documentation
- Improved project structure documentation

## [0.0.0] - Initial Release

### Added
- 3D visualization of agent architectures using Three.js
- Node types: AGENT, TOOL, TASK, DSPY_MODULE, CONFIG, PHASE, STRATEGY, SURFACE, ANNOTATION
- Connection system with categories (dataFlow, controlFlow, callsTool, etc.)
- AI-powered architecture generation using Google Gemini
- Export/import functionality with `.af.json` format
- Pre-built templates (orchestrator, DSPy program, Foundry stack)
- Dark/light theme support
- Interactive node editing and property panels
- Node grouping with surface zones
- Provider system (AgentFramework, DSPy, Foundry)

### Technical
- React 19 with TypeScript
- Vite 6 build system
- Tailwind CSS 4 with shadcn/ui components
- Three.js via @react-three/fiber and @react-three/drei
- Google Gemini API integration

[Unreleased]: https://github.com/your-org/agentic-factory/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/your-org/agentic-factory/releases/tag/v0.0.0
