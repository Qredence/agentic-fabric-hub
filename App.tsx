import React, { useState, useCallback, useEffect } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { Toolbar } from './components/Toolbar';
import { NodeData, Connection, NodeType, GRID_SIZE, NodeProvider, EdgeCategory } from './types';
import { generateArchitecture, ArchitectureResponse } from './services/geminiService';
import { createAgenticFactoryFile, parseAgenticFactoryJson, serializeAgenticFactoryFile } from './services/fileFormat';
import { v4 as uuidv4 } from 'uuid';

// Node color mapping for better maintainability
const NODE_COLORS: Record<string, string> = {
  [NodeType.CONFIG]: '#475569',      // Slate 600
  [NodeType.DSPY_MODULE]: '#ca8a04', // Yellow 600
  [NodeType.PHASE]: '#2563eb',       // Blue 600
  [NodeType.STRATEGY]: '#9333ea',    // Purple 600
  [NodeType.AGENT]: '#db2777',       // Pink 600
  [NodeType.TOOL]: '#059669',        // Emerald 600
  [NodeType.TASK]: '#94a3b8',        // Slate 400
  [NodeType.SURFACE]: '#3f3f46',     // Zinc 700
  [NodeType.ANNOTATION]: '#e4e4e7',  // Zinc 200
};

// Helper to get color for type
const getColorForType = (type: NodeType): string => {
  return NODE_COLORS[type] || '#64748b';
};

