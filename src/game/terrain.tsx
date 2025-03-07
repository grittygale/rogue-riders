import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, memo, useEffect, useRef } from "react";
import Ground from "./components/Ground";
import Ball from "./components/Ball";
import { Client, Room } from "colyseus.js";

interface PlayerState {
  color: string;
  x: number;
  y: number;
  z: number;
}

interface RoomState {
  players: Map<string, PlayerState>;
}

const client = new Client("http://localhost:2567");

const Terrain = memo(() => {
  const roomRef = useRef<Room>(null);
  const connectionInProgress = useRef<boolean>(false);
  const [playerColor, setPlayerColor] = useState("#FF0000");

  const [groundPos, setGroundPos] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const handleBallMove = (dx: number, dz: number) => {
    setGroundPos((prev) => [prev[0] - dx, prev[1], prev[2] - dz]);
  };

  /// Colyseus Room Service ///

  useEffect(() => {
    // Prevent multiple concurrent connection attempts
    if (connectionInProgress.current) return;

    // If we already have a room connection, don't create another one
    if (roomRef.current?.connection.isOpen) return;

    connectionInProgress.current = true;

    const connectToRoom = async () => {
      try {
        // Clean up any existing room connection first
        if (roomRef.current) {
          await roomRef.current.leave();
          roomRef.current = null;
        }

        const room = await client.joinOrCreate<RoomState>("rogue-riders", {});
        roomRef.current = room;

        // handle room events here
        room.onStateChange((state) => {
          // Get our player's color from the state
          const player = state.players.get(room.sessionId);
          if (player) {
            setPlayerColor(player.color);
          }
          console.log({ state });
        });

        room.onLeave((code) => {
          console.log("Left room:", code);
          roomRef.current = null;
        });
      } catch (error) {
        console.error("Failed to join room:", error);
      } finally {
        connectionInProgress.current = false;
      }
    };

    connectToRoom();

    return () => {
      // Cleanup function
      const cleanup = async () => {
        if (roomRef.current?.connection.isOpen) {
          await roomRef.current.leave();
          roomRef.current = null;
        }
      };
      cleanup();
    };
  }, []); // Empty dependency array since we want this to run once

  // End of Room Service ///

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
      <Ball onMove={handleBallMove} color={playerColor} />
      <OrbitControls enableRotate={false} />
    </Canvas>
  );
});

Terrain.displayName = "Terrain";

export default Terrain;
