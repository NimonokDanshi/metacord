import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { COLORS } from '@/constants/voxel';
import type { SeatOccupant } from '@/types/room';

interface Props {
  occupant: SeatOccupant;
}

export function VoxelMember({ occupant }: Props) {
  const { getPositionFromSeat } = useVoxelGrid();
  const groupRef = useRef<THREE.Group>(null);

  // 座席インデックスに基づいて 3D 座標を取得
  const pos = getPositionFromSeat(occupant.seat_index, 0);

  // 待機時の微少な浮遊アニメーション
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[pos.x, 0.5, pos.z]}>
      {/* 体 (Blue Voxel) */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color={COLORS.AVATAR_BLUE} />
      </mesh>
      
      {/* 頭 (Skin Voxel) */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={COLORS.AVATAR_SKIN} />
      </mesh>

      {/* 2.5D Overlay: 名前とアイコン */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={10}
        occlude={false}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center gap-1">
          {/* アバターアイコン (円形) */}
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-lg bg-[#2c3e50]">
            <img 
              src={occupant.avatar_url || ''} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* 名前タグ */}
          <div className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
            {occupant.display_name}
          </div>
        </div>
      </Html>
    </group>
  );
}
