import React from 'react';
import { Composition } from 'remotion';
import { BunkerComposition } from './scenes/BunkerScene';
import { FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from './constants';

export function RemotionRoot() {
  return (
    <Composition
      id="BunkerTransformation"
      component={BunkerComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
