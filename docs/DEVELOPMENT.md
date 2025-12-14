# Development Guide

This guide covers setting up a development environment, understanding the codebase structure, and contributing to Agentic Factory.

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ (20.x LTS recommended)
- **npm** 9+ or **yarn**
- **Git**
- Code editor (VS Code recommended)
- **Google Gemini API Key** (for AI features)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd agentic-factory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   echo "GEMINI_API_KEY=your_key_here" > .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

### VS Code Setup (Recommended)

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React snippets

**Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Project Structure

```
agentic-factory/
├── components/          # React components
│   ├── Scene.tsx       # 3D scene (Three.js)
│   ├── Sidebar.tsx     # Left sidebar
│   ├── Toolbar.tsx     # Top toolbar
│   ├── PropertyPanel.tsx # Right property panel
│   ├── AssetBlock.tsx  # Individual node component
│   └── ConnectionLine.tsx # Connection line component
├── services/           # Business logic
│   ├── geminiService.ts # AI generation service
│   └── fileFormat.ts   # Import/export handling
├── lib/                # Utilities
│   └── utils.ts        # Helper functions (cn, etc.)
├── src/                # Styles
│   └── globals.css     # Global CSS and Tailwind
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
├── index.tsx           # Application entry point
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Code Organization

### Component Structure

Components follow a functional component pattern with hooks:

```typescript
// Component structure example
import React, { useState, useCallback } from 'react';

interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Callbacks
  const handleAction = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### State Management

State is managed at the `App.tsx` level and passed down as props:

- **Global State**: `App.tsx` manages nodes, connections, selections
- **Local State**: Components manage their own UI state
- **Derived State**: Computed with `useMemo` and `useCallback`

### Service Layer

Services handle business logic and external APIs:

- **geminiService.ts**: AI generation with Google Gemini
- **fileFormat.ts**: File import/export and validation

## Development Workflow

### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes:**
   - Write code following style guidelines
   - Test in browser
   - Check for TypeScript errors

3. **Test your changes:**
   - Manual testing in browser
   - Check different scenarios
   - Test edge cases

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

Follow these guidelines:

**TypeScript:**
- Use interfaces for object shapes
- Avoid `any` - use `unknown` with type guards
- Use proper types for all variables
- Add JSDoc comments for complex functions

**React:**
- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Extract reusable logic to custom hooks

**Naming:**
- Components: PascalCase (`AssetBlock`)
- Functions: camelCase (`handleNodeClick`)
- Constants: UPPER_SNAKE_CASE (`GRID_SIZE`)
- Types/Interfaces: PascalCase (`NodeData`)

### Type Checking

Check for TypeScript errors:

```bash
npx tsc --noEmit
```

### Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Adding New Features

### Adding a New Node Type

1. **Add to enum** (`types.ts`):
   ```typescript
   enum NodeType {
     // ... existing types
     NEW_TYPE = 'NEW_TYPE',
   }
   ```

2. **Add color mapping** (`App.tsx`):
   ```typescript
   const NODE_COLORS: Record<string, string> = {
     // ... existing colors
     [NodeType.NEW_TYPE]: '#color',
   };
   ```

3. **Add to sidebar** (`components/Sidebar.tsx`):
   ```typescript
   const ITEMS = [
     // ... existing items
     { type: NodeType.NEW_TYPE, label: 'New Type', icon: Icon, color: 'bg-color' },
   ];
   ```

4. **Update rendering** (`components/AssetBlock.tsx`):
   - Add rendering logic for new type if needed

### Adding a New Provider

1. **Add to enum** (`types.ts`):
   ```typescript
   enum NodeProvider {
     // ... existing providers
     NEW_PROVIDER = 'NewProvider',
   }
   ```

2. **Update node creation** (`App.tsx`):
   - Add provider assignment logic

3. **Update AI service** (`services/geminiService.ts`):
   - Add provider to system instruction

### Adding a New Template

