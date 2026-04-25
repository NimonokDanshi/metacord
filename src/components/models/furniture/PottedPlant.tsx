import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * 観葉植物
 */
export function PottedPlant() {
  return (
    <group>
      {/* 鉢 */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color={COLORS.POT} />
      </mesh>
      {/* 土 */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.25, 0.05, 0.25]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* 葉 (ボクセル風の積み上げ) */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
      <mesh castShadow position={[0.1, 0.6, -0.05]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
      <mesh castShadow position={[-0.05, 0.7, 0.1]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color={COLORS.PLANT} />
      </mesh>
    </group>
  );
}
