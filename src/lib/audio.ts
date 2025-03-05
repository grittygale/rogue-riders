import { Howl } from 'howler';
import { AudioManager } from '../types/loading';

// Type definition for audio pool
interface AudioPool {
  [key: string]: Howl;
}

export const createAudioManager = (() => {
  const audioPool: AudioPool = {}; // Pool to cache audio instances

  return (src: string = '/assets/loading-music.mp3'): AudioManager => {
    let sound: Howl | null = audioPool[src] || null;

    const init = () => {
      if (!sound) {
        sound = new Howl({
          src: [src],
          loop: true,
          volume: 0.5,
          preload: true,
          html5: true,
          pool: 5, // Limit concurrent instances for performance
          // Minimal logging for production
          onload: () => { if (import.meta.env.NODE_ENV !== 'production') console.log('Audio loaded:', src); },
          onloaderror: (_, error) => console.error('Audio load error:', error),
          onplayerror: (_, error) => console.error('Audio play error:', error),
        });
        audioPool[src] = sound; // Cache in pool
      }

      if (!sound.playing()) {
        const playId = sound.play();
        // Ensure playback starts only once to avoid overlap
        if (sound.playing(playId)) {
          return sound;
        }
      }
      return sound;
    };

    const stop = () => {
      if (sound) {
        sound.stop();
        sound.unload(); // Fully unload to free memory
        delete audioPool[src]; // Remove from pool
        sound = null;
      }
    };

    return { init, stop };
  };
})();
