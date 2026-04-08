import React from 'react';
import { GRID_SIZE_X, GRID_SIZE_Z, COLORS, VOXEL_SIZE } from '@/constants/voxel';
import { PottedPlant } from './OfficeEquipment';

function WallSegment({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={COLORS.WALL} />
    </mesh>
  );
}

export function VoxelRoom() {
  const tiles = [];

  // 床タイル (12x12) を生成
  for (let z = 0; z < GRID_SIZE_Z; z++) {
    for (let x = 0; x < GRID_SIZE_X; x++) {
      const isEven = (x + z) % 2 === 0;
      const color = isEven ? COLORS.FLOOR_DARK : COLORS.FLOOR_LIGHT;
      
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

  const offset = (GRID_SIZE_X * VOXEL_SIZE) / 2;

  return (
    <group>
      {tiles}
      
      {/* 壁 (背景側 L字) */}
      <WallSegment pos={[-offset - 0.1, 1.5, 0]} size={[0.2, 3.0, GRID_SIZE_Z]} />
      <WallSegment pos={[0, 1.5, -offset - 0.1]} size={[GRID_SIZE_X, 3.0, 0.2]} />

      {/* 観葉植物 (コーナーや隙間に配置) */}
      <group position={[-offset + 0.8, 0, -offset + 0.8]}>
        <PottedPlant />
      </group>
      <group position={[offset - 0.8, 0, -offset + 0.8]}>
        <PottedPlant />
      </group>
    </group>
  );
}
