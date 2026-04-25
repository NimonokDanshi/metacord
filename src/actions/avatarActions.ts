import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useVoxelGrid } from '@/utils/voxelGrid';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
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
  
  // Discord SDK からのリアルタイム発言状態を取得
  const speakingUserIds = useDiscordStore(s => s.speakingUserIds);
  const isSpeaking = speakingUserIds.has(occupant.user_id);
 
  // アニメーションと同期
  useFrame((state) => {
    if (groupRef.current && pos) {
      // 位置の更新
      groupRef.current.position.x = pos.x;
      groupRef.current.position.z = pos.z;
 
      // 基本の呼吸モーション
      let targetY = pos.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
 
      // 喋っている時のジャンプモーション (Rich Aesthetics)
      if (isSpeaking) {
        targetY += Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.15;
        // 喋っている時は少し体を揺らす
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.05;
      } else {
        groupRef.current.rotation.z = 0;
      }
 
      groupRef.current.position.y = targetY;
      
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

