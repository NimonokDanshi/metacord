'use client';

import React from 'react';
import { RoomItem, ROOM_ITEMS } from '@/constants/roomItems';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { parseMySet } from '@/utils/userMetadataUtil';
import { getFurnitureEntry } from '@/constants/furnitureRegistry';

interface DynamicFurnitureProps {
  id?: string;
  item: RoomItem;
  opacity?: number;
  colorOverride?: string;
  rotation?: number;
  gridX?: number;
  gridZ?: number;
  metadata?: any;
}

/**
 * DynamicFurniture (Facade)
 * 家具レジストリ（FURNITURE_REGISTRY）から対応する3Dモデルを動的に取得・描画します。
 * 新しい家具を追加しても、このコンポーネントを修正する必要はありません。
 */
export function DynamicFurniture({ 
  id,
  item, 
  opacity = 1, 
  colorOverride, 
  rotation = 0,
  metadata
}: DynamicFurnitureProps) {
  const { setEditing, setSelectedItem, setMovingFurnitureId, setPreviewRotation, occupants } = useRoomStore();
  const speakingUserIds = useDiscordStore(s => s.speakingUserIds);
  const userVoiceVolumes = useDiscordStore(s => s.userVoiceVolumes);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  // 透明度の適用
  const isPreview = opacity < 1;

  // 着席ユーザー情報の取得 (metadata または Presence の occupants から)
  const currentOccupant = id 
    ? Array.from(occupants.values()).find(occ => occ.furniture_id === id) 
    : null;
  const actualOccupantId = metadata?.occupant_id || (currentOccupant ? String(currentOccupant.user_id) : undefined);
  const isOccupied = !!actualOccupantId;

  // MySet 情報の取得
  const rawMySet = metadata?.myset || currentOccupant?.metadata?.myset;
  const occupantMySet = rawMySet ? parseMySet(rawMySet) : null;

  // 着席者のボイス連動状態
  const isSpeaking = actualOccupantId ? speakingUserIds.has(actualOccupantId) : false;
  const voiceVolume = actualOccupantId ? (userVoiceVolumes[actualOccupantId] ?? (isSpeaking ? 0.5 : 0)) : 0;
  const isShouting = isSpeaking && voiceVolume > 0.6;

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

  // MySet による着席中の家具差し替え判定
  let activeItem = item;
  if (item.type === 'desk' && occupantMySet?.desk) {
    activeItem = ROOM_ITEMS.find(it => it.id === occupantMySet.desk) || item;
  } else if (item.type === 'chair' && occupantMySet?.chair) {
    activeItem = ROOM_ITEMS.find(it => it.id === occupantMySet.chair) || item;
  }

  // レジストリからモデルエントリを取得
  const registryEntry = getFurnitureEntry(activeItem.modelComponent);
  const ModelComponent = (isOccupied && registryEntry?.occupiedComponent) 
    ? registryEntry.occupiedComponent 
    : registryEntry?.component;

  return (
    <group 
      rotation={[0, rotation, 0]} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* レジストリから取得した家具モデルを描画 */}
      {ModelComponent && (
        <ModelComponent 
          pos={{ x: 0, y: 0, z: 0 }} 
          rotation={0} 
          isOccupied={isOccupied}
          occupantMySet={occupantMySet}
          opacity={opacity}
          colorOverride={colorOverride}
          isSpeaking={isSpeaking}
          voiceVolume={voiceVolume}
          isShouting={isShouting}
          occupantId={actualOccupantId}
        />
      )}

      {/* プレビュー時の色オーバーライド用フィルター */}
      {colorOverride && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[item.sizeX, 0.1, item.sizeZ]} />
          <meshStandardMaterial color={colorOverride} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
