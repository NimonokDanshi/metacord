import React from 'react';
import { Html } from '@react-three/drei';
import { useAvatarLogic } from '@/hooks/useAvatarLogic';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

interface Props {
  occupant: SeatOccupant;
  voiceState?: VoiceState;
  children: React.ReactNode;
}

export function BaseVoxelMember({ occupant, voiceState, children }: Props) {
  const { groupRef, pos, isMuted, isDeaf, displayName, avatarUrl } = useAvatarLogic(occupant, voiceState);

  if (!pos || isNaN(pos.x) || isNaN(pos.z)) {
    return null;
  }

  return (
    <group ref={groupRef} position={[pos.x, pos.y, pos.z]}>
      {/* アバターの外見（子要素として注入） */}
      {children}

      {/* 2.5D HUD: 名前カードとDiscordステータス */}
      <Html
        position={[0, 1.2, 0]}
        center
        occlude={false}
        className="pointer-events-none select-none"
        zIndexRange={[100, 0]}
      >
        <div className="flex flex-col items-center gap-1">
          {/* プロフィールアイコン */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-full border-2 ${isMuted ? 'border-red-500' : 'border-white'} overflow-hidden shadow-lg bg-[#2c3e50]`}>
              <img
                src={avatarUrl || ''}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {/* ステータスアイコン (ミュート/デフ) */}
            {(isMuted || isDeaf) && (
              <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                {isMuted && (
                  <div className="bg-red-600 text-[8px] p-0.5 rounded-full shadow-md border border-white/20">🔇</div>
                )}
                {isDeaf && (
                  <div className="bg-slate-700 text-[8px] p-0.5 rounded-full shadow-md border border-white/20">🎧</div>
                )}
              </div>
            )}
          </div>
          {/* 名前タグ */}
          <div className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
            {displayName}
          </div>
        </div>
      </Html>
    </group>
  );
}
