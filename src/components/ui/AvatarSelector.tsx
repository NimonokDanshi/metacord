import React from 'react';
import { VoxelButton } from './VoxelButton';
import { useDiscordStore } from '@/store/discordStore';
import { AvatarType } from '@/types/room';
import { supabase } from '@/lib/supabase';

interface AvatarItem {
  id: AvatarType;
  name: string;
  description: string;
}

const AVATARS: AvatarItem[] = [
  { id: 'default', name: 'Standard Bot', description: 'The classic blue voxel bot.' },
  { id: 'penguin', name: 'Polar Penguin', description: 'A chilly friend from the south pole.' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
  { id: 'default', name: 'Locked', description: 'Coming soon...' },
];

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {AVATARS.map((avatar, index) => {
        const isSelected = avatarType === avatar.id && avatar.name !== 'Locked';
        const isLocked = avatar.name === 'Locked';

        return (
          <div 
            key={`${avatar.id}-${index}`}
            className={`flex flex-col p-3 border-2 transition-all duration-200 ${
              isSelected 
              ? "bg-[#4cc9f0]/10 border-[#4cc9f0] shadow-[4px_4px_0_0_#4cc9f0]" 
              : "bg-black/20 border-white/10 hover:border-white/30"
            } ${isLocked ? "opacity-50 grayscale" : ""}`}
          >
            {/* Preview Placeholder */}
            <div className={`aspect-square mb-3 flex items-center justify-center bg-black/40 border-2 border-white/5`}>
              {avatar.id === 'penguin' ? (
                <span className="text-4xl">🐧</span>
              ) : avatar.id === 'default' && avatar.name !== 'Locked' ? (
                <span className="text-4xl">🤖</span>
              ) : (
                <span className="text-4xl">🔒</span>
              )}
            </div>

            <h3 className="text-white font-bold text-sm mb-1 truncate">{avatar.name}</h3>
            <p className="text-white/40 text-[10px] leading-tight h-8 overflow-hidden mb-3">
              {avatar.description}
            </p>

            <VoxelButton 
              disabled={isLocked || isSelected}
              variant={isSelected ? "primary" : "secondary"}
              className="w-full !text-[10px] !py-1"
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
