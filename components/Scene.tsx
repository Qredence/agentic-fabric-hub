import React, { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { MapControls, Environment, ContactShadows } from '@react-three/drei';
import { NodeData, Connection, GRID_SIZE } from '../types';
import { AssetBlock } from './AssetBlock';
import { ConnectionLine } from './ConnectionLine';
import * as THREE from 'three';

interface SceneProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedIds: Set<string>;
  onSelectNode: (id: string | null, multi: boolean) => void;
  onMoveNode: (id: string, x: number, z: number) => void;
  isDarkMode: boolean;
}

export const Scene: React.FC<SceneProps> = ({ 
  nodes, 
  connections, 
  selectedIds, 
  onSelectNode, 
  onMoveNode,
  isDarkMode
}) => {
  const [isDragging, setDragging] = useState(false);
  const controlsRef = useRef<any>(null);

  const handleMissed = (e: any) => {
    if (!isDragging) {
        onSelectNode(null, e.shiftKey);
    }
  };

  // Generate Floor Texture
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Theme Colors
    const bgColor = isDarkMode ? '#09090b' : '#f8fafc';
    // Grid colors: #666666 for dark, #cccccc for light
    const lineColor = isDarkMode ? '#666666' : '#cccccc';

    // Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 512);

    // Draw Grid Lines (Border) - Using fillRect for consistent pixel width
    // 2px width on a 512px texture which spans 2 units results in lines approx 0.008 units wide (very thin/crisp)
    ctx.fillStyle = lineColor;

    // Top edge
    ctx.fillRect(0, 0, 512, 2);
    // Left edge
    ctx.fillRect(0, 0, 2, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    
    // 2000 units plane. 2 units per tile (GRID_SIZE). 
    // Repeats = 1000.
    tex.repeat.set(1000, 1000);
    
    // Offset by 0.5 to center the tile so the node sits in the center of the square
    tex.offset.set(0.5, 0.5);
    
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;

    return tex;
  }, [isDarkMode]);

  const canvasBg = isDarkMode ? "bg-[#09090b]" : "bg-[#f8fafc]";

  // Collapse/hierarchy support: if any ancestor is collapsed, the node is hidden.
  const visibleNodes = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const hidden = new Set<string>();

    const isHidden = (nodeId: string) => {
      if (hidden.has(nodeId)) return true;
      const visited = new Set<string>();
      let cur = byId.get(nodeId);
      while (cur?.parentId) {
        if (visited.has(cur.parentId)) break; // cycle guard
        visited.add(cur.parentId);
        const parent = byId.get(cur.parentId);
        if (!parent) break;
        if (parent.collapsed) return true;
        cur = parent;
      }
      return false;
    };

    return nodes.filter((n) => !isHidden(n.id));
  }, [nodes]);

  const visibleNodeById = useMemo(() => new Map(visibleNodes.map((n) => [n.id, n])), [visibleNodes]);

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [30, 30, 30], zoom: 35, near: 0.1, far: 2000 }}
      onPointerMissed={handleMissed}
      className={`${canvasBg} transition-colors duration-500`}
      dpr={[1, 2]}
    >
      <MapControls 
        ref={controlsRef} 
        makeDefault 
        enabled={!isDragging}
        dampingFactor={0.2}
        screenSpacePanning={false}
        minZoom={10}
        maxZoom={100}
      />
      
      {/* Lighting */}
      <ambientLight intensity={isDarkMode ? 0.4 : 0.6} />
      <directionalLight 
        position={[10, 20, 5]} 
        intensity={isDarkMode ? 0.8 : 1.0} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} color={isDarkMode ? "#38bdf8" : "#bae6fd"} />
      
      <Environment preset={isDarkMode ? "city" : "studio"} />

      {/* Minimalist Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial 
            map={floorTexture || undefined} 
            color="white" // Use texture colors directly
            roughness={0.8}
            metalness={0.1}
        />
      </mesh>

      {/* Contact Shadows for grounding objects */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={isDarkMode ? 0.4 : 0.3} 
        scale={60} 
        blur={2.5} 
        far={2} 
        color="#000000" 
      />

      {connections.map(conn => {
        const fromNode = visibleNodeById.get(conn.fromId);
        const toNode = visibleNodeById.get(conn.toId);
        if (fromNode && toNode) {
            return (
              <ConnectionLine 
                key={conn.id} 
                connection={conn} 
                from={fromNode} 
                to={toNode}
                isDarkMode={isDarkMode}
              />
            );
        }
        return null;
      })}

      {visibleNodes.map(node => (
        <AssetBlock
          key={node.id}
          data={node}
          isSelected={selectedIds.has(node.id)}
          onSelect={onSelectNode}
          onMove={onMoveNode}
          isDragging={isDragging}
          setDragging={setDragging}
          isDarkMode={isDarkMode}
        />
      ))}
      
    </Canvas>
  );
};