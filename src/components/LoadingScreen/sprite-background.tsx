// src/components/LoadingScreen/SpriteBackground.tsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useLoader } from '@react-three/fiber';

interface SpriteBackgroundProps {
  imageSrc: string;
  opacity?: number;
}

export const SpriteBackground = ({ imageSrc, opacity = 0.5 }: SpriteBackgroundProps) => {
  const { scene, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null!);
  const texture = useLoader(THREE.TextureLoader, imageSrc);

  useEffect(() => {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity,
      sizeAttenuation: false,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    spriteRef.current = sprite;

    // Calculate aspect ratio and scale based on image
    const aspect = texture.image.width / texture.image.height || 16 / 9;
    const updateSpriteScale = () => {
      if (!spriteRef.current) return;
      const { width, height } = size;
      const viewAspect = width / height;
      const scale = 2; // Base scale factor
      if (aspect > viewAspect) {
        sprite.scale.set(scale * viewAspect * aspect, scale * viewAspect, 1);
      } else {
        sprite.scale.set(scale, scale / aspect, 1);
      }
      sprite.position.set(0, 0, -10);
    };

    updateSpriteScale();
    scene.add(sprite);
    console.log('Sprite background initialized, aspect:', aspect, 'size:', size);

    // Handle resize
    const handleResize = () => updateSpriteScale();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (spriteRef.current) {
        scene.remove(spriteRef.current);
        spriteRef.current.material.dispose();
        (spriteRef.current.material.map as THREE.Texture).dispose();
        console.log('Sprite background cleaned up');
      }
    };
  }, [scene, texture, opacity, size]); // Removed camera to avoid re-renders

  return null;
};
