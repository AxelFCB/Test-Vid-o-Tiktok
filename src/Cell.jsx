import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';

// Chromosome pair SVG element
const Chromosome = ({ x, y, angle, color, glowIntensity, scale = 1 }) => {
  const glowColor = color;
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle}) scale(${scale})`}>
      <defs>
        <filter id={`glow-${x}-${y}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowIntensity * 6} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse
        cx={0}
        cy={-18}
        rx={7}
        ry={16}
        fill={color}
        filter={`url(#glow-${x}-${y})`}
        opacity={0.9}
      />
      <ellipse
        cx={0}
        cy={18}
        rx={7}
        ry={16}
        fill={color}
        filter={`url(#glow-${x}-${y})`}
        opacity={0.9}
      />
      <rect x={-4} y={-4} width={8} height={8} rx={2} fill={color} opacity={0.95} />
    </g>
  );
};

// Spindle fiber line
const SpindleFiber = ({ x1, y1, x2, y2, opacity, color = '#88aaff' }) => (
  <line
    x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={color}
    strokeWidth={1.5}
    strokeDasharray="4 3"
    opacity={opacity}
  />
);

export const Cell = ({
  phase,        // 0..4
  phaseProgress, // 0..1 within the phase
  pulseFactor,   // small oscillation
}) => {
  const W = 1080;
  const H = 1920;
  const cx = W / 2;
  const cy = H / 2;

  // Phase colour palettes
  const chromosomeColors = ['#FF6B9D', '#FF9F43', '#A29BFE', '#55EFC4', '#74B9FF'];
  const color = chromosomeColors[phase];

  // ── 0 PROPHASE ──────────────────────────────────────────────────────────────
  // Cell intact; chromosomes condense and appear from scattered dots
  const prophaseCellRx = 240 + pulseFactor * 8;
  const prophaseCellRy = 260 + pulseFactor * 8;

  // ── 1 METAPHASE ─────────────────────────────────────────────────────────────
  // Chromosomes align on equatorial plate; spindle fibers appear
  const metaphaseProgress = phase === 1 ? phaseProgress : phase > 1 ? 1 : 0;

  // ── 2 ANAPHASE ──────────────────────────────────────────────────────────────
  // Chromosomes pulled apart toward poles; cell elongates
  const anaphaseSeparation = phase === 2 ? phaseProgress * 160 : phase > 2 ? 160 : 0;
  const anaphaseCellRy = phase >= 2
    ? interpolate(phase === 2 ? phaseProgress : 1, [0, 1], [260, 380])
    : 260;

  // ── 3 TELOPHASE ─────────────────────────────────────────────────────────────
  // Two nuclei reform; cell pinches
  const telophaseProgress = phase === 3 ? phaseProgress : phase > 3 ? 1 : 0;
  const pinchAmount = interpolate(telophaseProgress, [0, 1], [0, 1]);

  // ── 4 CYTOKINESIS ───────────────────────────────────────────────────────────
  // Two daughter cells separate
  const cytokinesisProgress = phase === 4 ? phaseProgress : 0;
  const daughterSeparation = interpolate(cytokinesisProgress, [0, 1], [0, 200]);

  // ── Cell body ───────────────────────────────────────────────────────────────
  const cellRx = phase >= 2 ? 200 + pulseFactor * 4 : prophaseCellRx;
  const cellRy = phase >= 2 ? anaphaseCellRy : prophaseCellRy;

  // Glow intensity driven by pulseFactor
  const glowBase = 0.6 + pulseFactor * 0.015;
  const chromoGlow = 0.5 + pulseFactor * 0.02;

  // ── Chromosome positions per phase ─────────────────────────────────────────
  // 4 chromosome pairs
  const chromoPairs = [
    { baseX: -70, baseY: -60, angle: 20, color: color },
    { baseX: 70, baseY: -60, angle: -20, color: color },
    { baseX: -70, baseY: 60, angle: -30, color: color },
    { baseX: 70, baseY: 60, angle: 30, color: color },
  ];

  const getChromoPos = (pair, index) => {
    if (phase === 0) {
      // Prophase: chromosomes scattered, condensing from nothing
      const scatter = interpolate(phaseProgress, [0, 1], [0, 1]);
      return { x: pair.baseX * scatter, y: pair.baseY * scatter, angle: pair.angle, scale: scatter };
    }
    if (phase === 1) {
      // Metaphase: align to equatorial plate (y = 0)
      const alignY = interpolate(phaseProgress, [0, 1], [pair.baseY, 0]);
      const alignAngle = interpolate(phaseProgress, [0, 1], [pair.angle, 90]);
      const alignX = interpolate(phaseProgress, [0, 1], [pair.baseX, (index % 2 === 0 ? -1 : 1) * (30 + index * 20)]);
      return { x: alignX, y: alignY, angle: alignAngle, scale: 1 };
    }
    if (phase === 2) {
      // Anaphase: split and move to poles
      const metaX = (index % 2 === 0 ? -1 : 1) * (30 + index * 20);
      const poleY = index < 2 ? -anaphaseSeparation : anaphaseSeparation;
      return { x: metaX, y: poleY, angle: 90, scale: 1 };
    }
    if (phase === 3) {
      // Telophase: chromosomes at poles, decondensing
      const poleY = index < 2 ? -160 : 160;
      const decondense = interpolate(phaseProgress, [0, 1], [1, 0.4]);
      const metaX = (index % 2 === 0 ? -1 : 1) * (30 + index * 20);
      return { x: metaX, y: poleY, angle: 90, scale: decondense };
    }
    // Cytokinesis: fade out
    const poleY = index < 2 ? -160 - daughterSeparation / 2 : 160 + daughterSeparation / 2;
    const metaX = (index % 2 === 0 ? -1 : 1) * (30 + index * 20);
    return { x: metaX, y: poleY, angle: 90, scale: 0.4 };
  };

  // ── Nucleus ─────────────────────────────────────────────────────────────────
  const nucleusOpacity = phase === 0
    ? interpolate(phaseProgress, [0, 0.5], [1, 0], { extrapolateRight: 'clamp' })
    : phase === 3
    ? interpolate(phaseProgress, [0.4, 1], [0, 0.8], { extrapolateLeft: 'clamp' })
    : phase === 4 ? 0.8 : 0;

  const nucleusScale = phase === 0
    ? interpolate(phaseProgress, [0, 0.5], [1, 0], { extrapolateRight: 'clamp' })
    : 1;

  // Two daughter nuclei for telophase/cytokinesis
  const nucleusY1 = phase >= 3 ? -160 - daughterSeparation / 2 : 0;
  const nucleusY2 = phase >= 3 ? 160 + daughterSeparation / 2 : 0;

  // ── Cleavage furrow (cytokinesis) ───────────────────────────────────────────
  const furrowProgress = phase === 4 ? phaseProgress : 0;
  const furrowWidth = interpolate(furrowProgress, [0, 1], [cellRx * 2, 0]);

  // ── Spindle fibers ──────────────────────────────────────────────────────────
  const spindleOpacity = phase === 1
    ? interpolate(phaseProgress, [0.2, 0.8], [0, 1])
    : phase === 2 ? interpolate(phaseProgress, [0, 0.6], [1, 0])
    : 0;

  // ── Daughter cells offset (cytokinesis) ─────────────────────────────────────
  const d1OffsetY = phase === 4 ? -daughterSeparation / 2 : 0;
  const d2OffsetY = phase === 4 ? daughterSeparation / 2 : 0;
  const singleCellOpacity = phase === 4 ? interpolate(phaseProgress, [0, 0.3], [1, 0]) : 1;
  const daughterCellOpacity = phase === 4 ? interpolate(phaseProgress, [0.2, 0.7], [0, 1]) : 0;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {/* ── Main cell body ── */}
      {phase < 4 && (
        <g opacity={singleCellOpacity}>
          <defs>
            <filter id="cell-glow">
              <feGaussianBlur stdDeviation={glowBase * 12} result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="cell-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </radialGradient>
          </defs>
          {/* Outer membrane glow */}
          <ellipse cx={0} cy={0} rx={cellRx + 12} ry={cellRy + 12}
            fill="none" stroke={color} strokeWidth={3} opacity={0.25} filter="url(#cell-glow)" />
          {/* Cell membrane */}
          <ellipse cx={0} cy={0} rx={cellRx} ry={cellRy}
            fill="url(#cell-grad)" stroke={color} strokeWidth={2.5} opacity={0.85} />

          {/* Cleavage furrow for late telophase */}
          {phase === 3 && (
            <rect
              x={-cellRx}
              y={-interpolate(telophaseProgress, [0.5, 1], [0, 20], { extrapolateLeft: 'clamp' })}
              width={cellRx * 2}
              height={interpolate(telophaseProgress, [0.5, 1], [0, 40], { extrapolateLeft: 'clamp' })}
              fill="#0a0a1a"
              opacity={interpolate(telophaseProgress, [0.5, 1], [0, 0.8], { extrapolateLeft: 'clamp' })}
            />
          )}

          {/* Single nucleus (prophase → disappears) */}
          <g opacity={nucleusOpacity} transform={`scale(${nucleusScale})`}>
            <circle cx={0} cy={0} r={80} fill="none"
              stroke="#8888ff" strokeWidth={2} strokeDasharray="8 4" opacity={0.7} />
            <circle cx={0} cy={0} r={75} fill="#8888ff" opacity={0.06} />
          </g>

          {/* Two nuclei (telophase) */}
          {phase === 3 && (
            <>
              <g opacity={nucleusOpacity}>
                <circle cx={0} cy={nucleusY1} r={60} fill="none"
                  stroke="#8888ff" strokeWidth={2} strokeDasharray="8 4" opacity={0.7} />
                <circle cx={0} cy={nucleusY1} r={55} fill="#8888ff" opacity={0.07} />
              </g>
              <g opacity={nucleusOpacity}>
                <circle cx={0} cy={nucleusY2} r={60} fill="none"
                  stroke="#8888ff" strokeWidth={2} strokeDasharray="8 4" opacity={0.7} />
                <circle cx={0} cy={nucleusY2} r={55} fill="#8888ff" opacity={0.07} />
              </g>
            </>
          )}

          {/* Spindle fibers */}
          {[...Array(4)].map((_, i) => {
            const metaX = (i % 2 === 0 ? -1 : 1) * (30 + i * 20);
            return (
              <g key={i} opacity={spindleOpacity}>
                <SpindleFiber x1={metaX} y1={0} x2={0} y2={-cellRy + 20} color="#6688cc" />
                <SpindleFiber x1={metaX} y1={0} x2={0} y2={cellRy - 20} color="#6688cc" />
              </g>
            );
          })}

          {/* Chromosomes */}
          {chromoPairs.map((pair, i) => {
            const pos = getChromoPos(pair, i);
            return (
              <Chromosome
                key={i}
                x={pos.x}
                y={pos.y}
                angle={pos.angle}
                color={pair.color}
                glowIntensity={chromoGlow}
                scale={pos.scale}
              />
            );
          })}
        </g>
      )}

      {/* ── Cytokinesis: two daughter cells ── */}
      {phase === 4 && (
        <>
          <defs>
            <radialGradient id="daughter-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0.06} />
            </radialGradient>
          </defs>
          {[d1OffsetY, d2OffsetY].map((offsetY, di) => (
            <g key={di} transform={`translate(0, ${offsetY})`} opacity={daughterCellOpacity}>
              <ellipse cx={0} cy={0} rx={180} ry={200}
                fill="url(#daughter-grad)" stroke={color} strokeWidth={2.5} opacity={0.85} />
              <circle cx={0} cy={0} r={60} fill="none"
                stroke="#8888ff" strokeWidth={2} strokeDasharray="8 4" opacity={0.6} />
              {chromoPairs.slice(di * 2, di * 2 + 2).map((pair, ci) => {
                const px = (ci % 2 === 0 ? -1 : 1) * 40;
                return (
                  <Chromosome key={ci} x={px} y={0} angle={90}
                    color={pair.color} glowIntensity={chromoGlow * 0.6} scale={0.5} />
                );
              })}
            </g>
          ))}
        </>
      )}
    </g>
  );
};
