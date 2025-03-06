// src/App.tsx
import { useState } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { FPSCounter } from "./components/fps-counter";
import { AudioToggleButton } from "./components/audio-togglebutton";
import Terrain from "./game/terrain";

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Manage audio state

  console.log(
    "App rendered, isLoaded:",
    isLoaded,
    "at",
    new Date().toISOString()
  );

  return (
    <>
      <FPSCounter />
      <AudioToggleButton
        isAudioEnabled={isAudioEnabled}
        setIsAudioEnabled={setIsAudioEnabled}
      />
      {!isLoaded ? (
        <LoadingScreen
          audioSrc="/assets/loading-music.mp3"
          backgroundImage="/assets/sprite-background.jpg"
          buttonText="START"
          title="ROGUE RIDERS"
          isAudioEnabled={isAudioEnabled} // Pass audio state
          onLoadComplete={() => {
            console.log(
              "Loading complete, setting isLoaded to true at",
              new Date().toISOString()
            );
            setIsLoaded(true);
          }}
        />
      ) : (
        <div style={{ width: "100vw", height: "100vh", color: "#fff" }}>
          <Terrain />
        </div>
      )}
    </>
  );
}
