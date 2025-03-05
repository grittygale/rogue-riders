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
    // Create sprite material and sprite with optimized settings
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity,
      sizeAttenuation: false, // Disable size attenuation for better performance
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    spriteRef.current = sprite;

    // Memoize calculations that don't need to be recomputed
    const aspect = texture.image ? texture.image.width / texture.image.height : 1;
    const spriteZ = -10;

    const updateSpriteScale = () => {
      if (!spriteRef.current) return;

      const { width, height } = size;
      const viewAspect = width / height;

      // Simplified scaling calculation
      const scale = 2; // Base scale factor
      if (aspect > viewAspect) {
        sprite.scale.set(scale * viewAspect * aspect, scale * viewAspect, 1);
      } else {
        sprite.scale.set(scale, scale / aspect, 1);
      }
      sprite.position.set(0, 0, spriteZ);
    };

    updateSpriteScale();
    scene.add(sprite);

    // Use RAF for smoother resize handling
    let rafId: number;
    let isResizing = false;

    const handleResize = () => {
      if (!isResizing) {
        isResizing = true;
        rafId = requestAnimationFrame(() => {
          updateSpriteScale();
          isResizing = false;
        });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      if (spriteRef.current) {
        scene.remove(spriteRef.current);
        spriteRef.current.material.dispose();
      }
    };

  }, [scene, camera, size, texture, opacity]); // Texture is now a dependency

  return null;
};
