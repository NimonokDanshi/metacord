import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * マウス
 */
export function Mouse() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.06, 0.03, 0.1]} />
      <meshStandardMaterial color={COLORS.MOUSE} />
    </mesh>
  );
}
