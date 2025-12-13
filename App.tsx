import React, { useState, useCallback, useEffect } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { Toolbar } from './components/Toolbar';
import { NodeData, Connection, NodeType, GRID_SIZE } from './types';
import { generateArchitecture, ArchitectureResponse } from './services/geminiService';
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
      ...(type === NodeType.SURFACE ? { dimensions: { width: 6, depth: 6 } } : {}),
      ...(type === NodeType.ANNOTATION ? { fontSize: 1 } : {})
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedIds(new Set([newNode.id]));
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
    if (selectedIds.has(id)) {
        setNodes(prev => prev.filter(n => !selectedIds.has(n.id)));
        setConnections(prev => prev.filter(c => !selectedIds.has(c.fromId) && !selectedIds.has(c.toId)));
        setSelectedIds(new Set());
    } else {
        setNodes(prev => prev.filter(n => n.id !== id));
        setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    }
  };

  const handleAddConnection = (fromId: string, toId: string) => {
    const newConn: Connection = {
      id: uuidv4(),
      fromId,
      toId,
      animated: true
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
           color: n.color || getColorForType(n.type as NodeType)
        }));
        finalConnections = result.connections.map((c) => ({
           ...c,
           id: c.id || uuidv4(),
           animated: c.animated !== undefined ? c.animated : true,
           label: c.label
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
             color: color,
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
                    animated: c.animated !== undefined ? c.animated : existing.animated
                });
            } else {
                connMap.set(key, {
                    id: c.id || uuidv4(),
                    fromId: c.fromId,
                    toId: c.toId,
                    label: c.label,
                    animated: c.animated !== undefined ? c.animated : true
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
    const data = JSON.stringify({ nodes, connections }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent_fleet.json';
    a.click();
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
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      
      <Sidebar 
        onAddNode={handleAddNode} 
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