'use client';

import React from 'react';
import { Workstation, Chair } from '@/components/office/OfficeFurniture';
import { PottedPlant } from '@/components/office/OfficeEquipment';
import { RoomItem } from '../../constants/items';

interface DynamicFurnitureProps {
  item: RoomItem;
  opacity?: number;
  colorOverride?: string;
}

export function DynamicFurniture({ item, opacity = 1, colorOverride }: DynamicFurnitureProps) {
  // 透明度の適用
  const isPreview = opacity < 1;

  // プレビュー用のマテリアルプロパティ
  const materialProps = isPreview ? {
    transparent: true,
    opacity: opacity,
    depthWrite: false, // プレビュー同士の重なりを綺麗に見せる
  } : {};

  // アイテムIDに応じたモデルの描画
  // 本来は各モデルコンポーネント側で opacity を受け取るべきだが、
  // 現状は group の opacity が自動反映されないため、簡易的に group で包む
  return (
    <group>
      {item.modelComponent === 'Workstation' && <Workstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />}
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
