import React from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { AvatarType } from '@/types/room';
import { AVATAR_REGISTRY } from '@/constants/avatarRegistry';
import { AvatarPreview } from './AvatarPreview';
import { SelectionGrid } from './SelectionGrid';
import { SelectionCard } from './SelectionCard';
import { roomActions } from '@/actions/roomActions';

export function AvatarSelector() {
  const { avatarType } = useDiscordStore();

  const handleSelect = async (type: AvatarType) => {
    await roomActions.updateAvatar(type);
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
