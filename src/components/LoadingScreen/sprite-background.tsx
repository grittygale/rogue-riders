import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface SpriteBackgroundProps {
  imageSrc: string;
  opacity?: number; // Optional prop to control transparency level
}

export const SpriteBackground = ({ imageSrc, opacity = 0.5 }: SpriteBackgroundProps) => {
  const { gl, scene, camera, size } = useThree();
  const spriteRef = useRef<THREE.Sprite>(null!);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageSrc,
      (texture) => {
        // Create sprite material with transparency
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true, // Enable transparency
          opacity: opacity, // Set opacity (0 = fully transparent, 1 = fully opaque)
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        spriteRef.current = sprite;

        // Ensure the camera is a perspective or orthographic camera for calculations
        const setSpriteScale = () => {
          if (!spriteRef.current || !texture.image) return;

          // Get viewport dimensions
          const { width, height } = size;
          const aspect = texture.image.width / texture.image.height;

          // Calculate the world units at the sprite's depth
          const cameraZ = camera.position.z || 0;
          const spriteZ = -10; // Sprite's z position
          const distance = Math.abs(cameraZ - spriteZ);

          let worldHeight, worldWidth;

          if (camera instanceof THREE.PerspectiveCamera) {
            // For perspective camera
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            worldHeight = 2 * Math.tan(vFOV / 2) * distance;
            worldWidth = worldHeight * (width / height);
          } else if (camera instanceof THREE.OrthographicCamera) {
            // For orthographic camera
            worldHeight = camera.top - camera.bottom;
            worldWidth = worldHeight * (width / height);
          } else {
            // Fallback for unsupported camera types
            worldWidth = width;
            worldHeight = height;
          }

          // Adjust sprite scale to cover the viewport while preserving aspect ratio
          const spriteAspect = worldWidth / worldHeight;
          if (aspect > spriteAspect) {
            // Image is wider than viewport: fit height, scale width
            sprite.scale.set(worldHeight * aspect, worldHeight, 1);
          } else {
            // Image is taller than viewport: fit width, scale height
            sprite.scale.set(worldWidth, worldWidth / aspect, 1);
          }

          sprite.position.set(0, 0, spriteZ); // Ensure sprite stays behind other elements
        };

        // Initial scale
        setSpriteScale();
        scene.add(sprite);
        console.log('Sprite background loaded successfully');

        // Update scale on window resize
        const handleResize = () => {
          setSpriteScale();
        };
        window.addEventListener('resize', handleResize);

        // Clean up resize listener on unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      },
      undefined,
      (error) => {
        console.error('Error loading sprite background:', error);
      }
    );

    // Cleanup sprite on unmount
    return () => {
      if (spriteRef.current) {
        scene.remove(spriteRef.current);
        spriteRef.current.material.dispose();
        (spriteRef.current.material.map as THREE.Texture)?.dispose();
        console.log('Sprite background cleaned up');
      }
    };
  }, [scene, camera, size, imageSrc, opacity]); // Add opacity to dependency array

  return null; // Sprite is managed in useEffect
};
