import React from 'react';
import { Composition } from 'remotion';
import { Mitosis } from './Mitosis.jsx';

export const RemotionRoot = () => {
  return (
    <Composition
      id="Mitosis"
      component={Mitosis}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
  );
};
