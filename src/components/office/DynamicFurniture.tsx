'use client';

import React from 'react';
import { Workstation, CustomWorkstation, Chair } from '@/components/office/OfficeFurniture';
import { PottedPlant } from '@/components/office/OfficeEquipment';
import { RoomItem } from '@/constants/roomItems';
import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';

interface DynamicFurnitureProps {
  id?: string;
  item: RoomItem;
  opacity?: number;
  colorOverride?: string;
  rotation?: number;
  gridX?: number;
  gridZ?: number;
}

export function DynamicFurniture({ 
  id,
  item, 
  opacity = 1, 
  colorOverride, 
  rotation = 0,
  gridX,
  gridZ
}: DynamicFurnitureProps) {
  const { occupants } = useRoomStore();

  // 透明度の適用
  const isPreview = opacity < 1;

  // 着席判定 (家具IDに基づいて、誰かがこの家具に座っているか確認)
  let occupantAtSeat = null;
  if (!isPreview && id) {
    occupantAtSeat = Array.from(occupants.values()).find(occ => occ.furniture_id === id);
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
