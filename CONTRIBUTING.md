# Contributing to Agentic Factory

Thank you for your interest in contributing to Agentic Factory! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node.js version)

### Suggesting Features

Feature requests are welcome! Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- A clear description of the feature
- Use cases and motivation
- Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key (for AI features)

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/agentic-factory.git
   cd agentic-factory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

### Project Structure

- `components/` - React components
- `services/` - Business logic and API services
- `lib/` - Utility functions
- `src/` - Global styles
- `types.ts` - TypeScript type definitions

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Prefer `const` over `let`, avoid `var`

### React

- Use functional components with hooks
- Keep components small and focused
- Use `useCallback` and `useMemo` appropriately
- Follow React best practices for performance

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (unless escaping)
- Use trailing commas in multi-line objects/arrays
- Use meaningful variable and function names
- Add comments for complex logic

### Example

```typescript
// Good
const handleNodeClick = useCallback((nodeId: string) => {
  setSelectedNode(nodeId);
}, []);

// Bad
const handleNodeClick = (nodeId: any) => {
  setSelectedNode(nodeId);
};
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples

```
feat: add support for custom node colors
fix: resolve connection rendering issue
docs: update API documentation
refactor: simplify node selection logic
```

## Pull Request Process

1. **Update your branch** with the latest changes from `main`
2. **Ensure tests pass** (if applicable)
3. **Check for linting errors**: The CI will check this
4. **Update documentation** for any new features or changes
5. **Write a clear PR description** explaining:
   - What changes were made
   - Why they were made
   - How to test the changes

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Changes tested locally
- [ ] TypeScript types are correct

## Testing

While formal test suites are not yet established, please:

- Test your changes manually in the browser
- Verify different scenarios and edge cases
- Test with different node types and configurations
- Check both light and dark themes

## Architecture Overview

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed overview of the system architecture.

Key concepts:

- **Nodes**: Represent different entities (agents, tools, etc.)
- **Connections**: Represent relationships between nodes
- **Providers**: Categorize nodes by ecosystem (AgentFramework, DSPy, Foundry)
- **3D Scene**: Three.js-based visualization layer

## Getting Help

- Check existing [documentation](docs/)
- Search [existing issues](https://github.com/your-org/agentic-factory/issues)
- Ask questions in discussions or issues

## Recognition

Contributors will be recognized in:
- The project's README (for significant contributions)
- Release notes (for features and fixes)

Thank you for contributing to Agentic Factory! 🚀
