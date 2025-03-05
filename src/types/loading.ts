// src/types/loading.ts
import { Howl } from 'howler';

export interface LoadingScreenProps {
  audioSrc?: string;
  loadDuration?: number;
  backgroundImage?: string;  // Path to sprite-background.jpg
  cubeColor?: string;        // Kept for consistency, optional
  buttonText?: string;
  title?: string;
  onLoadComplete: () => void;
}

export interface AudioManager {
  init: () => Howl;
  stop: (sound: Howl) => void;
}
