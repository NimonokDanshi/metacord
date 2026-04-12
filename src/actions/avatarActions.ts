import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { useRoomStore } from '@/stores/roomStore';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { HEIGHT_MEMBER_SITTING, HEIGHT_MEMBER_STANDING } from '@/constants/voxel';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

export function useAvatarLogic(occupant: SeatOccupant, voiceState?: VoiceState) {
  const { getPositionFromSeat, getWorldFromGrid } = useVoxelGrid();
  const { furnitures } = useRoomStore();
  const groupRef = useRef<THREE.Group>(null);

  // 座席座標の計算
  const pos = useMemo(() => {
    // 1. 家具に紐付いている場合
    if (occupant.furniture_id) {
      const furniture = furnitures.find(f => f.id === occupant.furniture_id);
      if (furniture) {
        const item = ROOM_ITEMS.find(it => it.id === furniture.item_id);
        const basePos = getWorldFromGrid(furniture.pos_x, furniture.pos_z, 0);
        
        if (item?.seatOffset) {
          const { x, y, z } = item.seatOffset;
          // 家具の回転に合わせてオフセットを計算
          const offset = new THREE.Vector3(x, y, z);
          offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), furniture.rotation);
          
          return {
            x: basePos.x + offset.x,
            y: basePos.y + offset.y + (occupant.furniture_id ? HEIGHT_MEMBER_SITTING : HEIGHT_MEMBER_STANDING),
            z: basePos.z + offset.z,
            rotation: furniture.rotation + item.seatOffset.rotation
          };
        }
      }
    }

    // 2. 家具がない場合のフォールバック（従来のグリッド配置）
    const seatIdx = Number(occupant.seat_index);
    const gridPos = getPositionFromSeat(seatIdx, HEIGHT_MEMBER_STANDING);
    return { ...gridPos, rotation: 0 };
  }, [occupant, furnitures, getWorldFromGrid, getPositionFromSeat]);

  // ミュート・デフ状態の判定
  const isMuted = voiceState?.voice_state?.self_mute || voiceState?.mute;
  const isDeaf = voiceState?.voice_state?.self_deaf || voiceState?.voice_state?.deaf;
  const isSpeaking = voiceState?.voice_state?.self_video || false;

  // アニメーションと同期
  useFrame((state) => {
    if (groupRef.current && pos) {
      // 位置の更新
      groupRef.current.position.x = pos.x;
      groupRef.current.position.z = pos.z;
      // わずかに上下に呼吸しているような動き
      groupRef.current.position.y = pos.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      
      // 向きの更新
      groupRef.current.rotation.y = pos.rotation;
    }
  });

  return {
    groupRef,
    pos,
    isMuted,
    isDeaf,
    isSpeaking,
    displayName: occupant.display_name,
    avatarUrl: occupant.avatar_url,
  };
}

