import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * PC本体 (デスクトップ筐体)
 */
export function PCCase() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.2, 0.45, 0.4]} />
      <meshStandardMaterial color={COLORS.PC_CASE} />
    </mesh>
  );
}
