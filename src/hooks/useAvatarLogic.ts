import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { HEIGHT_MEMBER_SITTING } from '@/constants/voxel';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

export function useAvatarLogic(occupant: SeatOccupant, voiceState?: VoiceState) {
  const { getPositionFromSeat } = useVoxelGrid();
  const groupRef = useRef<THREE.Group>(null);

  // 座席インデックスに基づいて 3D 座標を取得
  const seatIdx = Number(occupant.seat_index);
  const pos = getPositionFromSeat(seatIdx, HEIGHT_MEMBER_SITTING);

  // ミュート・デフ状態の判定
  const isMuted = voiceState?.voice_state?.self_mute || voiceState?.mute;
  const isDeaf = voiceState?.voice_state?.self_deaf || voiceState?.voice_state?.deaf;
  const isSpeaking = voiceState?.voice_state?.self_video || false; // 仮: 実際は別イベントで判定予定

  // 呼吸アニメーション
  useFrame((state) => {
    if (groupRef.current && pos) {
      // わずかに上下に呼吸しているような動き
      groupRef.current.position.y = pos.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
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
