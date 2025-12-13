import React, { useRef, useState, useEffect } from 'react';
import { ThreeEvent, useThree, useFrame } from '@react-three/fiber';
import { RoundedBox, Cylinder, Box, Html, Text, Float, Sphere, Octahedron } from '@react-three/drei';
import { NodeData, NodeType, GRID_SIZE } from '../types';
import * as THREE from 'three';

interface AssetBlockProps {
  data: NodeData;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onMove: (id: string, x: number, z: number) => void;
  isDragging: boolean;
  setDragging: (active: boolean) => void;
  isDarkMode: boolean;
}

// Helper to generate a procedural tech grid texture for surfaces
const generateDefaultSurfaceTexture = (isDark: boolean): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Theme Colors
  const bg = isDark ? '#1e293b' : '#f8fafc'; // Slate 800 : Slate 50
  const panel = isDark ? '#0f172a' : '#ffffff'; // Slate 900 : White
  const line = isDark ? '#334155' : '#e2e8f0'; // Slate 700 : Slate 200
  const accent = isDark ? '#475569' : '#cbd5e1'; // Slate 600 : Slate 300

  // 1. Fill Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Main Inset Panel
  const inset = 16;
  ctx.fillStyle = panel;
  ctx.fillRect(inset, inset, 512 - inset * 2, 512 - inset * 2);

  // 3. Grid Lines (2x2 subdivision)
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const mid = 256;
  ctx.moveTo(mid, inset); ctx.lineTo(mid, 512 - inset);
  ctx.moveTo(inset, mid); ctx.lineTo(512 - inset, mid);
  ctx.stroke();

  // 4. Tech Accents (Corners)
  ctx.fillStyle = accent;
  const s = 48; // Corner size
  // Top Left
  ctx.fillRect(inset, inset, s, s);
  ctx.clearRect(inset + 8, inset + 8, s - 16, s - 16); // Hollow it out
  
  // Top Right
  ctx.fillRect(512 - inset - s, inset, s, s);
  ctx.clearRect(512 - inset - s + 8, inset + 8, s - 16, s - 16);

  // Bottom Left
  ctx.fillRect(inset, 512 - inset - s, s, s);
  ctx.clearRect(inset + 8, 512 - inset - s + 8, s - 16, s - 16);

  // Bottom Right
  ctx.fillRect(512 - inset - s, 512 - inset - s, s, s);
  ctx.clearRect(512 - inset - s + 8, 512 - inset - s + 8, s - 16, s - 16);

  // 5. Center Hub
  ctx.beginPath();
  ctx.arc(mid, mid, 24, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mid, mid, 16, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  return canvas.toDataURL();
};