export default function App() {
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: '1', type: NodeType.CONFIG, label: 'workflow_config.yaml', x: 0, z: -10, color: getColorForType(NodeType.CONFIG), metadata: { path: 'src/config' } }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Theme State - Initialize from system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine the "primary" selected node for the Property Panel
  const lastSelectedId = Array.from(selectedIds).pop();
  const selectedNode = nodes.find(n => n.id === lastSelectedId) || null;

  const handleSelectNode = useCallback((id: string | null, multi: boolean = false) => {
    if (id === null) {
        if (!multi) setSelectedIds(new Set());
        return;
    }

    setSelectedIds(prev => {
        const next = new Set(multi ? prev : []);
        if (multi && prev.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });
  }, []);

  const handleAddNode = (type: NodeType) => {
    const newNode: NodeData = {
      id: uuidv4(),
      type,
      label: type === NodeType.ANNOTATION ? 'Label Text' : `New ${type}`,
      x: (nodes.length * GRID_SIZE) % 10,
      z: 10,
      color: getColorForType(type),
      provider:
        type === NodeType.DSPY_MODULE
          ? NodeProvider.DSPY
          : type === NodeType.AGENT
            ? NodeProvider.AGENT_FRAMEWORK
            : type === NodeType.SURFACE || type === NodeType.ANNOTATION
              ? NodeProvider.GENERIC
              : NodeProvider.GENERIC,
      kind:
        type === NodeType.DSPY_MODULE
          ? 'DSPy.Module'
          : type === NodeType.AGENT
            ? 'AgentFramework.Agent'
            : type === NodeType.TOOL
              ? 'Tool'
              : type === NodeType.SURFACE
                ? 'Container.Zone'
                : type === NodeType.ANNOTATION
                  ? 'Annotation'
                  : undefined,
      ...(type === NodeType.SURFACE ? { dimensions: { width: 6, depth: 6 } } : {}),
      ...(type === NodeType.ANNOTATION ? { fontSize: 1 } : {})
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedIds(new Set([newNode.id]));
  };

  const handleAddTemplate = (templateId: string) => {
    const mk = (partial: Omit<NodeData, 'id' | 'color'> & { color?: string }): NodeData => {
      const type = partial.type;
      return {
        id: uuidv4(),
        color: partial.color || getColorForType(type),
        ...partial,
      };
    };

    const newNodes: NodeData[] = [];
    const newConnections: Connection[] = [];

    if (templateId === 'af_orchestrator') {
      // Orchestrator with sub-agents (planner/router/retriever/tool-caller/supervisor)
      const orchestrator = mk({
        type: NodeType.AGENT,
        label: 'Orchestrator',
        x: 0,
        z: 0,
        provider: NodeProvider.AGENT_FRAMEWORK,
        kind: 'AgentFramework.Orchestrator',
        metadata: {
          role: 'Coordinates the multi-agent workflow; delegates tasks; merges results.',
          systemPrompt: 'You are the orchestrator. Delegate to specialists and consolidate outputs.',
        },
      });
      newNodes.push(orchestrator);

      const roles = [
        { label: 'Planner', kind: 'AgentFramework.Agent.Planner', x: -6, z: -4 },
        { label: 'Router', kind: 'AgentFramework.Agent.Router', x: -6, z: 4 },
        { label: 'Retriever', kind: 'AgentFramework.Agent.Retriever', x: 6, z: -4 },
        { label: 'Tool-Caller', kind: 'AgentFramework.Agent.ToolCaller', x: 6, z: 4 },
        { label: 'Supervisor', kind: 'AgentFramework.Agent.Supervisor', x: 0, z: 8 },
      ];

      const children = roles.map((r) =>
        mk({
          type: NodeType.AGENT,
          label: r.label,
          x: r.x,
          z: r.z,
          provider: NodeProvider.AGENT_FRAMEWORK,
          kind: r.kind,
          parentId: orchestrator.id,
          metadata: { role: `${r.label} agent role.` },
        }),
      );
      newNodes.push(...children);

      children.forEach((child) => {
        newConnections.push({
          id: uuidv4(),
          fromId: orchestrator.id,
          toId: child.id,
          animated: true,
          category: EdgeCategory.CONTROL_FLOW,
          label: 'delegate',
        });
      });
    } else if (templateId === 'dspy_program') {
      // DSPy program spec + dataset + optimizer + eval suite + compiled model
      const program = mk({
        type: NodeType.DSPY_MODULE,
        label: 'DSPy Program',
        x: 0,
        z: 0,
        provider: NodeProvider.DSPY,
        kind: 'DSPy.ProgramSpec',
        metadata: { signature: 'input -> output', optimizer: 'BootstrapFewShot' },
      });

      const dataset = mk({
        type: NodeType.TASK,
        label: 'Training Data',
        x: -6,
        z: 0,
        provider: NodeProvider.DSPY,
        kind: 'DSPy.Dataset',
        metadata: { path: 'data/train.jsonl' },
      });

      const evalSuite = mk({
        type: NodeType.TASK,
        label: 'Eval Suite',
        x: 6,
        z: 0,
        provider: NodeProvider.DSPY,
        kind: 'DSPy.EvalSuite',
        metadata: { path: 'evals/basic_eval.py' },
      });

      const compiled = mk({
        type: NodeType.CONFIG,
        label: 'Compiled Artifact',
        x: 0,
        z: 6,
        provider: NodeProvider.DSPY,
        kind: 'DSPy.CompiledProgram',
        metadata: { model: 'provider/model-name' },
      });

      newNodes.push(program, dataset, evalSuite, compiled);

      newConnections.push(
        {
          id: uuidv4(),
          fromId: dataset.id,
          toId: program.id,
          animated: true,
          category: EdgeCategory.DEPENDS_ON,
          label: 'trains',
        },
        {
          id: uuidv4(),
          fromId: program.id,
          toId: compiled.id,
          animated: true,
          category: EdgeCategory.DEPLOYS_TO,
          label: 'compiles',
        },
        {
          id: uuidv4(),
          fromId: evalSuite.id,
          toId: program.id,
          animated: true,
          category: EdgeCategory.DEPENDS_ON,
          label: 'evaluates',
        },
      );
    } else if (templateId === 'foundry_stack') {
      // Foundry zone with resources: ModelEndpoint, KnowledgeBase, SearchIndex, Tool
      const zone = mk({
        type: NodeType.SURFACE,
        label: 'Foundry Zone',
        x: 0,
        z: 0,
        provider: NodeProvider.FOUNDRY,
        kind: 'Foundry.Zone',
        dimensions: { width: 16, depth: 12 },
      });

      const modelEndpoint = mk({
        type: NodeType.CONFIG,
        label: 'Model Endpoint',
        x: -4,
        z: -2,
        provider: NodeProvider.FOUNDRY,
        kind: 'Foundry.ModelEndpoint',
        parentId: zone.id,
        metadata: { model: 'gpt-4.1', path: 'foundry/endpoints/model' },
      });

      const kb = mk({
        type: NodeType.TOOL,
        label: 'Knowledge Base',
        x: 4,
        z: -2,
        provider: NodeProvider.FOUNDRY,
        kind: 'Foundry.KnowledgeBase',
        parentId: zone.id,
        metadata: { category: 'search' },
      });

      const index = mk({
        type: NodeType.TOOL,
        label: 'AI Search Index',
        x: 4,
        z: 4,
        provider: NodeProvider.FOUNDRY,
        kind: 'Foundry.SearchIndex',
        parentId: zone.id,
        metadata: { category: 'search' },
      });

      const tool = mk({
        type: NodeType.TOOL,
        label: 'Foundry Tool',
        x: -4,
        z: 4,
        provider: NodeProvider.FOUNDRY,
        kind: 'Foundry.Tool',
        parentId: zone.id,
        metadata: { category: 'custom' },
      });

      newNodes.push(zone, modelEndpoint, kb, index, tool);

      newConnections.push(
        {
          id: uuidv4(),
          fromId: modelEndpoint.id,
          toId: tool.id,
          animated: true,
          category: EdgeCategory.CALLS_TOOL,
          label: 'uses',
        },
        {
          id: uuidv4(),
          fromId: tool.id,
          toId: kb.id,
          animated: true,
          category: EdgeCategory.RETRIEVES_FROM,
          label: 'retrieve',
        },
        {
          id: uuidv4(),
          fromId: kb.id,
          toId: index.id,
          animated: true,
          category: EdgeCategory.DEPENDS_ON,
          label: 'indexed-by',
        },
      );
    }

    if (newNodes.length === 0) return;

    setNodes((prev) => [...prev, ...newNodes]);
    setConnections((prev) => [...prev, ...newConnections]);
    setSelectedIds(new Set([newNodes[0].id]));
  };

  const handleGroupNodes = () => {
    if (selectedIds.size < 2) return;

    const selectedNodes = nodes.filter(n => selectedIds.has(n.id));
    if (selectedNodes.length === 0) return;

    // Calculate bounds including node dimensions
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    selectedNodes.forEach(n => {
       // Estimate half-sizes: Surface has specific dims, others approx 1 unit radius
       const halfWidth = n.dimensions ? n.dimensions.width / 2 : 1;
       const halfDepth = n.dimensions ? n.dimensions.depth / 2 : 1;

       minX = Math.min(minX, n.x - halfWidth);
       maxX = Math.max(maxX, n.x + halfWidth);
       minZ = Math.min(minZ, n.z - halfDepth);
       maxZ = Math.max(maxZ, n.z + halfDepth);
    });

    // Padding (1 grid unit on each side)
    const padding = GRID_SIZE; 
    
    // Calculate Grid-Aligned Center
    let centerX = (minX + maxX) / 2;
    let centerZ = (minZ + maxZ) / 2;
    centerX = Math.round(centerX / GRID_SIZE) * GRID_SIZE;
    centerZ = Math.round(centerZ / GRID_SIZE) * GRID_SIZE;

    // Calculate Required Dimensions
    // Ensure the new surface covers the furthest extents + padding relative to the new center
    const width = Math.max(
        2 * (centerX - (minX - padding)),
        2 * ((maxX + padding) - centerX)
    );
    const depth = Math.max(
        2 * (centerZ - (minZ - padding)),
        2 * ((maxZ + padding) - centerZ)
    );

    const groupNode: NodeData = {
      id: uuidv4(),
      type: NodeType.SURFACE,
      label: 'Group Zone',
      x: centerX,
      z: centerZ,
      color: getColorForType(NodeType.SURFACE),
      dimensions: { width, depth }
    };

    setNodes(prev => [...prev, groupNode]);
    setSelectedIds(new Set([groupNode.id]));
  };

  const handleMoveNode = useCallback((id: string, x: number, z: number) => {
    setNodes(prev => {
      const movingNode = prev.find(n => n.id === id);
      if (!movingNode) return prev;

      const dx = x - movingNode.x;
      const dz = z - movingNode.z;

      if (dx === 0 && dz === 0) return prev;

      const idsToMove = new Set<string>();
      
      if (selectedIds.has(id)) {
        selectedIds.forEach(sid => idsToMove.add(sid));
      } else {
        idsToMove.add(id);
      }

      // Recursive surface containment check
      let addedNew = true;
      while (addedNew) {
        addedNew = false;
        
        // 1) Hierarchy: if a parent moves, move all descendants
        for (const child of prev) {
          if (!idsToMove.has(child.id) && child.parentId && idsToMove.has(child.parentId)) {
            idsToMove.add(child.id);
            addedNew = true;
          }
        }

        // 2) Surface containment: if a surface moves, move everything inside it
        const movingSurfaces = prev.filter(n => 
          idsToMove.has(n.id) && 
          n.type === NodeType.SURFACE && 
          n.dimensions
        );

        for (const surface of movingSurfaces) {
          const halfW = surface.dimensions!.width / 2;
          const halfD = surface.dimensions!.depth / 2;
          const minX = surface.x - halfW;
          const maxX = surface.x + halfW;
          const minZ = surface.z - halfD;
          const maxZ = surface.z + halfD;

          for (const child of prev) {
            if (!idsToMove.has(child.id)) {
               if (child.x >= minX && child.x <= maxX && child.z >= minZ && child.z <= maxZ) {
                 idsToMove.add(child.id);
                 addedNew = true;
               }
            }
          }
        }
      }

      return prev.map(n => {
          if (idsToMove.has(n.id)) {
              return { ...n, x: n.x + dx, z: n.z + dz };
          }
          return n;
      });
    });
  }, [selectedIds]);

  const handleUpdateNode = (id: string, data: Partial<NodeData>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  };

  const handleDeleteNode = (id: string) => {
    const cascadeDelete = (initial: Set<string>, allNodes: NodeData[]) => {
      const toDelete = new Set(initial);
      let addedNew = true;
      while (addedNew) {
        addedNew = false;
        for (const n of allNodes) {
          if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
            toDelete.add(n.id);
            addedNew = true;
          }
        }
      }
      return toDelete;
    };

    // IMPORTANT: do not call setConnections inside setNodes updater.
    // Compute the delete set once, then update states sequentially.
    const initial = selectedIds.has(id) ? new Set(selectedIds) : new Set([id]);
    const toDelete = cascadeDelete(initial, nodes);

    const nextNodes = nodes.filter(n => !toDelete.has(n.id));
    const nextConnections = connections.filter(c => !toDelete.has(c.fromId) && !toDelete.has(c.toId));

    setNodes(nextNodes);
    setConnections(nextConnections);
    setSelectedIds(new Set());
  };

  const handleAddConnection = (fromId: string, toId: string) => {
    const newConn: Connection = {
      id: uuidv4(),
      fromId,
      toId,
      animated: true,
      category: EdgeCategory.DATA_FLOW
    };
    setConnections(prev => [...prev, newConn]);
  };

  const handleRemoveConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };
  
  const handleUpdateConnection = (id: string, data: Partial<Connection>) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const handleGenerate = async (prompt: string) => {
    try {
      const result: ArchitectureResponse = await generateArchitecture(prompt, nodes, connections);
      
      let finalNodes: NodeData[] = [];
      let finalConnections: Connection[] = [];

      if (result.action === 'REPLACE') {
        finalNodes = result.nodes.map((n) => ({
           ...n,
           id: n.id || uuidv4(),
           type: n.type as NodeType,
           color: n.color || getColorForType(n.type as NodeType),
           y: n.y ?? 0
        }));
        finalConnections = result.connections.map((c) => ({
           ...c,
           id: c.id || uuidv4(),
           animated: c.animated !== undefined ? c.animated : true,
           label: c.label,
           category: c.category
        }));
      } else {
        const nodeMap = new Map<string, NodeData>(nodes.map(n => [n.id, n]));
        
        result.nodes.forEach((n) => {
           const existing = nodeMap.get(n.id);
           const color = n.color || (existing ? existing.color : getColorForType(n.type as NodeType));
           
           nodeMap.set(n.id, {
             id: n.id, 
             type: n.type as NodeType,
             label: n.label,
             x: n.x,
             z: n.z,
             y: n.y !== undefined ? n.y : (existing?.y ?? 0),
             color: color,
             provider: n.provider !== undefined ? n.provider : existing?.provider,
             kind: n.kind !== undefined ? n.kind : existing?.kind,
             parentId: n.parentId !== undefined ? n.parentId : existing?.parentId,
             collapsed: n.collapsed !== undefined ? n.collapsed : existing?.collapsed,
             metadata: { ...existing?.metadata, ...n.metadata },
             dimensions: n.dimensions || existing?.dimensions,
             fontSize: n.fontSize || existing?.fontSize
           });
        });
        
        finalNodes = Array.from(nodeMap.values());
        
        const connMap = new Map<string, Connection>();
        
        connections.forEach(c => {
            connMap.set(`${c.fromId}-${c.toId}`, c);
        });
        
        result.connections.forEach(c => {
            const key = `${c.fromId}-${c.toId}`;
            const existing = connMap.get(key);
            
            if (existing) {
                connMap.set(key, {
                    ...existing,
                    label: c.label !== undefined ? c.label : existing.label,
                    animated: c.animated !== undefined ? c.animated : existing.animated,
                    category: c.category !== undefined ? c.category : existing.category
                });
            } else {
                connMap.set(key, {
                    id: c.id || uuidv4(),
                    fromId: c.fromId,
                    toId: c.toId,
                    label: c.label,
                    animated: c.animated !== undefined ? c.animated : true,
                    category: c.category
                });
            }
        });
            
        finalConnections = Array.from(connMap.values());
      }

      setNodes(finalNodes);
      setConnections(finalConnections);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Failed to generate architecture. Check console.');
    }
  };

  const handleExport = () => {
    const file = createAgenticFactoryFile({ nodes, connections });
    const data = serializeAgenticFactoryFile(file);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent_fleet.af.json';
    a.click();
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseAgenticFactoryJson(text);

      const normalizedNodes = parsed.nodes.map((n) => ({
        ...n,
        color: n.color || getColorForType(n.type as NodeType),
      }));

      const normalizedConnections = parsed.connections.map((c) => ({
        ...c,
        animated: c.animated !== undefined ? c.animated : true,
      }));

      setNodes(normalizedNodes);
      setConnections(normalizedConnections);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Failed to import JSON. Ensure it is an Agentic Factory export or legacy {nodes,connections}.');
    }
  };

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
      <Scene 
        nodes={nodes} 
        connections={connections}
        selectedIds={selectedIds}
        onSelectNode={handleSelectNode}
        onMoveNode={handleMoveNode}
        isDarkMode={isDarkMode}
      />
      
      <Toolbar 
        onGenerate={handleGenerate} 
        onExport={handleExport} 
        onImport={handleImport}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      
      <Sidebar 
        onAddNode={handleAddNode} 
        onAddTemplate={handleAddTemplate}
        isDarkMode={isDarkMode} 
      />
      
      <PropertyPanel 
        node={selectedNode}
        nodes={nodes}
        connections={connections}
        selectedIds={selectedIds}
        onGroupNodes={handleGroupNodes}
        onChange={handleUpdateNode}
        onDelete={handleDeleteNode}
        onAddConnection={handleAddConnection}
        onRemoveConnection={handleRemoveConnection}
        onUpdateConnection={handleUpdateConnection}
        isDarkMode={isDarkMode}
      />
      
      <div className="absolute bottom-6 right-6 pointer-events-none z-0">
         <h1 className={`text-4xl font-black select-none tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-zinc-900' : 'text-slate-200'}`}>AGENT FLEET</h1>
      </div>
    </div>
  );
}