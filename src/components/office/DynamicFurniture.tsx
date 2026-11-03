'use client';

import React from 'react';
import { RoomItem, ROOM_ITEMS } from '@/constants/roomItems';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { parseMySet } from '@/utils/userMetadataUtil';
import { getFurnitureEntry } from '@/constants/furnitureRegistry';
import { roomActions } from '@/actions/roomActions';
import { GRID_SIZE_X } from '@/constants/voxel';

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
  gridX = 0,
  gridZ = 0,
  metadata
}: DynamicFurnitureProps) {
  const { 
    isEditing, 
    setEditing, 
    setSelectedItem, 
    setMovingFurnitureId, 
    setPreviewRotation, 
    occupants, 
    myFurnitureId,
    addToast 
  } = useRoomStore();
  const user = useDiscordStore(s => s.user);
  const speakingUserIds = useDiscordStore(s => s.speakingUserIds);
  const userVoiceVolumes = useDiscordStore(s => s.userVoiceVolumes);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = React.useRef<boolean>(false);

  // 透明度の適用
  const isPreview = opacity < 1;

  // 着席ユーザー情報の取得 (metadata または Presence の occupants から)
  const currentOccupant = id 
    ? Array.from(occupants.values()).find(occ => occ.furniture_id === id) 
    : null;
  const actualOccupantId = metadata?.occupant_id || (currentOccupant ? String(currentOccupant.user_id) : undefined);
  const isOccupied = !!actualOccupantId;

  // MySet 情報の取得 (自分が座っている場合は最新のストア mySet を最優先)
  const isMySeat = user && actualOccupantId === String(user.id);
  const mySetFromStore = useDiscordStore(s => s.mySet);
  const rawMySet = metadata?.myset || currentOccupant?.metadata?.myset;
  const occupantMySet = isMySeat 
    ? mySetFromStore 
    : (rawMySet ? parseMySet(rawMySet) : null);

  // 着席者のボイス連動状態
  const isSpeaking = actualOccupantId ? speakingUserIds.has(actualOccupantId) : false;
  const voiceVolume = actualOccupantId ? (userVoiceVolumes[actualOccupantId] ?? (isSpeaking ? 0.5 : 0)) : 0;
  const isShouting = isSpeaking && voiceVolume > 0.6;

  const handlePointerDown = (e: any) => {
    if (isPreview || !id) return;
    e.stopPropagation();
    isLongPressRef.current = false;
    
    // 0.5秒長押しで編集モード
    longPressTimer.current = setTimeout(() => {
      isLongPressRef.current = true;
      console.log('[DynamicFurniture] Long press detected:', id);
      setEditing(true);
      setSelectedItem(item.id);
      setMovingFurnitureId(id);
      setPreviewRotation(rotation);
    }, 500);
  };

  const handlePointerUp = (e?: any) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // 長押しではなく短押し（タップ/クリック）かつ非編集モードの場合: 座席移動！
    if (!isLongPressRef.current && !isEditing && id && item.isSeat) {
      if (e) e.stopPropagation();

      // 既に自分が座っている場合
      if (myFurnitureId === id) return;

      // 他のユーザーが座っているかチェック
      if (actualOccupantId && user && actualOccupantId !== String(user.id)) {
        const otherUser = currentOccupant?.display_name || '他のメンバー';
        addToast(`${otherUser} が使用中です`, 'leave');
        return;
      }

      // 空いている座席へ移動
      const targetSeatIdx = (gridZ ?? 0) * GRID_SIZE_X + (gridX ?? 0);
      console.log('[DynamicFurniture] Moving to seat:', { furnitureId: id, seatIdx: targetSeatIdx });
      roomActions.changeSeat(targetSeatIdx, id);
      addToast(`${item.name} に座席を移動しました`, 'join');
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

  const handlePointerOver = (e: any) => {
    if (!isPreview && !isEditing && item.isSeat) {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  return (
    <group 
      rotation={[0, rotation, 0]} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={(e) => {
        handlePointerUp();
        handlePointerOut();
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
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