1. **Add template ID** (`components/Sidebar.tsx`):
   ```typescript
   const TEMPLATES = [
     // ... existing templates
     { id: 'new_template', label: 'New Template', icon: Icon, color: 'bg-color' },
   ];
   ```

2. **Implement template** (`App.tsx`):
   ```typescript
   if (templateId === 'new_template') {
     // Create nodes and connections
   }
   ```

## Testing

### Manual Testing

Currently, testing is manual. Test:

1. **Functionality:**
   - Add/remove nodes
   - Create/delete connections
   - Move nodes
   - Export/import
   - AI generation

2. **Edge Cases:**
   - Empty state
   - Large architectures (50+ nodes)
   - Invalid file imports
   - API errors

3. **Browser Compatibility:**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

### Future Testing

Consider adding:
- Unit tests (Jest + React Testing Library)
- Integration tests
- E2E tests (Playwright/Cypress)
- Visual regression tests

## Debugging

### Browser DevTools

- **Console**: Check for errors and warnings
- **Network**: Monitor API requests
- **Performance**: Profile rendering performance
- **React DevTools**: Inspect component state

### Common Issues

**TypeScript Errors:**
- Check `tsconfig.json` settings
- Ensure types are imported correctly
- Use type guards for unknown types

**Three.js Issues:**
- Check WebGL support
- Verify Three.js version compatibility
- Check camera and scene setup

**State Issues:**
- Use React DevTools to inspect state
- Check for stale closures in callbacks
- Verify state updates are batched correctly

## Performance Optimization

### React Optimization

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Avoid unnecessary re-renders
- Use `React.memo` for expensive components

### Three.js Optimization

- Limit number of rendered nodes
- Use instancing for repeated objects
- Optimize geometry and materials
- Use LOD (Level of Detail) if needed

### Code Splitting

Consider code splitting for:
- Large dependencies
- AI service (if not always needed)
- Complex components

## Dependencies

### Key Dependencies

- **React 19**: UI framework
- **Three.js**: 3D rendering
- **@react-three/fiber**: React Three.js renderer
- **@react-three/drei**: Three.js helpers
- **@google/genai**: Gemini API client
- **Tailwind CSS**: Styling
- **Vite**: Build tool

### Updating Dependencies

1. Check for updates:
   ```bash
   npm outdated
   ```

2. Update carefully:
   ```bash
   npm update
   ```

3. Test thoroughly after updates

4. Check for breaking changes in changelogs

## Build Configuration

### Vite Configuration

`vite.config.ts` handles:
- React plugin
- Environment variables
- Path aliases
- Server configuration

### TypeScript Configuration

`tsconfig.json` defines:
- Compiler options
- Include/exclude paths
- Module resolution
- Type checking rules

### Tailwind Configuration

`tailwind.config.ts` configures:
- Theme extensions
- Custom colors
- Plugins
- Content paths

## Deployment

### Building for Production

```bash
npm run build
```

Output goes to `dist/` directory.

### Environment Variables

Set production environment variables:
- `GEMINI_API_KEY`: Required for AI features

**Note:** Consider using a backend proxy for API keys in production.

### Deployment Platforms

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Code Review Guidelines

When reviewing code:

1. **Functionality**: Does it work as intended?
2. **Code Quality**: Is it clean and maintainable?
3. **Type Safety**: Are types used correctly?
4. **Performance**: Any performance concerns?
5. **Documentation**: Is it documented?
6. **Testing**: Has it been tested?

## Getting Help

- Check [Architecture Documentation](ARCHITECTURE.md)
- Review [API Reference](API.md)
- Search [GitHub Issues](https://github.com/your-org/agentic-factory/issues)
- Ask in discussions or open an issue

## Next Steps

- Read [Contributing Guide](CONTRIBUTING_GUIDE.md) for detailed workflow
- Review [Architecture](ARCHITECTURE.md) for system design
- Check [API Reference](API.md) for service APIs

Happy coding! 💻