export const AssetBlock: React.FC<AssetBlockProps> = ({ 
  data, 
  isSelected, 
  onSelect, 
  onMove,
  isDragging,
  setDragging,
  isDarkMode
}) => {
  const { gl } = useThree();
  const meshRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let url = data.textureUrl;

    // Fallback generation for Surfaces
    if (!url && data.type === NodeType.SURFACE) {
        url = generateDefaultSurfaceTexture(isDarkMode);
    }

    if (url) {
        new THREE.TextureLoader().load(url, (loadedTex) => {
            loadedTex.colorSpace = THREE.SRGBColorSpace;
            if (data.type === NodeType.SURFACE) {
                loadedTex.wrapS = THREE.RepeatWrapping;
                loadedTex.wrapT = THREE.RepeatWrapping;
                // Calculate repeat based on dimensions. 
                // Assumes texture is designed for approx 2x2 grid units.
                const w = data.dimensions?.width || 4;
                const d = data.dimensions?.depth || 4;
                loadedTex.repeat.set(w / 2, d / 2);
            } else {
                loadedTex.flipY = false;
            }
            setTexture(loadedTex);
        });
    } else {
        setTexture(null);
    }
  }, [data.textureUrl, data.type, data.dimensions, isDarkMode]);
  
  // Drag logic refs
  const dragStartPlane = useRef(new THREE.Vector3());
  const dragStartPos = useRef(new THREE.Vector3());
  const planeIntersect = new THREE.Vector3();
  const planeNormal = new THREE.Vector3(0, 1, 0);
  const plane = new THREE.Plane(planeNormal, 0);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isSelected && !e.shiftKey) {
       onSelect(data.id, false);
    } else {
       onSelect(data.id, e.shiftKey); 
    }
    
    if (meshRef.current) {
        setDragging(true);
        e.ray.intersectPlane(plane, planeIntersect);
        dragStartPlane.current.copy(planeIntersect);
        dragStartPos.current.set(data.x, 0, data.z);
        (gl.domElement as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleDragMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && isSelected) {
        e.stopPropagation();
        e.ray.intersectPlane(plane, planeIntersect);
        const diffX = planeIntersect.x - dragStartPlane.current.x;
        const diffZ = planeIntersect.z - dragStartPlane.current.z;
        let newX = dragStartPos.current.x + diffX;
        let newZ = dragStartPos.current.z + diffZ;
        newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
        newZ = Math.round(newZ / GRID_SIZE) * GRID_SIZE;
        onMove(data.id, newX, newZ);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && isSelected) {
        e.stopPropagation();
        setDragging(false);
        (gl.domElement as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // --- Animation Loop ---
  // Target values based on state
  const targetScale = isDragging && isSelected ? 1.15 : 1.0;
  const targetLift = isDragging && isSelected ? 0.4 : 0;
  const targetOpacity = isDragging && !isSelected ? 0.3 : 1.0;

  useFrame((state, delta) => {
    if (visualRef.current) {
        // Smoothly interpolate scale
        const currentScale = visualRef.current.scale.x;
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 12);
        visualRef.current.scale.setScalar(nextScale);

        // Smoothly interpolate lift (Y position)
        const currentY = visualRef.current.position.y;
        const nextY = THREE.MathUtils.lerp(currentY, targetLift, delta * 12);
        visualRef.current.position.y = nextY;

        // Smoothly interpolate Opacity for all child materials
        visualRef.current.traverse((child) => {
             if (child instanceof THREE.Mesh) {
                 const materials = Array.isArray(child.material) ? child.material : [child.material];
                 materials.forEach((mat) => {
                     // Store initial values to preserve glass/transparent effects
                     if (mat.userData.baseOpacity === undefined) {
                         mat.userData.baseOpacity = mat.opacity;
                         mat.userData.baseTransparent = mat.transparent;
                     }
                     
                     const goalOpacity = mat.userData.baseOpacity * targetOpacity;
                     
                     // If we are resetting to full opacity (1.0 relative), disable transparency 
                     // unless it was originally transparent (like glass)
                     // This prevents sorting issues in normal mode
                     const isResetting = targetOpacity >= 0.99 && Math.abs(mat.opacity - mat.userData.baseOpacity) < 0.05;
                     
                     if (isResetting) {
                         mat.opacity = mat.userData.baseOpacity;
                         mat.transparent = mat.userData.baseTransparent;
                     } else {
                         mat.opacity = THREE.MathUtils.lerp(mat.opacity, goalOpacity, delta * 10);
                         mat.transparent = true; // Must be transparent to fade
                     }
                 });
             }
        });
    }
  });

  const accentColor = data.color || '#64748b';
  
  // -- AESTHETIC CONFIG --
  // Based on the "White Machine" reference
  const baseDarkColor = '#1e293b'; // Slate 800 - The heavy base
  const bodyWhiteColor = isDarkMode ? '#e2e8f0' : '#ffffff'; // The main chassis

  const renderMachine = (children: React.ReactNode, heightScale = 1) => (
    <group>
        {/* Shadow Grounding */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <ringGeometry args={[0.8, 1.2, 32]} />
             <meshBasicMaterial color="#000000" transparent opacity={0.2} toneMapped={false} />
        </mesh>

        {/* 1. Heavy Industrial Base */}
        <RoundedBox args={[1.4, 0.2, 1.4]} radius={0.05} position={[0, 0.1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={baseDarkColor} roughness={0.7} metalness={0.5} />
        </RoundedBox>

        {/* 2. Main Chassis Body */}
        <RoundedBox args={[1.1, 0.8 * heightScale, 1.1]} radius={0.1} position={[0, 0.2 + (0.4 * heightScale), 0]} castShadow receiveShadow>
            <meshStandardMaterial 
                color={bodyWhiteColor} 
                roughness={0.2} 
                metalness={0.1}
            />
        </RoundedBox>

        {/* 3. Accent Strip (Status Light) */}
        <Box args={[1.12, 0.05, 1.12]} position={[0, 0.2 + (0.7 * heightScale), 0]}>
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} toneMapped={false} />
        </Box>

        {/* 4. Front "Vent" or Detail */}
        <Box args={[0.8, 0.4 * heightScale, 0.05]} position={[0, 0.2 + (0.35 * heightScale), 0.56]}>
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.8} />
        </Box>

        {/* 5. Custom Top Geometry */}
        <group position={[0, 0.2 + (0.8 * heightScale), 0]}>
            {children}
        </group>
    </group>
  );

  const renderGeometry = () => {
    switch(data.type) {
        case NodeType.SURFACE:
             const width = data.dimensions?.width || 4;
             const depth = data.dimensions?.depth || 4;
             // Sits between floor (-0.01) and machine base (0.0). 
             // Center at -0.005 with height 0.01 means it occupies -0.01 to 0.0.
             // This effectively "paves" the floor without overlapping the machines.
             return (
                 <group position={[0, -0.005, 0]}>
                     <RoundedBox args={[width, 0.01, depth]} radius={0.05} receiveShadow>
                         <meshStandardMaterial 
                            color={texture ? '#ffffff' : (isDarkMode ? '#334155' : '#f1f5f9')}
                            map={texture || undefined} 
                            roughness={0.8}
                            metalness={0.1}
                         />
                     </RoundedBox>
                     {/* Outline / Rim - subtle, almost flush */}
                     <RoundedBox args={[width + 0.1, 0.005, depth + 0.1]} radius={0.05} position={[0, -0.002, 0]}>
                         <meshStandardMaterial color={baseDarkColor} />
                     </RoundedBox>
                 </group>
             );

        case NodeType.ANNOTATION:
             return (
                 <group position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                     <Text
                        color={isDarkMode ? accentColor : '#334155'}
                        fontSize={data.fontSize || 1}
                        maxWidth={10}
                        lineHeight={1}
                        textAlign="center"
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                        anchorX="center"
                        anchorY="middle"
                     >
                        {data.label}
                     </Text>
                 </group>
             );

        case NodeType.AGENT:
            // ROBOTIC HEAD ON MACHINE
            return renderMachine(
                <group>
                     {/* Head Neck */}
                     <Cylinder args={[0.2, 0.3, 0.2]} position={[0, 0.1, 0]} castShadow>
                        <meshStandardMaterial color="#64748b" />
                     </Cylinder>
                     {/* Head */}
                     <RoundedBox args={[0.5, 0.4, 0.5]} radius={0.1} position={[0, 0.4, 0]} castShadow>
                         <meshStandardMaterial color={bodyWhiteColor} />
                     </RoundedBox>
                     {/* Visor */}
                     <Box args={[0.4, 0.15, 0.05]} position={[0, 0.4, 0.26]}>
                         <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1} />
                     </Box>
                     {/* Antenna */}
                     <Cylinder args={[0.02, 0.02, 0.3]} position={[0.15, 0.7, 0]}>
                         <meshStandardMaterial color="#94a3b8" />
                     </Cylinder>
                </group>,
                1.1
            );

        case NodeType.TOOL:
            // MECHANICAL ARM OR GEAR
            return renderMachine(
                <group>
                     {/* Top Mount */}
                     <Cylinder args={[0.4, 0.5, 0.2]} position={[0, 0.1, 0]}>
                        <meshStandardMaterial color="#64748b" />
                     </Cylinder>
                     {/* Floating Hologram Icon */}
                     <Float speed={4} rotationIntensity={0} floatIntensity={0.5}>
                        <Box args={[0.4, 0.4, 0.4]} position={[0, 0.6, 0]} rotation={[Math.PI/4, Math.PI/4, 0]}>
                            <meshStandardMaterial color={accentColor} wireframe />
                        </Box>
                        <Box args={[0.2, 0.2, 0.2]} position={[0, 0.6, 0]}>
                             <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
                        </Box>
                     </Float>
                </group>,
                0.9
            );

        case NodeType.STRATEGY:
            // BRANCHING PIPES / NODE
            return renderMachine(
                <group position={[0, 0.2, 0]}>
                     <RoundedBox args={[0.2, 0.6, 0.2]} radius={0.05} position={[0, 0.3, 0]}>
                        <meshStandardMaterial color={accentColor} />
                     </RoundedBox>
                     <RoundedBox args={[0.8, 0.15, 0.15]} radius={0.02} position={[0, 0.3, 0]}>
                        <meshStandardMaterial color={accentColor} />
                     </RoundedBox>
                     <RoundedBox args={[0.15, 0.15, 0.8]} radius={0.02} position={[0, 0.3, 0]}>
                        <meshStandardMaterial color={accentColor} />
                     </RoundedBox>
                     {/* Glass Dome */}
                     <Sphere args={[0.45]} position={[0, 0.1, 0]}>
                        <meshPhysicalMaterial 
                            color="white" 
                            transmission={0.6} 
                            opacity={0.5} 
                            thickness={0.5} 
                            roughness={0.1} 
                            clearcoat={1}
                            transparent // Always transparent
                        />
                     </Sphere>
                </group>,
                0.9
            );

        case NodeType.PHASE:
            // FLAT PLATFORM STAGE
            return (
                <group position={[0, 0.15, 0]}>
                    <Cylinder args={[1.4, 1.5, 0.3, 6]} castShadow receiveShadow>
                        <meshStandardMaterial color={baseDarkColor} />
                    </Cylinder>
                    <Cylinder args={[1.2, 1.2, 0.31, 6]}>
                        <meshStandardMaterial color={bodyWhiteColor} />
                    </Cylinder>
                    <Cylinder args={[1.22, 1.22, 0.05, 6]} position={[0, 0.1, 0]}>
                        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
                    </Cylinder>
                </group>
            );

        case NodeType.CONFIG:
             // SERVER RACK STYLE
             return renderMachine(
                 <group position={[0, 0.1, 0]}>
                     <Box args={[0.8, 0.6, 0.05]} position={[0, 0.3, 0.4]}>
                         <meshStandardMaterial color="#1e293b" />
                     </Box>
                     {/* Server Lights */}
                     {[0.5, 0.4, 0.3, 0.2].map((y, i) => (
                         <Box key={i} args={[0.7, 0.02, 0.06]} position={[0, y, 0.41]}>
                             <meshStandardMaterial color={i % 2 === 0 ? '#10b981' : '#3b82f6'} emissiveIntensity={2} toneMapped={false} />
                         </Box>
                     ))}
                 </group>,
                 1.2
             );
             
        case NodeType.DSPY_MODULE:
             // ADVANCED CALCULATION UNIT
             return renderMachine(
                 <group position={[0, 0.2, 0]}>
                     <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                        <Octahedron args={[0.4]} position={[0, 0.4, 0]}>
                             <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.1} />
                        </Octahedron>
                     </Float>
                     {/* Energy Ring */}
                     <mesh position={[0, 0.4, 0]} rotation={[Math.PI/2, 0, 0]}>
                         <ringGeometry args={[0.5, 0.55, 32]} />
                         <meshBasicMaterial color={accentColor} transparent opacity={0.5} side={THREE.DoubleSide} />
                     </mesh>
                 </group>,
                 1.0
             );

        default:
             // GENERIC BOX
             return renderMachine(null, 1.0);
    }
  };

  return (
    <>
      <group 
        ref={meshRef} 
        position={[data.x, 0, data.z]} 
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
          {/* Visual container that handles scale/lift animations */}
          <group ref={visualRef}>
              {renderGeometry()}

              {/* Selection Ring */}
              {isSelected && data.type !== NodeType.ANNOTATION && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.6, 1.75, 64]} />
                  <meshBasicMaterial color={accentColor} toneMapped={false} />
                </mesh>
              )}
          </group>

          {/* Clean "Pill" Label - Outside visual scale but inside position group */}
          {data.type !== NodeType.ANNOTATION && data.type !== NodeType.SURFACE && (
              <Html position={[0, 2.5, 0]} center pointerEvents="none" zIndexRange={[100, 0]}>
                  <div className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border transition-all duration-300 pointer-events-none select-none
                      ${isSelected ? 'scale-110' : hovered ? 'scale-105' : 'scale-100'}
                      ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-200'}
                      ${(isDragging && !isSelected) ? 'opacity-30 blur-[1px]' : 'opacity-90'}
                  `}>
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }}></div>
                      <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {data.label}
                      </span>
                  </div>
              </Html>
          )}
      </group>

      {isDragging && isSelected && (
        <mesh
            visible={false}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={handleDragMove}
            onPointerUp={handlePointerUp}
        >
            <planeGeometry args={[1000, 1000]} />
        </mesh>
      )}
    </>
  );
};