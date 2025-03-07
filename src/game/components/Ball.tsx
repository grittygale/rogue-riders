import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

const MOVEMENT_KEYS = {
  w: false,
  a: false,
  s: false,
  d: false,
};

type MovementKeys = Record<keyof typeof MOVEMENT_KEYS, boolean>;

interface BallProps {
  onMove: (dx: number, dz: number) => void;
  color?: string;
}

const Ball = ({ onMove, color = "#FF0000" }: BallProps) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const keys = useRef<MovementKeys>({ ...MOVEMENT_KEYS });
  const speed = 2;

  const handleKeyChange = useCallback(
    (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase() as keyof MovementKeys;
      if (Object.prototype.hasOwnProperty.call(MOVEMENT_KEYS, key)) {
        keys.current[key] = pressed;
      }
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) =>
      handleKeyChange(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKeyChange(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyChange]);

  useFrame(() => {
    if (!ballRef.current) return;

    let dx = 0;
    let dz = 0;

    if (keys.current.w) dz -= speed;
    if (keys.current.s) dz += speed;
    if (keys.current.a) dx -= speed;
    if (keys.current.d) dx += speed;

    if (dx !== 0 || dz !== 0) {
      ballRef.current.position.x += dx;
      ballRef.current.position.z += dz;
      onMove(dx, dz);
    }
  });

  return (
    <mesh ref={ballRef} position={[0, 5, 0]} castShadow>
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Ball;
