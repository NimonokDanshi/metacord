import React from 'react';
import { BaseVoxelMember } from './BaseVoxelMember';
import { DefaultAvatarModel } from './models/DefaultAvatarModel';
import { PenguinModel } from './models/PenguinModel';
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
  // デバッグ用に一旦ペンギンを表示
  return (
    <BaseVoxelMember occupant={occupant} voiceState={voiceState}>
      <PenguinModel isSitting={true} />
    </BaseVoxelMember>
  );
}
