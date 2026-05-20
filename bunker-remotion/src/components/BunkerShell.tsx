import React from 'react';
import * as THREE from 'three';

function Wall({ position, size, color = '#3a3a36' }: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

export function BunkerShell() {
  const W = 12, D = 8, H = 3.2, T = 0.3;
  const concrete = '#3e3e3a';

  return (
    <group>
      {/* Floor */}
      <Wall position={[0, -T / 2, 0]} size={[W, T, D]} color={concrete} />
      {/* Ceiling */}
      <Wall position={[0, H + T / 2, 0]} size={[W, T, D]} color={concrete} />
      {/* Left wall */}
      <Wall position={[-W / 2 - T / 2, H / 2, 0]} size={[T, H, D]} color={concrete} />
      {/* Right wall */}
      <Wall position={[W / 2 + T / 2, H / 2, 0]} size={[T, H, D]} color={concrete} />
      {/* Back wall */}
      <Wall position={[0, H / 2, -D / 2 - T / 2]} size={[W, H, T]} color={concrete} />
      {/* Front wall top (above door) */}
      <Wall position={[0, H - 0.25, D / 2 + T / 2]} size={[W, 0.5, T]} color={concrete} />
      {/* Front wall sides */}
      <Wall position={[-4.5, H / 2, D / 2 + T / 2]} size={[3, H, T]} color={concrete} />
      <Wall position={[4.5, H / 2, D / 2 + T / 2]} size={[3, H, T]} color={concrete} />

      {/* Exposed ceiling pipes */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={i} position={[x, H - 0.1, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, D - 1, 8]} />
          <meshStandardMaterial color="#555" roughness={0.6} metalness={0.8} />
        </mesh>
      ))}

      {/* I-beam structural supports */}
      {[-5, -1, 3].map((z, i) => (
        <mesh key={i} position={[0, H - 0.2, z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.3, 0.3, W + 0.5]} />
          <meshStandardMaterial color="#444" roughness={0.5} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
