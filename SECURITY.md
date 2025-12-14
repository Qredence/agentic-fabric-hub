# Security Policy

## Supported Versions

We actively support the latest version of Agentic Factory. Security updates will be provided for:

- The latest release
- The previous major version (if applicable)

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to [security@your-domain.com] (replace with actual security contact)
2. **Private Security Advisory**: Use GitHub's [private vulnerability reporting](https://github.com/your-org/agentic-factory/security/advisories/new) feature

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

We appreciate responsible disclosure and will credit security researchers who report valid vulnerabilities.

## Security Best Practices

### For Users

1. **API Keys**: Never commit API keys to version control
   - Use `.env.local` for local development (already in `.gitignore`)
   - Use environment variables in production
   - Rotate keys if accidentally exposed

2. **Dependencies**: Keep dependencies up to date
   ```bash
   npm audit
   npm audit fix
   ```

3. **File Imports**: Only import `.af.json` files from trusted sources
   - The file format parser includes validation, but malicious files could still cause issues

4. **Browser Security**: Use modern browsers with security features enabled

### For Contributors

1. **Never commit secrets**:
   - API keys
   - Authentication tokens
   - Private keys
   - Any sensitive credentials

2. **Review dependencies**:
   - Check for known vulnerabilities before adding new packages
   - Use `npm audit` regularly
   - Prefer well-maintained packages

3. **Input validation**:
   - Always validate user input
   - Sanitize data from external sources
   - Use TypeScript types for type safety

4. **Code review**:
   - All PRs require review before merging
   - Pay special attention to security-sensitive code

## Known Security Considerations

### API Key Handling

- API keys are stored in environment variables (`GEMINI_API_KEY`)
- Keys are injected at build time via Vite's `define` configuration
- **Important**: Never expose API keys in client-side code in production
- Consider using a backend proxy for API calls in production deployments

### File Format

- The `.af.json` file format includes validation
- Imported files are parsed and normalized
- Malicious JSON could potentially cause issues - always validate structure

### Dependencies

We regularly update dependencies to address security vulnerabilities. Known issues are tracked and addressed promptly.

### Client-Side Security

This is a client-side application. Be aware that:

- All code is visible in the browser
- API keys in environment variables are accessible in the built bundle
- Consider using a backend service for production deployments requiring API key security

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 1.0.0 → 1.0.1)
- Documented in [CHANGELOG.md](CHANGELOG.md)
- Announced via GitHub releases

## Security Checklist for Releases

Before each release, we verify:

- [ ] Dependencies are up to date
- [ ] No known vulnerabilities in dependencies (`npm audit`)
- [ ] No secrets in code or configuration
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive information

## Contact

For security concerns, please contact: [security@your-domain.com]

Thank you for helping keep Agentic Factory secure!
