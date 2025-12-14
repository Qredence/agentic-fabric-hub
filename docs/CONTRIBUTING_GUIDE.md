# Contributing Guide

This guide provides detailed instructions for contributing to Agentic Factory, including workflow, code review process, and best practices.

## Contribution Workflow

### 1. Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/agentic-factory.git
   cd agentic-factory
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-org/agentic-factory.git
   ```

### 2. Create a Branch

Create a branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions
- `chore/` - Maintenance tasks

Examples:
- `feature/add-custom-colors`
- `fix/connection-rendering`
- `docs/update-api-reference`

### 3. Make Changes

1. **Write code** following style guidelines
2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Commit frequently** with clear messages

### 4. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat: add support for custom node colors

Allow users to specify custom colors for nodes in the property panel.
Adds color picker component and updates node data structure.

Closes #123
```

```
fix: resolve connection rendering issue

Connection lines were not appearing correctly when nodes were
moved. Fixed by recalculating connection paths on node movement.

Fixes #456
```

### 5. Push and Create Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request:**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template
   - Submit for review

## Code Review Process

### For Contributors

1. **Wait for Review:**
   - Maintainers will review your PR
   - Address feedback promptly
   - Be open to suggestions

2. **Respond to Feedback:**
   - Make requested changes
   - Push updates to your branch
   - Comment on resolved discussions

3. **Keep PR Updated:**
   - Rebase on `main` if needed:
     ```bash
     git checkout feature/your-feature-name
     git fetch upstream
     git rebase upstream/main
     git push --force-with-lease
     ```

### For Reviewers

1. **Review Promptly:**
   - Aim to review within 48 hours
   - Provide constructive feedback
   - Be respectful and helpful

2. **Check:**
   - Functionality works as described
   - Code follows style guidelines
   - Tests pass (if applicable)
   - Documentation is updated
   - No breaking changes (or documented)

3. **Approve or Request Changes:**
   - Approve if ready to merge
   - Request changes with specific feedback
   - Be clear about what needs fixing

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Changes tested in browser
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with `main`
- [ ] No console errors or warnings
- [ ] Works in both light and dark themes
- [ ] Works with different node types
- [ ] No performance regressions

## Code Style Guidelines

### TypeScript

```typescript
// Good
interface NodeData {
  id: string;
  type: NodeType;
  label: string;
}

const handleClick = useCallback((id: string) => {
  setSelectedNode(id);
}, []);

// Bad
const handleClick = (id: any) => {
  setSelectedNode(id);
};
```

### React

```typescript
// Good - Functional component with hooks
export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initial);
  
  const handleAction = useCallback(() => {
    // Logic
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};

// Bad - Class component or inline functions
class Component extends React.Component {
  // ...
}
```

### Naming

- **Components**: PascalCase (`AssetBlock`)
- **Functions**: camelCase (`handleNodeClick`)
- **Constants**: UPPER_SNAKE_CASE (`GRID_SIZE`)
- **Types/Interfaces**: PascalCase (`NodeData`)
- **Files**: Match export (PascalCase for components)

### Formatting

- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multi-line objects/arrays
- Semicolons (consistent with project)

## Testing Guidelines

### Manual Testing

Test your changes:

1. **Basic Functionality:**
   - Add/remove nodes
   - Create/delete connections
   - Move nodes
   - Export/import

2. **Edge Cases:**
   - Empty state
   - Single node
   - Many nodes (50+)
   - Invalid inputs
   - Error states

3. **Browser Compatibility:**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

4. **Theme Support:**
   - Light mode
   - Dark mode
   - System preference

### Testing Checklist

- [ ] Feature works as described
- [ ] No console errors
- [ ] No visual regressions
- [ ] Works in all supported browsers
- [ ] Works in both themes
- [ ] Handles edge cases gracefully
- [ ] Performance is acceptable

## Documentation Updates

When making changes:

1. **Update README** if:
   - Adding new features
   - Changing setup process
   - Modifying usage instructions

2. **Update API Docs** if:
   - Adding new APIs
   - Changing function signatures
   - Modifying types

3. **Update User Guide** if:
   - Adding new features
   - Changing user-facing behavior

4. **Update Architecture Docs** if:
   - Changing system design
   - Adding new components
   - Modifying data structures

## Issue Management

### Creating Issues

Use issue templates:
- **Bug Report**: For bugs
- **Feature Request**: For new features

Include:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Environment details
- Screenshots if applicable

### Working on Issues

1. **Claim the issue:**
   - Comment that you're working on it
   - Assign yourself (if you have permissions)

2. **Reference in commits:**
   ```
   fix: resolve connection rendering issue

   Fixes #123
   ```

3. **Close when done:**
   - PR will auto-close when merged
   - Or use "Closes #123" in PR description

## Communication

### GitHub Discussions

Use discussions for:
- Questions about implementation
- Design discussions
- General questions

### GitHub Issues

Use issues for:
- Bug reports
- Feature requests
- Documentation improvements

### Pull Request Comments

- Be constructive and respectful
- Ask questions if unclear
- Provide context for decisions
- Thank reviewers for feedback

## Release Process

Releases are managed by maintainers:

1. **Version Bump:**
   - Update `package.json` version
   - Update `CHANGELOG.md`

2. **Create Release:**
   - Tag release
   - Create GitHub release
   - Publish release notes

## Getting Help

If you need help:

1. **Check Documentation:**
   - [Getting Started](GETTING_STARTED.md)
   - [Development Guide](DEVELOPMENT.md)
   - [Architecture](ARCHITECTURE.md)

2. **Search Issues:**
   - Look for similar issues
   - Check closed issues

3. **Ask Questions:**
   - Open a discussion
   - Comment on relevant issues
   - Ask in PR comments

## Recognition

Contributors are recognized:

- In release notes
- In project README (for significant contributions)
- In GitHub contributors list

Thank you for contributing to Agentic Factory! 🎉
