'use client';

import React from 'react';
import { Workstation } from '@/components/models/desk/Workstation';
import { CustomWorkstation } from '@/components/models/desk/CustomWorkstation';
import { JapandiWorkstation } from '@/components/models/desk/JapandiWorkstation';
import { Chair } from '@/components/models/chair/Chair';
import { JapandiChair } from '@/components/models/chair/JapandiChair';
import { Wall } from '@/components/models/wall/Wall';
import { Floor } from '@/components/models/floor/Floor';
import { PottedPlant } from '@/components/models/furniture/PottedPlant';
import { RoomItem, ROOM_ITEMS } from '@/constants/roomItems';
import { useRoomStore } from '@/stores/roomStore';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { parseMySet } from '@/utils/userMetadataUtil';

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
  const { occupants, setEditing, setSelectedItem, setMovingFurnitureId, setPreviewRotation } = useRoomStore();
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  // 透明度の適用
  const isPreview = opacity < 1;

  // 着席判定 (家具IDに基づいて、誰かがこの家具に座っているか確認)
  let occupantAtSeat = null;
  if (!isPreview && id) {
    occupantAtSeat = Array.from(occupants.values()).find(occ => occ.furniture_id === id);
  }

  const handlePointerDown = (e: any) => {
    if (isPreview || !id) return;
    e.stopPropagation();
    
    // 0.5秒長押しで編集モード
    longPressTimer.current = setTimeout(() => {
      console.log('[DynamicFurniture] Long press detected:', id);
      setEditing(true);
      setSelectedItem(item.id);
      setMovingFurnitureId(id);
      setPreviewRotation(rotation);
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <group 
      rotation={[0, rotation, 0]} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* デスクセットの描画 */}
      {item.type === 'desk' && (
        <group>
          {(() => {
            // 着席者がいて、かつメタデータを持っている場合はそのMySetを優先
            const myset = occupantAtSeat?.metadata ? parseMySet(occupantAtSeat.metadata) : null;
            const deskId = myset?.desk || item.id;
            const deskItem = ROOM_ITEMS.find(it => it.id === deskId) || item;

            if (deskItem.modelComponent === 'JapandiWorkstation') {
              return <JapandiWorkstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />;
            }
            
            // 標準デスク（Workstation）の場合、着席時は豪華版（CustomWorkstation）を表示
            if (occupantAtSeat) {
              return <CustomWorkstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />;
            }
            
            return <Workstation pos={{ x: 0, y: 0, z: 0 }} rotation={0} />;
          })()}
        </group>
      )}

      {/* 椅子の描画 (単体) */}
      {item.type === 'chair' && (
        <group>
          {(() => {
            const myset = occupantAtSeat?.metadata ? parseMySet(occupantAtSeat.metadata) : null;
            const chairId = myset?.chair || item.id;
            const chairItem = ROOM_ITEMS.find(it => it.id === chairId) || item;

            if (chairItem.modelComponent === 'JapandiChair') {
              return <JapandiChair pos={{ x: 0, y: 0, z: 0 }} rotation={0} />;
            }
            return <Chair pos={{ x: 0, y: 0, z: 0 }} rotation={0} />;
          })()}
        </group>
      )}

      {/* その他の家具 */}
      {item.type === 'furniture' && item.modelComponent === 'PottedPlant' && <PottedPlant />}
      {item.modelComponent === 'Wall' && <Wall />}
      {item.modelComponent === 'Floor' && <Floor />}
      
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
