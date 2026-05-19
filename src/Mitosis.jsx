import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Cell } from './Cell.jsx';
import { PhaseLabel } from './PhaseLabel.jsx';

const PHASE_COLORS = ['#FF6B9D', '#FF9F43', '#A29BFE', '#55EFC4', '#74B9FF'];

// Background particle (decorative dot)
const Particle = ({ x, y, r, opacity, color }) => (
  <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} />
);

export const Mitosis = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const totalPhases = 5;
  // 10s × 24fps = 240 frames
  const framesPerPhase = durationInFrames / totalPhases; // 48

  const phase = Math.min(Math.floor(frame / framesPerPhase), totalPhases - 1);
  const phaseFrame = frame - phase * framesPerPhase;
  const phaseProgress = Math.min(phaseFrame / framesPerPhase, 1);

  // Pulse oscillation: ~1Hz sine wave
  const pulseFactor = Math.sin((frame / fps) * Math.PI * 2) * 6;

  // Spring-driven phase transition scale (slight pop at phase start)
  const scaleSpring = spring({
    frame: phaseFrame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
    from: 0.92,
    to: 1,
  });

  const currentColor = PHASE_COLORS[phase];

  // Background colour subtly shifts per phase
  const bgLuma = interpolate(phaseProgress, [0, 1], [10, 12]);

  // Particle fields (static, decorative)
  const particles = [
    { x: 120, y: 300, r: 3, op: 0.15 },
    { x: 960, y: 200, r: 2, op: 0.1 },
    { x: 80, y: 900, r: 4, op: 0.08 },
    { x: 1000, y: 1100, r: 3, op: 0.12 },
    { x: 200, y: 1500, r: 2, op: 0.1 },
    { x: 900, y: 1700, r: 3, op: 0.08 },
    { x: 540, y: 180, r: 2, op: 0.12 },
    { x: 540, y: 1740, r: 2, op: 0.12 },
    { x: 60, y: 1300, r: 5, op: 0.06 },
    { x: 1020, y: 700, r: 4, op: 0.07 },
  ];

  return (
    <div style={{
      width: 1080,
      height: 1920,
      background: `#0a0a1a`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
    }}>
      {/* Ambient gradient that shifts with phase */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 700px 700px at 50% 50%, ${currentColor}11 0%, transparent 70%)`,
        transition: 'background 0.5s ease',
      }} />

      {/* Top vignette */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 300,
        background: 'linear-gradient(to bottom, rgba(10,10,26,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom vignette */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: 400,
        background: 'linear-gradient(to top, rgba(10,10,26,0.95) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* SVG canvas for cell animation */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          transform: `scale(${scaleSpring})`,
          transformOrigin: '50% 50%',
        }}
      >
        {/* Decorative particles */}
        {particles.map((p, i) => (
          <Particle
            key={i}
            x={p.x} y={p.y} r={p.r}
            color={currentColor}
            opacity={p.op * (0.7 + Math.sin(frame / fps * 1.3 + i) * 0.3)}
          />
        ))}

        {/* Horizontal equatorial guide line for metaphase */}
        {phase === 1 && (
          <line
            x1={1080 / 2 - 220}
            y1={1920 / 2}
            x2={1080 / 2 + 220}
            y2={1920 / 2}
            stroke="#A29BFE"
            strokeWidth={1.5}
            strokeDasharray="10 8"
            opacity={interpolate(phaseProgress, [0.3, 0.7], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          />
        )}

        <Cell phase={phase} phaseProgress={phaseProgress} pulseFactor={pulseFactor} />
      </svg>

      {/* Title header */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 0, right: 0,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: '"SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        fontSize: 28,
        fontWeight: 500,
        letterSpacing: '4px',
        textTransform: 'uppercase',
      }}>
        La Mitose
      </div>

      {/* Phase label */}
      <PhaseLabel phase={phase} phaseProgress={phaseProgress} />
    </div>
  );
};
