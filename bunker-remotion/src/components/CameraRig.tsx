import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { interpolate } from 'remotion';
import { SHOTS, FPS } from '../constants';

interface CameraRigProps {
  frame: number;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function CameraRig({ frame }: CameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;

    // ── SHOT 1: Drone fly-through (0–10s) ──────────────────────────────────
    if (frame <= SHOTS.REVEAL_END) {
      const p = easeInOut(frame / SHOTS.REVEAL_END);
      cam.position.set(0, 1.4, interpolate(p, [0, 1], [5.5, 1.8]));
      cam.lookAt(0, 1.5, -2);
      cam.fov = 75;
    }

    // ── SHOT 2: Wide observation push-in (10–25s) ───────────────────────────
    else if (frame <= SHOTS.TRANSFORM_END) {
      const p = easeInOut((frame - SHOTS.REVEAL_END) / (SHOTS.TRANSFORM_END - SHOTS.REVEAL_END));
      const handShake = Math.sin(frame * 0.8) * 0.01;
      cam.position.set(handShake, 2.4, interpolate(p, [0, 1], [1.8, -0.3]));
      cam.lookAt(0, 1.2, -3);
      cam.fov = 65;
    }

    // ── SHOT 3: 360° turntable (25–40s) ────────────────────────────────────
    else if (frame <= SHOTS.ORBIT_END) {
      const p = (frame - SHOTS.TRANSFORM_END) / (SHOTS.ORBIT_END - SHOTS.TRANSFORM_END);
      const angle = p * Math.PI * 2;
      const radius = 5.5;
      cam.position.set(
        Math.sin(angle) * radius,
        1.5,
        Math.cos(angle) * radius
      );
      cam.lookAt(0, 1.2, 0);
      cam.fov = 60;
    }

    // ── SHOT 4a: Control panel macro (40–45s) ──────────────────────────────
    else if (frame <= SHOTS.DETAIL_PANEL_END) {
      const p = (frame - SHOTS.ORBIT_END) / (SHOTS.DETAIL_PANEL_END - SHOTS.ORBIT_END);
      cam.position.set(-5.0 - p * 0.05, 1.4, -1.0);
      cam.lookAt(-5.7, 1.4, -1.0);
      cam.fov = 45;
    }

    // ── SHOT 4b: Bathroom lateral slide (45–50s) ────────────────────────────
    else if (frame <= SHOTS.DETAIL_BATH_END) {
      const p = easeInOut((frame - SHOTS.DETAIL_PANEL_END) / (SHOTS.DETAIL_BATH_END - SHOTS.DETAIL_PANEL_END));
      cam.position.set(interpolate(p, [0, 1], [3.5, 2.5]), 1.1, 3.5);
      cam.lookAt(2.5, 1.0, 2.5);
      cam.fov = 50;
    }

    // ── SHOT 4c: Biometric door (50–55s) ────────────────────────────────────
    else if (frame <= SHOTS.DETAIL_DOOR_END) {
      cam.position.set(1.2, 1.1, 4.0);
      cam.lookAt(1.5, 1.1, 3.9);
      cam.fov = 40;
    }

    // ── SHOT 5: Crane pull-back (55–60s) ────────────────────────────────────
    else {
      const p = easeInOut((frame - SHOTS.DETAIL_DOOR_END) / (SHOTS.FINAL_END - SHOTS.DETAIL_DOOR_END));
      cam.position.set(
        0,
        interpolate(p, [0, 1], [1.5, 4.5]),
        interpolate(p, [0, 1], [-1.5, 8])
      );
      cam.lookAt(0, 0.8, 0);
      cam.fov = interpolate(p, [0, 1], [65, 45]);
    }

    cam.updateProjectionMatrix();
  }, [frame, camera]);

  return null;
}
