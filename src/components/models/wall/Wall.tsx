import React from 'react';
import { COLORS } from '@/constants/voxel';

export function Wall() {
  return (
    <mesh castShadow receiveShadow position={[0, 1.5, -0.45]}>
      <boxGeometry args={[1, 3, 0.1]} />
      <meshStandardMaterial color={COLORS.WALL} />
    </mesh>
  );
}
