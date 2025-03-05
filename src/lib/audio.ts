// src/lib/audio.ts
import { Howl } from 'howler';
import { AudioManager } from '../types/loading';

export const createAudioManager = (src: string = '/assets/loading-music.mp3'): AudioManager => {
  return {
    init: () => {
      const sound = new Howl({
        src: [src],
        loop: true,
        volume: 0.5,
        onload: () => console.log('Audio loaded:', src),
        onloaderror: (id, error) => console.error('Audio load error:', error),
        onplayerror: (id, error) => console.error('Audio play error:', error),
      });
      sound.play();
      return sound;
    },
    stop: (sound: Howl) => {
      sound.stop();
    },
  };
};
