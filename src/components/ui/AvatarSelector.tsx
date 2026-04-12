import React from 'react';
import { VoxelButton } from './VoxelButton';
import { useDiscordStore } from '@/stores/discordStore';
import { AvatarType } from '@/types/room';
import { supabase } from '@/utils/supabase';
import { AVATAR_REGISTRY } from '@/constants/avatarRegistry';
import { AvatarPreview } from './AvatarPreview';

export function AvatarSelector() {
  const { user, avatarType, setAvatarType, addLogMessage } = useDiscordStore();

  const handleSelect = async (type: AvatarType) => {
    if (!user) return;
    
    // UIを即座に更新 (Optimistic UI)
    setAvatarType(type);
    
    // Supabase を更新
    if (supabase) {
      addLogMessage(`[AvatarSelector] Updating avatar to ${type}...`);
      const { error } = await (supabase.from('m_users') as any)
        .update({ avatar_id: type })
        .eq('user_id', user.id);

      if (error) {
        addLogMessage(`[AvatarSelector] Error updating avatar: ${error.message}`);
      } else {
        addLogMessage(`[AvatarSelector] Avatar updated in DB: ${type}`);
      }
    }
  };

  // 表示用にグリッドを埋める (空きはLockedとして表示)
  const displayAvatars = [...AVATAR_REGISTRY];
  while (displayAvatars.length < 8) {
    displayAvatars.push({
      id: 'locked',
      name: 'Coming soon...',
      description: 'More avatars are under development.',
      component: () => null
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {displayAvatars.map((avatar, index) => {
        const isSelected = avatarType === avatar.id;
        const isLocked = avatar.id === 'locked';

        return (
          <div 
            key={`${avatar.id}-${index}`}
            className={`flex flex-col p-3 border-2 transition-all duration-200 ${
              isSelected 
              ? "bg-[#4cc9f0]/10 border-[#4cc9f0] shadow-[4px_4px_0_0_#4cc9f0]" 
              : "bg-black/20 border-white/10 hover:border-white/30"
            } ${isLocked ? "opacity-50 grayscale" : ""}`}
          >
            {/* 3D Preview */}
            <div className={`aspect-square mb-3 flex items-center justify-center bg-black/40 border-2 border-white/5 overflow-hidden`}>
              {!isLocked ? (
                <AvatarPreview component={avatar.component} />
              ) : (
                <span className="text-4xl">🔒</span>
              )}
            </div>

            <h3 className="text-white font-bold text-[11px] mb-1 truncate uppercase tracking-tighter">{avatar.name}</h3>
            <p className="text-white/40 text-[9px] leading-tight h-8 overflow-hidden mb-3">
              {avatar.description}
            </p>

            <VoxelButton 
              disabled={isLocked || isSelected}
              variant={isSelected ? "primary" : "secondary"}
              className="w-full !text-[9px] !py-1"
              onClick={() => handleSelect(avatar.id)}
            >
              {isSelected ? "SELECTED" : isLocked ? "LOCKED" : "SELECT"}
            </VoxelButton>
          </div>
        );
      })}
    </div>
  );
}
