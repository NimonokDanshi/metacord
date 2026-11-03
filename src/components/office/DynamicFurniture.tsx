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
  
  // タップ・クリック判定用の参照 (マウスオーバーやドラッグ回転での誤動作を完全防止)
  const pointerDownPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const isPointerDownRef = React.useRef<boolean>(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = React.useRef<boolean>(false);

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

    isPointerDownRef.current = true;
    isLongPressTriggeredRef.current = false;
    // 押下位置を記録 (ドラッグ操作と短押しクリックを判別)
    pointerDownPosRef.current = {
      x: e.clientX ?? e.nativeEvent?.clientX ?? 0,
      y: e.clientY ?? e.nativeEvent?.clientY ?? 0,
    };
    
    // 0.5秒長押しで編集モード
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      console.log('[DynamicFurniture] Long press detected:', id);
      setEditing(true);
      setSelectedItem(item.id);
      setMovingFurnitureId(id);
      setPreviewRotation(rotation);
    }, 500);
  };

  const handlePointerUp = (e: any) => {
    // 押下状態でない場合は即終了 (マウスが通過しただけの誤発火を100%遮断)
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // 長押しモードが発火した場合は座席移動しない
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    // カメラ回転ドラッグ等でポインタが一定以上動いた場合はクリックとみなさない
    const currentX = e.clientX ?? e.nativeEvent?.clientX ?? 0;
    const currentY = e.clientY ?? e.nativeEvent?.clientY ?? 0;
    if (pointerDownPosRef.current) {
      const dist = Math.hypot(currentX - pointerDownPosRef.current.x, currentY - pointerDownPosRef.current.y);
      if (dist > 8) {
        return; // カメラドラッグ移動と判定
      }
    }

    // 正真正銘の「短押しタップ / クリック」で座席移動
    if (!isEditing && id && item.isSeat) {
      e.stopPropagation();

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
      console.log('[DynamicFurniture] Clicked to move to seat:', { furnitureId: id, seatIdx: targetSeatIdx });
      roomActions.changeSeat(targetSeatIdx, id);
      addToast(`${item.name} に座席を移動しました`, 'join');
    }
  };

  // マウスが外に出た時は状態をリセットするのみ（移動処理は絶対に呼ばない）
  const handlePointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isPointerDownRef.current = false;
    isLongPressTriggeredRef.current = false;
    pointerDownPosRef.current = null;
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
      onPointerLeave={handlePointerLeave}
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
