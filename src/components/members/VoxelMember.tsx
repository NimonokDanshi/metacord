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
  // アバタータイプに基づいて描画するモデルを切り替え
  const renderModel = () => {
    switch (occupant.avatar_type) {
      case 'penguin':
        return <PenguinModel isSitting={true} />;
      case 'default':
      default:
        return <DefaultAvatarModel isSitting={true} />;
    }
  };

  return (
    <BaseVoxelMember occupant={occupant} voiceState={voiceState}>
      {renderModel()}
    </BaseVoxelMember>
  );
}
