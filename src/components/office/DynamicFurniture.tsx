'use client';

import React from 'react';
import { Workstation, CustomWorkstation, Chair } from '@/components/office/OfficeFurniture';
import { PottedPlant } from '@/components/office/OfficeEquipment';
import { RoomItem } from '@/constants/roomItems';
import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';

interface DynamicFurnitureProps {
  item: RoomItem;
  opacity?: number;
  colorOverride?: string;
  rotation?: number;
  gridX?: number;
  gridZ?: number;
}

export function DynamicFurniture({ 
  item, 
  opacity = 1, 
  colorOverride, 
  rotation = 0,
  gridX,
  gridZ
}: DynamicFurnitureProps) {
  const { occupants } = useRoomStore();
  const { getSeatFromGrid } = useVoxelGrid();

  // 透明度の適用
  const isPreview = opacity < 1;

  // 着席判定 (デスクセットの場合)
  let occupantAtSeat = null;
  if (!isPreview && item.type === 'desk' && gridX !== undefined && gridZ !== undefined) {
    // 回転によって椅子の相対位置が変わるが、一旦デフォルト(南向き)での計算
    // 椅子はデスクの右側・手前 (2x2の 1, 1 位置) にあると仮定
    const chairGridX = gridX + 1;
    const chairGridZ = gridZ + 1;
    const seatIdx = getSeatFromGrid(chairGridX, chairGridZ);
    occupantAtSeat = Array.from(occupants.values()).find(occ => occ.seat_index === seatIdx);
  }

  return (
    <group rotation={[0, rotation, 0]}>
      {item.modelComponent === 'Workstation' && (
        <group>
           {/* 着席者がいればカスタムデスクを表示 */}
           {occupantAtSeat ? (
             <CustomWorkstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />
           ) : (
             <Workstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />
           )}
           
           {/* デスクセットの場合は椅子を背後に配置する (2x2を想定) */}
           {item.type === 'desk' && (
             <Chair pos={{ x: 0.5, y: 0, z: 1.25 }} rotation={Math.PI} />
           )}
        </group>
      )}
      {item.modelComponent === 'Chair' && <Chair pos={{ x: 0, y: 0, z: 0 }} rotation={0} />}
      {item.modelComponent === 'PottedPlant' && <PottedPlant />}
      
      {/* プレビュー時の色オーバーライド用フィルター（簡易実装） */}
      {colorOverride && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[item.sizeX, 0.1, item.sizeZ]} />
          <meshStandardMaterial color={colorOverride} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
