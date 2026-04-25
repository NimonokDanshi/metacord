import React from 'react';
import { BaseVoxelMember } from './BaseVoxelMember';
import { getAvatarComponent } from '@/constants/avatarRegistry';
import type { SeatOccupant } from '@/types/room';
import type { VoiceState } from '@/types/discord';

interface Props {
  occupant: SeatOccupant;
  voiceState?: VoiceState;
}

/**
 * VoxelMember (Facade)
 * プロジェクト標準のアトラスやポーズを選択して、アバターを組み立てる。
 */
export function VoxelMember({ occupant, voiceState }: Props) {
  // レジストリからモデルコンポーネントを取得
  const AvatarModel = getAvatarComponent(occupant.avatar_type);

  const isSitting = !!occupant.furniture_id;
  
  return (
    <BaseVoxelMember occupant={occupant} voiceState={voiceState}>
      <AvatarModel isSitting={isSitting} />
    </BaseVoxelMember>
  );
}
