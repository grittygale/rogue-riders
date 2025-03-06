// src/types/loading.ts
import { Howl } from 'howler';

export interface LoadingScreenProps {
  audioSrc?: string;
  backgroundImage?: string;
  cubeColor?: string;
  buttonText?: string;
  title?: string;
  onLoadComplete: () => void;
  isAudioEnabled?: boolean; // New: Audio state
}

export interface AudioManager {
  init: () => Howl;
  stop: (sound: Howl) => void;
}
