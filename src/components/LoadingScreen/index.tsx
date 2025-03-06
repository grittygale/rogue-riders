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
  title = 'ROGUE RIDERS',
  isAudioEnabled = true, // Default to enabled
  onLoadComplete,
}: LoadingScreenProps) => {
  const soundRef = useRef<Howl | null>(null);
  const audioManager = createAudioManager(audioSrc);

  useEffect(() => {
    const audio = audioManager.init();
    soundRef.current = audio;
    console.log('Loading screen mounted, audio initialized');

    // Play or pause based on isAudioEnabled
    if (isAudioEnabled) {
      audio.play();
    } else {
      audio.pause();
    }

    return () => {
      if (soundRef.current) {
        audioManager.stop(soundRef.current);
        soundRef.current = null;
        console.log('Loading screen unmounted, audio stopped');
      }
    };
  }, [audioManager]);

  useEffect(() => {
    // Update audio state when isAudioEnabled changes
    if (soundRef.current) {
      if (isAudioEnabled) {
        soundRef.current.play();
      } else {
        soundRef.current.pause();
      }
      console.log('Audio state updated in LoadingScreen:', isAudioEnabled);
    }
  }, [isAudioEnabled]);

  const handleStart = () => {
    console.log('Start button clicked at', new Date().toISOString());
    if (soundRef.current) audioManager.stop(soundRef.current);
    onLoadComplete();
  };

  return (
    <div className="loading-screen">
      <Canvas>
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 5, 10]} />
        <SpriteBackground imageSrc={backgroundImage} />
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
