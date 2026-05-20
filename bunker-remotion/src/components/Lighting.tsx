import React from 'react';
import { interpolate } from 'remotion';

interface LightingProps {
  frame: number;
  transformProgress: number; // 0→1 from frame 240 to 600
}

export function BunkerLighting({ frame, transformProgress }: LightingProps) {
  const FPS = 24;

  // Red flicker (0–10s)
  const flickerSeed = Math.sin(frame * 7.3) * 0.4 + Math.sin(frame * 13.1) * 0.3;
  const flickerBase = frame < 240 ? 1 : 0;
  const redIntensity = flickerBase * (0.6 + flickerSeed * 0.4) * 80;

  // LED cool strips ramp in at 10–25s
  const coolIntensity = interpolate(
    frame,
    [240, 360, 600],
    [0, 200, 400],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Warm amber at 17s+
  const warmIntensity = interpolate(
    frame,
    [17 * FPS, 19 * FPS],
    [0, 250],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hero key light at 54s+
  const heroIntensity = interpolate(
    frame,
    [54 * FPS, 57 * FPS],
    [0, 600],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      {/* Ambient — near zero */}
      <ambientLight intensity={0.04} color="#101820" />

      {/* Red emergency practical */}
      <pointLight
        position={[0, 2.8, 0]}
        color="#ff2200"
        intensity={redIntensity}
        distance={12}
        decay={2}
        castShadow
      />

      {/* Cool LED ceiling strips */}
      {[-4, -1.5, 1.5, 4].map((x, i) => (
        <rectAreaLight
          key={i}
          position={[x, 3.0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          width={0.12}
          height={3}
          color="#4fc3f7"
          intensity={coolIntensity}
        />
      ))}

      {/* Warm bunk area */}
      <rectAreaLight
        position={[-4.5, 2.4, -2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={0.1}
        height={2.5}
        color="#ffb347"
        intensity={warmIntensity}
      />

      {/* Screen fill (command center) */}
      <pointLight
        position={[0, 1.8, -2.2]}
        color="#4fc3f7"
        intensity={interpolate(frame, [22 * FPS, 24 * FPS], [0, 120], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
        distance={5}
        decay={2}
      />

      {/* Hydroponic grow fill */}
      <pointLight
        position={[-5, 1.6, 0]}
        color="#39ff14"
        intensity={interpolate(frame, [23 * FPS, 25 * FPS], [0, 80], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
        distance={4}
        decay={2}
      />

      {/* Dramatic hero key */}
      <rectAreaLight
        position={[0, 3.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={10}
        height={7}
        color="#e8f4fd"
        intensity={heroIntensity}
      />

      {/* Rim light from door crack (shot 1 only) */}
      {frame < 10 * FPS && (
        <spotLight
          position={[0, 1.5, 5]}
          target-position={[0, 1.5, 3]}
          color="#e8f4fd"
          intensity={60}
          angle={0.3}
          penumbra={0.8}
          distance={8}
        />
      )}
    </>
  );
}
