import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { Canvas } from '@react-three/fiber';
import { SHOTS, FPS, WIDTH, HEIGHT } from '../constants';
import { BunkerShell } from '../components/BunkerShell';
import { BlastDoor } from '../components/BlastDoor';
import {
  BunkBeds,
  KitchenUnit,
  StorageWall,
  CommandDesk,
  HydroponicWall,
  SmartPanel,
  WaterFiltration,
} from '../components/Furniture';
import { BunkerLighting } from '../components/Lighting';
import { CameraRig } from '../components/CameraRig';

function transformProgress(frame: number, startFrame: number, endFrame: number): number {
  return Math.min(1, Math.max(0, (frame - startFrame) / (endFrame - startFrame)));
}

function BunkerScene3D({ frame }: { frame: number }) {
  const doorOpen = frame > 5 * FPS;
  const showFurniture = frame >= SHOTS.REVEAL_END;

  return (
    <>
      <CameraRig frame={frame} />
      <BunkerLighting frame={frame} transformProgress={transformProgress(frame, SHOTS.REVEAL_END, SHOTS.TRANSFORM_END)} />

      <BunkerShell />
      <BlastDoor open={doorOpen} />

      {/* Smart panels */}
      {[
        [-5.55, 1.4, -1.0] as [number,number,number],
        [-5.55, 1.4,  1.0] as [number,number,number],
        [ 5.55, 1.4, -1.0] as [number,number,number],
        [ 5.55, 1.4,  1.0] as [number,number,number],
      ].map((pos, i) => (
        <SmartPanel
          key={i}
          position={pos}
          progress={transformProgress(frame, (10 + i * 0.6) * FPS, (13 + i * 0.6) * FPS)}
        />
      ))}

      {/* Furniture — all animated via their progress props */}
      {showFurniture && (
        <>
          <BunkBeds    progress={transformProgress(frame, 13 * FPS, 17 * FPS)} />
          <KitchenUnit progress={transformProgress(frame, 16 * FPS, 19 * FPS)} />
          <StorageWall progress={transformProgress(frame, 19 * FPS, 22 * FPS)} />
          <CommandDesk progress={transformProgress(frame, 22 * FPS, 24 * FPS)} />
          <HydroponicWall progress={transformProgress(frame, 23 * FPS, 25 * FPS)} />
          <WaterFiltration />
        </>
      )}
    </>
  );
}

export function BunkerComposition() {
  const frame = useCurrentFrame();

  // Text overlay opacity (55–60s)
  const textOpacity = interpolate(
    frame,
    [55 * FPS, 57 * FPS, 60 * FPS],
    [0, 1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Vignette intensity
  const vignetteStrength = 0.55;

  return (
    <div style={{ width: WIDTH, height: HEIGHT, position: 'relative', background: '#000', overflow: 'hidden' }}>

      {/* 3D Canvas */}
      <Canvas
        style={{ width: WIDTH, height: HEIGHT }}
        gl={{ antialias: true, toneMapping: 3 /* ACESFilmic */ }}
        shadows
        camera={{ fov: 75, near: 0.1, far: 100 }}
      >
        <BunkerScene3D frame={frame} />
      </Canvas>

      {/* Post: Vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at center,
          transparent 35%,
          rgba(0,8,16,${vignetteStrength * 0.6}) 70%,
          rgba(0,4,12,${vignetteStrength}) 100%)`,
      }} />

      {/* Post: Teal-orange color grade via CSS filter */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        mixBlendMode: 'color',
        background: 'linear-gradient(160deg, rgba(0,60,80,0.18) 0%, transparent 50%, rgba(100,40,0,0.15) 100%)',
      }} />

      {/* Film grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }} />

      {/* Text overlay */}
      {textOpacity > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: textOpacity,
          color: '#fff',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 200,
          fontSize: 52,
          letterSpacing: 4,
          textShadow: '0 2px 24px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}>
          Would you live here?
        </div>
      )}

      {/* Shot indicator (remove for final render) */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'monospace',
        fontSize: 14,
        pointerEvents: 'none',
      }}>
        {String(Math.floor(frame / FPS)).padStart(2, '0')}:{String(frame % FPS).padStart(2, '0')}
      </div>
    </div>
  );
}
