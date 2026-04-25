import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * キーボード
 */
export function Keyboard() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.4, 0.02, 0.15]} />
      <meshStandardMaterial color={COLORS.KEYBOARD} />
    </mesh>
  );
}
