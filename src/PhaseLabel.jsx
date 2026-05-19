import React from 'react';
import { interpolate } from 'remotion';

const PHASE_NAMES = ['Prophase', 'Métaphase', 'Anaphase', 'Télophase', 'Cytocinèse'];
const PHASE_SUBTITLES = [
  'Condensation des chromosomes',
  'Alignement sur la plaque équatoriale',
  'Séparation des chromatides sœurs',
  'Reformation des noyaux',
  'Division du cytoplasme',
];
const PHASE_COLORS = ['#FF6B9D', '#FF9F43', '#A29BFE', '#55EFC4', '#74B9FF'];

export const PhaseLabel = ({ phase, phaseProgress }) => {
  // Fade in during first 0.3, hold, fade out during last 0.2
  const opacity = interpolate(
    phaseProgress,
    [0, 0.15, 0.75, 1.0],
    [0, 1, 1, 0.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    phaseProgress,
    [0, 0.15],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const color = PHASE_COLORS[phase];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: 'none',
      }}
    >
      {/* Phase number indicator */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
      }}>
        {PHASE_NAMES.map((_, i) => (
          <div key={i} style={{
            width: i === phase ? 32 : 10,
            height: 6,
            borderRadius: 3,
            background: i === phase ? color : 'rgba(255,255,255,0.25)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Phase name */}
      <div style={{
        fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: '-1px',
        color: color,
        textShadow: `0 0 40px ${color}88, 0 0 80px ${color}44`,
        lineHeight: 1,
        marginBottom: 16,
      }}>
        {PHASE_NAMES[phase]}
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: '"SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        fontSize: 32,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.5px',
      }}>
        {PHASE_SUBTITLES[phase]}
      </div>
    </div>
  );
};
