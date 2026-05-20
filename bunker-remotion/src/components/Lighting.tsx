import React from 'react';
import { interpolate } from 'remotion';

interface LightingProps {
  frame: number;
  transformProgress: number;
}

export function BunkerLighting({ frame, transformProgress }: LightingProps) {
  const FPS = 24;

  // Red flicker (0–10s)
  const flickerSeed = Math.sin(frame * 7.3) * 0.4 + Math.sin(frame * 13.1) * 0.3;
  const flickerBase = frame < 240 ? 1 : 0;
  const redIntensity = flickerBase * (0.6 + flickerSeed * 0.4) * 3;

  // Cool strips ramp in 10–25s
  const coolIntensity = interpolate(
    frame, [240, 360, 600], [0, 3, 6],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Warm amber at 17s+
  const warmIntensity = interpolate(
    frame, [17 * FPS, 19 * FPS], [0, 4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hero key at 54s+
  const heroIntensity = interpolate(
    frame, [54 * FPS, 57 * FPS], [0, 5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      {/* Ambient base — very dark */}
      <ambientLight intensity={0.05} color="#0d1520" />

      {/* Red emergency practical — no shadow for speed */}
      <pointLight position={[0, 2.8, 0]} color="#ff2200"
        intensity={redIntensity} distance={14} decay={2} />

      {/* Cool LED strips — 4 point lights along ceiling */}
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <pointLight key={i} position={[x, 3.0, 0]} color="#4fc3f7"
          intensity={coolIntensity} distance={8} decay={2} />
      ))}

      {/* Warm bunk zone */}
      <pointLight position={[-4.5, 2.2, -2.5]} color="#ffb347"
        intensity={warmIntensity} distance={6} decay={2} />

      {/* Screen fill */}
      <pointLight position={[0, 1.8, -2.2]} color="#4fc3f7"
        intensity={interpolate(frame, [22 * FPS, 24 * FPS], [0, 2],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        distance={5} decay={2} />

      {/* Hydroponic grow fill */}
      <pointLight position={[-5, 1.6, 0]} color="#39ff14"
        intensity={interpolate(frame, [23 * FPS, 25 * FPS], [0, 1.5],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        distance={4} decay={2} />

      {/* Hero wide key */}
      <pointLight position={[0, 3.0, 0]} color="#e8f4fd"
        intensity={heroIntensity} distance={18} decay={1} />

      {/* Rim from door crack */}
      {frame < 10 * FPS && (
        <pointLight position={[0, 1.5, 4.5]} color="#ddeeff"
          intensity={1.5} distance={6} decay={2} />
      )}
    </>
  );
}
