import React from 'react';
import { COLORS, HEIGHT_DESK, DESK_DEPTH } from '@/constants/voxel';

export function Desk({ pos = { x: 0, y: 0, z: 0 } }: { pos?: { x: number; y: number; z: number } }) {
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 天板 (センター配置) */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_DESK - 0.05, 0]}>
        <boxGeometry args={[1.98, 0.1, DESK_DEPTH]} />
        <meshStandardMaterial color={COLORS.DESK} />
      </mesh>
      {/* 脚 (センター基準) */}
      {[-0.8, 0.8].map((x) => 
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, (HEIGHT_DESK - 0.1) / 2, z]}>
            <boxGeometry args={[0.08, HEIGHT_DESK - 0.1, 0.08]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        ))
      )}
    </group>
  );
}
