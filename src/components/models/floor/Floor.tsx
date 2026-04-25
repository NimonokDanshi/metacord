import React from 'react';
import { COLORS } from '@/constants/voxel';

export function Floor() {
  return (
    <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={COLORS.FLOOR} />
    </mesh>
  );
}
