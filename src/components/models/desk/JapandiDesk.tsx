import React from 'react';
import { COLORS, HEIGHT_DESK, DESK_DEPTH } from '@/constants/voxel';

interface Props {
  pos?: { x: number; y: number; z: number };
}

export function JapandiDesk({ pos = { x: 0, y: 0, z: 0 } }: Props) {
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {/* 天板 (オーク材) */}
      <mesh castShadow receiveShadow position={[0, HEIGHT_DESK - 0.05, 0]}>
        <boxGeometry args={[1.98, 0.08, DESK_DEPTH]} />
        <meshStandardMaterial color={COLORS.JAPANDI_WOOD} />
      </mesh>
      
      {/* 脚 (細身のダークグレー、少し内側に配置) */}
      {[-0.85, 0.85].map((x) => 
        [-0.3, 0.3].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, (HEIGHT_DESK - 0.08) / 2, z]}>
            <boxGeometry args={[0.05, HEIGHT_DESK - 0.08, 0.05]} />
            <meshStandardMaterial color={COLORS.JAPANDI_LEG} />
          </mesh>
        ))
      )}
    </group>
  );
}
