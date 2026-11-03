import React from 'react';
import { Html } from '@react-three/drei';
import { useAvatarLogic } from '@/actions/avatarActions';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

interface Props {
  occupant: SeatOccupant;
  voiceState?: VoiceState;
  isLeaving?: boolean;
  children: React.ReactNode;
}

export function BaseVoxelMember({ occupant, voiceState, isLeaving = false, children }: Props) {
  const {
    groupRef,
    pos,
    isMuted,
    isDeaf,
    isSpeaking,
    voiceVolume,
    isShouting,
    activeEmote,
    displayName,
    avatarUrl,
  } = useAvatarLogic(occupant, voiceState, isLeaving);

  if (!pos || isNaN(pos.x) || isNaN(pos.z)) {
    return null;
  }

  const isSitting = !!occupant.furniture_id;
  // 角や耳が高いアバター (Dragon, Bunny, Kitsune) は頭上マージンを大きく確保
  const isTallAvatar =
    occupant.avatar_type === 'mecha-dragon' ||
    occupant.avatar_type === 'cyber-bunny' ||
    occupant.avatar_type === 'cyber-kitsune';
  const hudY = isSitting 
    ? (isTallAvatar ? 1.35 : 1.15) 
    : (isTallAvatar ? 1.55 : 1.35);

  return (
    <group ref={groupRef} position={[pos.x, pos.y, pos.z]}>
      {/* アバターの外見（子要素として注入し、ボイス発言状態・音量・シャウトを透過的に伝播） */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            isSpeaking,
            voiceVolume,
            isShouting,
          })
        : children}
 
      {/* 2.5D HUD: カメラのズームイン・ズームアウトに連動してアバターと同じ比率で拡縮 */}
      <Html
        position={[0, hudY, 0]}
        center
        transform
        sprite
        scale={0.28}
        occlude={false}
        className={`pointer-events-none select-none transition-opacity duration-300 ${isLeaving ? 'opacity-0' : 'opacity-100'}`}
        zIndexRange={[100, 0]}
      >
        <div className="flex flex-col items-center gap-1.5 transform-gpu">
          {/* エモート吹き出し (存在する場合にポップアップ表示) */}
          {activeEmote && (
            <div className="animate-bounce mb-1">
              <div className="bg-slate-900/95 border-2 border-yellow-400 px-3 py-1 rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center justify-center transform -translate-y-1">
                <span className="text-2xl filter drop-shadow">{activeEmote}</span>
              </div>
              {/* 吹き出しの三角のしっぽ */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-yellow-400 mx-auto -mt-0.5" />
            </div>
          )}

          {/* プロフィールアイコン */}
          <div className="relative">
            {/* Speaking / Shouting Ring */}
            {isShouting ? (
              <div className="absolute inset-0 -m-2 rounded-full border-2 border-amber-400 animate-ping opacity-90 shadow-[0_0_16px_#f59e0b]" />
            ) : isSpeaking ? (
              <div className="absolute inset-0 -m-1.5 rounded-full border-2 border-green-400 animate-ping opacity-75" />
            ) : null}
            
            <div className={`w-9 h-9 rounded-full border-2 ${
              isShouting
                ? 'border-amber-400 shadow-[0_0_16px_#f59e0b]'
                : isSpeaking
                ? 'border-green-400 shadow-[0_0_12px_#4ade80]'
                : isMuted
                ? 'border-red-500'
                : 'border-white'
            } overflow-hidden shadow-lg bg-[#2c3e50] transition-colors`}>
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
                  <div className="bg-red-600 text-[9px] p-0.5 rounded-full shadow-md border border-white/20">🔇</div>
                )}
                {isDeaf && (
                  <div className="bg-slate-700 text-[9px] p-0.5 rounded-full shadow-md border border-white/20">🎧</div>
                )}
              </div>
            )}
          </div>
          {/* 名前タグ */}
          <div className={`flex items-center gap-1.5 ${
            isShouting
              ? 'bg-gradient-to-r from-amber-600 to-rose-600 font-black shadow-[0_0_12px_#f59e0b]'
              : isSpeaking
              ? 'bg-green-600/90 font-bold'
              : 'bg-black/85 font-medium'
          } text-white text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md transition-colors border border-white/10`}>
            {isShouting ? (
              <span className="animate-bounce">🔥</span>
            ) : isSpeaking ? (
              <span className="animate-pulse">🔊</span>
            ) : null}
            {displayName}
          </div>
        </div>
      </Html>
    </group>
  );
}
