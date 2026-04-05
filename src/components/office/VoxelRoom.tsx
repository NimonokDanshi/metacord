import React from 'react';
import { GRID_SIZE_X, GRID_SIZE_Z, COLORS, VOXEL_SIZE } from '@/constants/voxel';

export function VoxelRoom() {
  const tiles = [];

  // 床タイル (12x12) を生成
  for (let z = 0; z < GRID_SIZE_Z; z++) {
    for (let x = 0; x < GRID_SIZE_X; x++) {
      const isEven = (x + z) % 2 === 0;
      const color = isEven ? COLORS.FLOOR_DARK : COLORS.FLOOR_LIGHT;
      
      // 中心寄せの計算
      const posX = x * VOXEL_SIZE - (GRID_SIZE_X * VOXEL_SIZE) / 2 + VOXEL_SIZE / 2;
      const posZ = z * VOXEL_SIZE - (GRID_SIZE_Z * VOXEL_SIZE) / 2 + VOXEL_SIZE / 2;

      tiles.push(
        <mesh
          key={`${x}-${z}`}
          position={[posX, -0.05, posZ]}
          receiveShadow
        >
          <boxGeometry args={[VOXEL_SIZE * 0.98, 0.1, VOXEL_SIZE * 0.98]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      );
    }
  }

  return <group>{tiles}</group>;
}
