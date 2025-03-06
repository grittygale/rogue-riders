import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, memo } from "react";
import Ground from "./components/Ground";
import Ball from "./components/Ball";

const Terrain = memo(() => {
  const [groundPos, setGroundPos] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const handleBallMove = (dx: number, dz: number) => {
    setGroundPos((prev) => [prev[0] - dx, prev[1], prev[2] - dz]);
  };

  return (
    <Canvas
      camera={{ position: [0, 50, 150], fov: 60 }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[150, 420, 350]}
        intensity={0.9}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Ground position={groundPos} />
      <Ball onMove={handleBallMove} />
      <OrbitControls enableRotate={false} />
    </Canvas>
  );
});

Terrain.displayName = "Terrain";

export default Terrain;
