import React from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { AvatarType } from '@/types/room';
import { supabase } from '@/utils/supabase';
import { AVATAR_REGISTRY } from '@/constants/avatarRegistry';
import { AvatarPreview } from './AvatarPreview';
import { SelectionGrid } from './SelectionGrid';
import { SelectionCard } from './SelectionCard';

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
      id: 'locked' as AvatarType,
      name: 'Coming soon...',
      description: 'More avatars are under development.',
      component: () => null
    });
  }

  return (
    <SelectionGrid>
      {displayAvatars.map((avatar, index) => {
        const isSelected = avatarType === avatar.id;
        const isLocked = avatar.id === 'locked';

        return (
          <SelectionCard
            key={`${avatar.id}-${index}`}
            name={avatar.name}
            description={avatar.description}
            preview={!isLocked ? <AvatarPreview component={avatar.component} /> : null}
            isSelected={isSelected}
            isLocked={isLocked}
            onClick={() => handleSelect(avatar.id)}
          />
        );
      })}
    </SelectionGrid>
  );
}
