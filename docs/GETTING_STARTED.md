# Getting Started

This guide will help you get Agentic Factory up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher recommended)
  - Check your version: `node --version`
  - Download from [nodejs.org](https://nodejs.org/) if needed
- **npm** (comes with Node.js) or **yarn**
  - Check npm version: `npm --version`
- **Google Gemini API Key**
  - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
  - You'll need this for AI-powered architecture generation

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agentic-factory
```

Replace `<repository-url>` with the actual repository URL.

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

This will install all required dependencies including React, Three.js, and other packages.

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Important Security Notes:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Keep your API key secure and private
- Rotate your key if it's accidentally exposed

### 4. Start the Development Server

```bash
npm run dev
```

The application will start and you should see output like:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Agentic Factory interface with a 3D scene.

## First Steps

### 1. Add Your First Node

- Click on any node type in the left sidebar (e.g., "Agent")
- A new node will appear in the 3D scene
- Click and drag to move it around

### 2. Create Connections

- Click on a node to select it
- Look for connection handles or use the property panel
- Connect nodes to show relationships

### 3. Try AI Generation

- Click the "Generate" button in the top toolbar
- Enter a prompt like: "Create an orchestrator with planner and router agents"
- Watch as the AI generates an architecture

### 4. Explore Templates

- Click template buttons in the sidebar:
  - **AgentFramework Orchestrator**: Multi-agent orchestration pattern
  - **DSPy Program**: DSPy program with training and evaluation
  - **Foundry Resources**: Foundry zone with model endpoints and tools

## Verification

To verify everything is working:

1. ✅ Application loads without errors
2. ✅ You can add nodes from the sidebar
3. ✅ Nodes appear in the 3D scene
4. ✅ You can select and move nodes
5. ✅ AI generation works (requires API key)

## Common Issues and Troubleshooting

### Issue: "API Key not found" Error

**Problem:** The application can't find your Gemini API key.

**Solutions:**
1. Ensure `.env.local` exists in the root directory
2. Check that the file contains: `GEMINI_API_KEY=your_key_here`
3. Restart the development server after creating/modifying `.env.local`
4. Verify there are no extra spaces or quotes around the key

### Issue: Port 3000 Already in Use

**Problem:** Another application is using port 3000.

**Solutions:**
1. Stop the other application using port 3000
2. Or modify `vite.config.ts` to use a different port:
   ```typescript
   server: {
     port: 3001, // Change to available port
   }
   ```

### Issue: Dependencies Installation Fails

**Problem:** `npm install` fails with errors.

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Check Node.js version (should be 18+)
5. Try using `yarn` instead of `npm`

### Issue: Build Errors

**Problem:** TypeScript or build errors when running `npm run dev`.

**Solutions:**
1. Check TypeScript version: `npx tsc --version`
2. Ensure all dependencies are installed: `npm install`
3. Check for type errors: `npx tsc --noEmit`
4. Review error messages for specific issues

### Issue: 3D Scene Not Rendering

**Problem:** The 3D scene appears blank or doesn't render.

**Solutions:**
1. Check browser console for errors (F12)
2. Ensure WebGL is supported in your browser
3. Try a different browser (Chrome, Firefox, Edge)
4. Update your graphics drivers
5. Check that Three.js dependencies are installed

### Issue: AI Generation Not Working

**Problem:** AI generation fails or returns errors.

**Solutions:**
1. Verify API key is correct in `.env.local`
2. Check API key has proper permissions
3. Check browser console for error messages
4. Verify internet connection
5. Check Google Gemini API status
6. Ensure API key hasn't exceeded rate limits

### Issue: Import/Export Not Working

**Problem:** Can't import or export `.af.json` files.

**Solutions:**
1. Check browser console for errors
2. Verify file format is valid JSON
3. Ensure file follows Agentic Factory schema
4. Try exporting first, then importing the exported file

## Environment Configuration

### Development Environment

For development, use `.env.local`:

```env
GEMINI_API_KEY=your_development_key
```

### Production Environment

For production builds, set environment variables in your deployment platform:

- **Vercel**: Add in project settings → Environment Variables
- **Netlify**: Add in site settings → Environment variables
- **Docker**: Use `-e` flag or `.env` file
- **Custom**: Set in your hosting platform's environment configuration

**Important:** In production, consider using a backend proxy for API keys instead of exposing them in the client bundle.

## Next Steps

Now that you have Agentic Factory running:

1. **Read the [User Guide](USER_GUIDE.md)** - Learn how to use all features
2. **Explore [Architecture](ARCHITECTURE.md)** - Understand the system design
3. **Check [Development Guide](DEVELOPMENT.md)** - Start contributing
4. **Review [API Reference](API.md)** - Understand the APIs

## Getting Help

If you're still having issues:

1. Check the [GitHub Issues](https://github.com/your-org/agentic-factory/issues) for similar problems
2. Review the [documentation](README.md) for more details
3. Open a new issue with:
   - Your Node.js version
   - Your operating system
   - Error messages from console
   - Steps to reproduce the issue

## System Requirements

### Minimum Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn equivalent)
- **Browser**: Modern browser with WebGL support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **RAM**: 4GB minimum, 8GB recommended
- **Graphics**: WebGL 2.0 support

### Recommended

- **Node.js**: 20.x LTS
- **Browser**: Latest version of Chrome or Firefox
- **RAM**: 16GB for large architectures
- **Graphics**: Dedicated graphics card for better 3D performance

## Additional Resources

- [Node.js Installation Guide](https://nodejs.org/en/download/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)

Happy building! 🚀
