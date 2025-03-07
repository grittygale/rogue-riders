import { memo } from "react";

interface OtherPlayerProps {
  color: string;
  position: [number, number, number];
  velocity: [number, number];
}

const OtherPlayer = memo(({ color, position, velocity }: OtherPlayerProps) => {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
});

OtherPlayer.displayName = "OtherPlayer";

export default OtherPlayer;
