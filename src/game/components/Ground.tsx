import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { memo } from "react";

const Ground = memo(({ position }: { position: [number, number, number] }) => {
  const texture = useTexture(
    "https://threejs.org/examples/textures/terrain/grasslight-big.jpg",
    (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);
      texture.needsUpdate = true;
    }
  );

  // Using a single geometry instance for better memory management
  const geometry = new THREE.PlaneGeometry(5000, 5000);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
});

Ground.displayName = "Ground";

export default Ground;
