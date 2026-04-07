import React from 'react';
import { BaseVoxelMember } from './BaseVoxelMember';
import { DefaultAvatarModel } from './models/DefaultAvatarModel';
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
  return (
    <BaseVoxelMember occupant={occupant} voiceState={voiceState}>
      {/* 
        現在はデフォルトモデルを使用。
        将来的に `occupant.avatar_id` 等でモデルを条件分岐可能。
      */}
      <DefaultAvatarModel isSitting={true} />
    </BaseVoxelMember>
  );
}
