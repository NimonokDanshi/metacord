import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useVoxelGrid } from '@/hooks/useVoxelGrid';
import { useDiscordStore } from '@/store/discordStore';
import { COLORS, HEIGHT_MEMBER_SITTING } from '@/constants/voxel';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

interface Props {
  occupant: SeatOccupant;
  voiceState?: VoiceState;
}

export function VoxelMember({ occupant, voiceState }: Props) {
  const { getPositionFromSeat } = useVoxelGrid();
  const { addLogMessage } = useDiscordStore();
  const groupRef = useRef<THREE.Group>(null);

  // コンポーネントが呼び出された瞬間にログを出す (useEffectに頼らない)
  // 複数回呼ばれるのを防ぐため、コンソールにも出力
  console.log(`[VoxelMember Trace] Rendering ${occupant.display_name}`, occupant);

  // 座席インデックスに基づいて 3D 座標を取得
  const seatIdx = Number(occupant.seat_index);
  const pos = getPositionFromSeat(seatIdx, HEIGHT_MEMBER_SITTING);

  useEffect(() => {
    addLogMessage(`[Render OK] ${occupant.display_name}: seat ${seatIdx} (x:${pos.x.toFixed(2)}, z:${pos.z.toFixed(2)})`);
  }, [occupant.display_name, seatIdx, pos, addLogMessage]);

  if (!pos || isNaN(pos.x) || isNaN(pos.z)) {
    return null;
  }

  // 待機時のアニメーション (着席時は控えめに)
  useFrame((state) => {
    if (groupRef.current) {
      // わずかに呼吸しているような動き
      groupRef.current.position.y = pos.y + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  const isMuted = voiceState?.voice_state?.self_mute || voiceState?.mute;
  const isDeaf = voiceState?.voice_state?.self_deaf || voiceState?.voice_state?.deaf;

  return (
    <group ref={groupRef} position={[pos.x, 0.5, pos.z]}>
      {/* 体 (Blue Voxel) */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color={COLORS.AVATAR_BLUE} />
      </mesh>
      
      {/* 頭 (Skin Voxel) */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={COLORS.AVATAR_SKIN} />
      </mesh>

      {/* 2.5D Overlay: 名前とアイコン */}
      <Html
        position={[0, 1.2, 0]}
        center
        occlude={false}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center gap-1">
          {/* アバターコンテナ */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-full border-2 ${isMuted ? 'border-red-500' : 'border-white'} overflow-hidden shadow-lg bg-[#2c3e50]`}>
              <img 
                src={occupant.avatar_url || ''} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* ステータスバッジ */}
            {(isMuted || isDeaf) && (
              <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                {isMuted && (
                  <div className="bg-red-600 text-[8px] p-0.5 rounded-full shadow-md border border-white/20">🔇</div>
                )}
                {isDeaf && (
                  <div className="bg-slate-700 text-[8px] p-0.5 rounded-full shadow-md border border-white/20">🎧❌</div>
                )}
              </div>
            )}
          </div>
          {/* 名前タグ */}
          <div className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
            {occupant.display_name}
          </div>
        </div>
      </Html>
    </group>
  );
}
