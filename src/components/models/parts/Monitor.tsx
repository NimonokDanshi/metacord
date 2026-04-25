import React from 'react';
import { COLORS } from '@/constants/voxel';

/**
 * モニター
 */
export function Monitor() {
  return (
    <group>
      {/* 台座 */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 支柱 */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 画面本体 */}
      <mesh castShadow position={[0, 0.25, 0.02]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.03]} />
        <meshStandardMaterial color={COLORS.MONITOR} />
      </mesh>
      {/* 画面 (発光面) */}
      <mesh position={[0, 0.25, 0.036]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.56, 0.31, 0.001]} />
        <meshStandardMaterial color="#444" emissive="#111" />
      </mesh>
    </group>
  );
}
