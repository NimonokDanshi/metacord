import React from 'react';
import { AvatarRarity } from '@/types/avatar';
import { RARITY_CONFIG } from '@/constants/rarity';
import { VoxelRarityIcon } from './VoxelRarityIcon';

interface Props {
  rarity: AvatarRarity;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * ボクセル風の角ばったレトロレアリティバッジ
 */
export function VoxelRarityBadge({
  rarity,
  showLabel = true,
  size = 'sm',
  className = '',
}: Props) {
  const config = RARITY_CONFIG[rarity];

  const sizeStyles = size === 'sm' 
    ? 'text-[8px] px-1.5 py-0.5 gap-1' 
    : 'text-[10px] px-2 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div
      className={`inline-flex items-center font-black tracking-wider uppercase backdrop-blur-sm border shadow-sm ${config.badgeBg} ${sizeStyles} ${className}`}
      style={{
        borderColor: config.color,
        color: config.textColor,
        clipPath: 'polygon(0 2px, 2px 2px, 2px 0, calc(100% - 2px) 0, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0 calc(100% - 2px))',
      }}
    >
      <VoxelRarityIcon rarity={rarity} size={iconSize} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
