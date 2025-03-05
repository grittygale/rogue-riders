// src/components/LoadingScreen/index.tsx
import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Howl } from 'howler';
import { LoadingScreenProps } from '../../types/loading';
import { createAudioManager } from '../../lib/audio';
import { SpriteBackground } from './sprite-background';

export const LoadingScreen = ({
  audioSrc = '/assets/loading-music.mp3',
  backgroundImage = '/assets/sprite-background.jpg',
  buttonText = 'START',
  title = '',
  onLoadComplete,
}: LoadingScreenProps) => {
  const soundRef = useRef<Howl | null>(null);
  const audioManager = createAudioManager(audioSrc);

  useEffect(() => {
    soundRef.current = audioManager.init();
    console.log('Loading screen mounted, audio initialized');
    return () => {
      if (soundRef.current) {
        audioManager.stop(soundRef.current);
        console.log('Loading screen unmounted, audio stopped');
      }
    };
  }, [audioManager]);

  const handleStart = () => {
    console.log('Start button clicked');
    if (soundRef.current) audioManager.stop(soundRef.current);
    onLoadComplete();
  };

  return (
    <div className="loading-screen">
      <Canvas>
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 5, 10]} />
        <SpriteBackground imageSrc={backgroundImage} />
        {/* Optional: Re-add RetroCube if desired */}
        {/* <RetroCube color={cubeColor} /> */}
      </Canvas>
      <div className="overlay">
        <h1 className="game-title">{title}</h1>
        <button className="retro-button" onClick={handleStart}>
          {buttonText}
        </button>
        <p className="subtitle">Press Start to Race!</p>
      </div>
    </div>
  );
};
