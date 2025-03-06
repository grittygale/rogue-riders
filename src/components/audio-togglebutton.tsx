// src/components/AudioToggleButton.tsx
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface AudioToggleButtonProps {
  isAudioEnabled: boolean;
  setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AudioToggleButton = ({ isAudioEnabled, setIsAudioEnabled }: AudioToggleButtonProps) => {
  const clickSoundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // Initialize the click sound
    clickSoundRef.current = new Howl({
      src: ['/assets/click-sound.mp3'],
      volume: 0.5,
      onload: () => console.log('Click sound loaded'),
      onloaderror: (id, error) => console.error('Click sound load error:', error),
    });

    return () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.unload();
        console.log('Click sound unloaded');
      }
    };
  }, []);

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const newState = !prev;
      if (clickSoundRef.current) {
        clickSoundRef.current.play();
      }
      console.log('Audio toggled to:', newState);
      return newState;
    });
  };

  return (
    <button
      className="audio-toggle-button"
      onClick={toggleAudio}
      style={{
        position: 'fixed',
        top: 'clamp(10px, 2vh, 20px)',
        right: 'clamp(10px, 2vw, 20px)',
        zIndex: 3, // Above FPS counter and overlay
      }}
    >
      {isAudioEnabled ? '🔊' : '🔇'}
    </button>
  );
};
