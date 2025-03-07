import { memo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface PlayerData {
  id: string;
  color: string;
  position: [number, number, number];
  velocity: [number, number];
}

interface PlayersProps {
  players: PlayerData[];
}

const BALL_GEOMETRY = new THREE.SphereGeometry(5, 32, 32);

const Players = memo(({ players }: PlayersProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useRef(new THREE.Object3D());
  const tempColor = useRef(new THREE.Color());

  useEffect(() => {
    // Initialize instance colors
    if (meshRef.current) {
      players.forEach((player, i) => {
        tempColor.current.set(player.color);
        meshRef.current?.setColorAt(i, tempColor.current);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [players]);

  useFrame(() => {
    if (!meshRef.current) return;

    // Update instance positions
    players.forEach((player, i) => {
      const { position } = player;
      tempObject.current.position.set(position[0], position[1], position[2]);
      tempObject.current.updateMatrix();
      meshRef.current?.setMatrixAt(i, tempObject.current.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[BALL_GEOMETRY, undefined, players.length]}
      castShadow
    >
      <meshStandardMaterial />
    </instancedMesh>
  );
});

Players.displayName = "Players";

export default Players;
