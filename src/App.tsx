// src/App.tsx
import { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { FPSCounter } from './components/fps-counter';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  console.log('App rendered, isLoaded:', isLoaded);

  return (
    <>
      <FPSCounter />
      {!isLoaded ? (
        <LoadingScreen
          audioSrc="/assets/loading-music.mp3"
          backgroundImage="/assets/sprite-background.jpg"
          buttonText="START"
          title="ROGUE RIDERS"
          onLoadComplete={() => {
            console.log('Loading complete, setting isLoaded to true');
            setIsLoaded(true);
          }}
        />
      ) : (
        <div style={{ width: '100vw', height: '100vh', color: '#fff' }}>
          Game Scene Here
        </div>
      )}
    </>
  );
};
