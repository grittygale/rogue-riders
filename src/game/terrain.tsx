import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, memo, useEffect, useRef } from "react";
import Ground from "./components/Ground";
import Ball from "./components/Ball";
import OtherPlayer from "./components/OtherPlayer";
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

const POSITION_QUANTUM = 0.25; // Match server's quantum

const client = new Client("http://localhost:2567");

const Terrain = memo(() => {
  const roomRef = useRef<Room>(null);
  const connectionInProgress = useRef<boolean>(false);
  const [playerColor, setPlayerColor] = useState("#FF0000");
  const [playerPosition, setPlayerPosition] = useState<
    [number, number, number]
  >([0, 5, 0]);
  const [otherPlayers, setOtherPlayers] = useState<Map<string, PlayerState>>(
    new Map()
  );

  const quantizePosition = (value: number): number => {
    return Math.round(value / POSITION_QUANTUM) * POSITION_QUANTUM;
  };

  const handleBallMove = (dx: number, dz: number) => {
    if (!roomRef.current) return;

    // Update local position with quantized values
    setPlayerPosition((prev) => {
      const newX = quantizePosition(prev[0] + dx);
      const newZ = quantizePosition(prev[2] + dz);

      // Only send update if position actually changed after quantization
      if (newX !== prev[0] || newZ !== prev[2]) {
        // Send position update to server
        roomRef.current?.send("updatePosition", {
          x: newX,
          z: newZ,
        });
      }

      return [newX, prev[1], newZ];
    });
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
          // Get our player's data from the state
          const player = state.players.get(room.sessionId);
          if (player) {
            setPlayerColor(player.color);
            setPlayerPosition([player.x, player.y, player.z]);
          }

          // Update other players
          const others = new Map(state.players);
          others.delete(room.sessionId); // Remove our own player
          setOtherPlayers(others);
        });

        room.onLeave((code) => {
          console.log("Left room:", code);
          roomRef.current = null;
          setOtherPlayers(new Map()); // Clear other players
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
      <Ground position={[0, 0, 0]} />
      <Ball
        onMove={handleBallMove}
        color={playerColor}
        position={playerPosition}
      />

      {/* Render other players */}
      {Array.from(otherPlayers.entries()).map(([id, player]) => (
        <OtherPlayer
          key={id}
          color={player.color}
          position={[player.x, player.y, player.z]}
        />
      ))}

      <OrbitControls enableRotate={false} />
    </Canvas>
  );
});

Terrain.displayName = "Terrain";

export default Terrain;
