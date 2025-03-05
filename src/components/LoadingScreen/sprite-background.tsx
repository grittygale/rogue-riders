import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useLoader } from '@react-three/fiber';

interface SpriteBackgroundProps {
  imageSrc: string;
  opacity?: number;
}

export const SpriteBackground = ({ imageSrc, opacity = 0.5 }: SpriteBackgroundProps) => {
  const { scene, camera, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null!);
  const texture = useLoader(THREE.TextureLoader, imageSrc); // Load texture with useLoader

  useEffect(() => {
    let resizeTimeout: number;

    // Create sprite material and sprite
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    spriteRef.current = sprite;

    const updateSpriteScale = () => {
      if (!spriteRef.current || !texture.image) return;

      const { width, height } = size;
      const aspect = texture.image.width / texture.image.height;
      const cameraZ = camera.position.z || 0;
      const spriteZ = -10;
      const distance = Math.abs(cameraZ - spriteZ);

      let worldHeight: number, worldWidth: number;

      if (camera instanceof THREE.PerspectiveCamera) {
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        worldHeight = 2 * Math.tan(vFOV / 2) * distance;
        worldWidth = worldHeight * (width / height);
      } else {
        worldHeight = (camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom;
        worldWidth = worldHeight * (width / height);
      }

      const spriteAspect = worldWidth / worldHeight;
      if (aspect > spriteAspect) {
        sprite.scale.set(worldHeight * aspect, worldHeight, 1);
      } else {
        sprite.scale.set(worldWidth, worldWidth / aspect, 1);
      }
      sprite.position.set(0, 0, spriteZ);
    };

    updateSpriteScale();
    scene.add(sprite);

    // Debounced resize handler
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateSpriteScale, 100);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (spriteRef.current) {
        scene.remove(spriteRef.current);
        spriteRef.current.material.dispose();
        // No need to dispose texture here as useLoader manages it
      }
    };
  }, [scene, camera, size, texture, opacity]); // Texture is now a dependency

  return null;
};
