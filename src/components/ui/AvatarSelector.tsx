import React from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { AvatarType } from '@/types/room';
import { AVATAR_REGISTRY } from '@/constants/avatarRegistry';
import { AvatarRarity } from '@/types/avatar';
import { AvatarPreview } from './AvatarPreview';
import { SelectionGrid } from './SelectionGrid';
import { SelectionCard } from './SelectionCard';
import { roomActions } from '@/actions/roomActions';

const COMING_SOON_RARITIES: AvatarRarity[] = ['epic', 'legendary', 'ultimate', 'rare', 'common'];

export function AvatarSelector() {
  const { avatarType } = useDiscordStore();

  const handleSelect = async (type: AvatarType) => {
    await roomActions.updateAvatar(type);
  };

  // 表示用にグリッドを埋める (空きはLockedとして表示)
  const displayAvatars = [...AVATAR_REGISTRY];
  let placeholderIndex = 0;
  while (displayAvatars.length < 8) {
    const rarity = COMING_SOON_RARITIES[placeholderIndex % COMING_SOON_RARITIES.length];
    displayAvatars.push({
      id: `locked-${placeholderIndex}` as AvatarType,
      name: 'Coming soon...',
      description: `${rarity.toUpperCase()} avatar under development.`,
      rarity,
      component: () => null
    });
    placeholderIndex++;
  }

  return (
    <SelectionGrid>
      {displayAvatars.map((avatar, index) => {
        const isSelected = avatarType === avatar.id;
        const isLocked = avatar.id.startsWith('locked');

        return (
          <SelectionCard
            key={`${avatar.id}-${index}`}
            name={avatar.name}
            description={avatar.description}
            rarity={avatar.rarity}
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
