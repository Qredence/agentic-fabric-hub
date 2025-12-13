import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { NodeData, Connection } from '../types';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ConnectionLineProps {
  connection: Connection;
  from: NodeData;
  to: NodeData;
  isDarkMode: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ connection, from, to, isDarkMode }) => {
  const curve = useMemo(() => {
    // Offset start/end to be at the "machine ports" (approx height 0.8)
    const start = new THREE.Vector3(from.x, 0.6, from.z);
    const end = new THREE.Vector3(to.x, 0.6, to.z);
    
    if (start.distanceTo(end) < 0.1) return new THREE.LineCurve3(start, end);

    // Create a "Manhattan-ish" curve with rounded corners for that industrial pipe look
    const points: THREE.Vector3[] = [];
    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;
    
    // Simple 3-point Catmull for smooth arc, but let's try to keep it lower to the ground
    // like a conveyor or floor pipe
    const pipeHeight = 0.4; // Low pipe
    
    points.push(start);
    
    // Drop down from machine
    points.push(new THREE.Vector3(start.x, pipeHeight, start.z));
    
    // Midpoint logic - bias towards X or Z based on alignment to create "tracks"
    const dx = Math.abs(end.x - start.x);
    const dz = Math.abs(end.z - start.z);
    
    if (dx > dz) {
        // Move along X first
        points.push(new THREE.Vector3(end.x, pipeHeight, start.z));
    } else {
        // Move along Z first
        points.push(new THREE.Vector3(start.x, pipeHeight, end.z));
    }
    
    // Rise up to target
    points.push(new THREE.Vector3(end.x, pipeHeight, end.z));
    points.push(end);

    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1); // Low tension for tighter corners
  }, [from.x, from.z, to.x, to.z]);

  // Texture for the glowing core
  const texture = useMemo(() => {
     const canvas = document.createElement('canvas');
     canvas.width = 64;
     canvas.height = 1;
     const ctx = canvas.getContext('2d');
     if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 64, 0);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#0ea5e9'); // Sky blue
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 1);
     }
     const t = new THREE.CanvasTexture(canvas);
     t.wrapS = THREE.RepeatWrapping;
     t.wrapT = THREE.RepeatWrapping;
     return t;
  }, []);

  useFrame((state, delta) => {
    if (connection.animated && texture) {
        texture.offset.x -= delta * 0.5; 
    }
  });

  const labelPos = useMemo(() => curve.getPointAt(0.5), [curve]);
  const pipeColor = isDarkMode ? '#334155' : '#cbd5e1'; // Darker grey pipe in dark mode
  const glowColor = '#0ea5e9';

  return (
    <group>
        {/* Outer Glass Pipe */}
        <mesh castShadow receiveShadow>
            <tubeGeometry args={[curve, 64, 0.12, 8, false]} />
            <meshPhysicalMaterial 
                color={pipeColor}
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.1}
                transmission={0.5}
                thickness={0.2}
            />
        </mesh>

        {/* Inner Glowing Core Stream */}
        <mesh>
            <tubeGeometry args={[curve, 64, 0.04, 8, false]} />
            <meshBasicMaterial 
                map={texture}
                color={glowColor}
                transparent
                opacity={connection.animated ? 0.9 : 0.2}
                toneMapped={false}
            />
        </mesh>

        {/* Connector Joints at Ends */}
        <mesh position={[from.x, 0.6, from.z]}>
            <sphereGeometry args={[0.18]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[to.x, 0.6, to.z]}>
            <sphereGeometry args={[0.18]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Label */}
        {connection.label && (
            <Html position={[labelPos.x, labelPos.y + 0.3, labelPos.z]} center zIndexRange={[50, 0]}>
                 <div className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase shadow-sm border backdrop-blur-sm transition-colors ${
                     isDarkMode 
                        ? 'bg-slate-900/80 border-slate-700 text-slate-400' 
                        : 'bg-white/80 border-slate-200 text-slate-500'
                 }`}>
                     {connection.label}
                 </div>
            </Html>
        )}
    </group>
  );
};
