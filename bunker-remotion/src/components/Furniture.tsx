import React from 'react';
import { interpolate } from 'remotion';

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// ── Bunk Beds ────────────────────────────────────────────────────────────────
export function BunkBeds({ progress }: { progress: number }) {
  const p = easeOut(Math.min(progress, 1));
  const scaleY = interpolate(p, [0, 1], [0.001, 1]);
  const scaleZ = interpolate(Math.max(0, p - 0.3) / 0.7, [0, 1], [0.001, 1]);

  return (
    <group position={[-4.5, 0, -2.5]} scale={[1, scaleY, scaleZ]}>
      {[0.5, 1.65].map((y, i) => (
        <group key={i}>
          {/* Bed frame */}
          <mesh position={[0, y, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 2.1]} />
            <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, y + 0.1, 0]} castShadow>
            <boxGeometry args={[1.0, 0.12, 2.0]} />
            <meshStandardMaterial color="#4a4f38" roughness={0.8} />
          </mesh>
          {/* LED strip under frame */}
          <mesh position={[0, y - 0.05, 0]}>
            <boxGeometry args={[1.0, 0.02, 0.03]} />
            <meshStandardMaterial
              color="#ffb347"
              emissive="#ffb347"
              emissiveIntensity={progress > 0.7 ? 4 : 0}
            />
          </mesh>
        </group>
      ))}
      {/* Vertical posts */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0]} castShadow>
          <boxGeometry args={[0.06, 2.2, 0.06]} />
          <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── Kitchen Unit ─────────────────────────────────────────────────────────────
export function KitchenUnit({ progress }: { progress: number }) {
  const p = easeOut(Math.min(progress, 1));
  const slideX = interpolate(p, [0, 1], [4, 0]);

  return (
    <group position={[3.5 + slideX, 0, -2.8]}>
      {/* Counter */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.4, 0.9, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[2.4, 0.04, 0.8]} />
        <meshStandardMaterial color="#8c9194" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Cabinet above */}
      <mesh position={[0, 1.85, -0.1]} castShadow>
        <boxGeometry args={[2.4, 1.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* Sink cutout (approximated) */}
      <mesh position={[-0.6, 0.94, -0.05]}>
        <boxGeometry args={[0.6, 0.04, 0.5]} />
        <meshStandardMaterial color="#6a6e70" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Under-cabinet LED */}
      <mesh position={[0, 1.25, -0.35]}>
        <boxGeometry args={[2.2, 0.02, 0.04]} />
        <meshStandardMaterial
          color="#4fc3f7"
          emissive="#4fc3f7"
          emissiveIntensity={progress > 0.9 ? 3 : 0}
        />
      </mesh>
    </group>
  );
}

// ── Storage Wall ─────────────────────────────────────────────────────────────
export function StorageWall({ progress }: { progress: number }) {
  const p = easeOut(Math.min(progress, 1));
  const rows = Math.floor(p * 6);

  return (
    <group position={[5.6, 0, 0]}>
      {/* Backplate */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.08, 3.2, 4.0]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      {/* Shelves, revealed row by row */}
      {[0.4, 0.85, 1.3, 1.75, 2.2, 2.65].slice(0, rows).map((y, i) => (
        <mesh key={i} position={[0.2, y, 0]}>
          <boxGeometry args={[0.3, 0.04, 3.9]} />
          <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ── Command Desk ─────────────────────────────────────────────────────────────
export function CommandDesk({ progress }: { progress: number }) {
  const p = easeOut(Math.min(progress, 1));
  const dropY = interpolate(p, [0, 1], [4, 0]);

  return (
    <group position={[0, dropY, -2.8]}>
      {/* Desk body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.8, 0.8, 1.1]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      {/* Desktop surface */}
      <mesh position={[0, 0.81, 0]}>
        <boxGeometry args={[2.8, 0.04, 1.1]} />
        <meshStandardMaterial color="#6a6e70" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Three monitors */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 1.5, -0.35]} castShadow>
            <boxGeometry args={[0.76, 0.48, 0.04]} />
            <meshStandardMaterial
              color="#0a1628"
              emissive="#1565c0"
              emissiveIntensity={progress > 0.9 ? 2.5 : 0}
            />
          </mesh>
          <mesh position={[x, 1.12, -0.32]}>
            <boxGeometry args={[0.05, 0.36, 0.05]} />
            <meshStandardMaterial color="#444" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Hydroponic Wall ───────────────────────────────────────────────────────────
export function HydroponicWall({ progress }: { progress: number }) {
  const p = easeOut(Math.min(progress, 1));
  const glowIntensity = interpolate(p, [0, 1], [0, 5]);

  return (
    <group position={[-5.7, 0, 0]}>
      {/* Frame */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.1, 3.2, 5.0]} />
        <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Plant pods 3×5 grid */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <group key={`${row}-${col}`}>
            <mesh position={[0.22, 0.55 + row * 0.85, -2.0 + col * 1.0]}>
              <boxGeometry args={[0.24, 0.6, 0.76]} />
              <meshStandardMaterial
                color="#2d5a27"
                roughness={0.7}
                emissive="#1a3d16"
                emissiveIntensity={glowIntensity * 0.4}
              />
            </mesh>
            {/* Grow light */}
            <mesh position={[0.22, 0.88 + row * 0.85, -2.0 + col * 1.0]}>
              <boxGeometry args={[0.2, 0.04, 0.6]} />
              <meshStandardMaterial
                color="#ff00aa"
                emissive="#ff00aa"
                emissiveIntensity={glowIntensity}
              />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// ── Smart Panel ───────────────────────────────────────────────────────────────
export function SmartPanel({
  position,
  progress,
}: {
  position: [number, number, number];
  progress: number;
}) {
  const p = easeOut(Math.min(progress, 1));
  const scaleZ = interpolate(p, [0, 1], [0.001, 1]);

  return (
    <mesh position={position} scale={[1, 1, scaleZ]}>
      <boxGeometry args={[0.06, 1.3, 0.9]} />
      <meshStandardMaterial
        color="#0a1628"
        emissive="#1565c0"
        emissiveIntensity={p * 4}
        roughness={0.3}
      />
    </mesh>
  );
}

// ── Water Filtration ──────────────────────────────────────────────────────────
export function WaterFiltration() {
  return (
    <group position={[4.2, 0, -2.5]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.4, 16]} />
        <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0.28, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Indicator LED */}
      <mesh position={[0.27, 0.5, 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}
