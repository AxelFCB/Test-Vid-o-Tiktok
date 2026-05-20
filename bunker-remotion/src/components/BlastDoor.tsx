import React from 'react';

export function BlastDoor({ open = false }: { open?: boolean }) {
  const angle = open ? -Math.PI * 0.85 : 0;

  return (
    <group position={[0, 0, 3.85]}>
      {/* Door pivot at hinge edge */}
      <group rotation={[0, angle, 0]} position={[-1.2, 0, 0]}>
        <mesh position={[1.2, 1.1, 0]} castShadow>
          <boxGeometry args={[2.4, 2.2, 0.25]} />
          <meshStandardMaterial color="#6a6e70" roughness={0.3} metalness={0.95} />
        </mesh>
        {/* Door handle */}
        <mesh position={[1.8, 1.1, 0.15]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#aaa" roughness={0.2} metalness={1} />
        </mesh>
        {/* Hinges */}
        {[0.4, 1.8].map((z, i) => (
          <mesh key={i} position={[0.04, z, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 8]} />
            <meshStandardMaterial color="#888" roughness={0.2} metalness={1} />
          </mesh>
        ))}
      </group>

      {/* Biometric panel beside door */}
      <mesh position={[1.5, 1.1, -0.05]}>
        <boxGeometry args={[0.18, 0.3, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Fingerprint scanner glow */}
      <mesh position={[1.5, 1.15, -0.025]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshStandardMaterial color="#1565c0" emissive="#4fc3f7" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
