import React from 'react';
import { VoxelButton } from './VoxelButton';
import { AvatarRarity } from '@/types/avatar';
import { RARITY_CONFIG } from '@/constants/rarity';
import { VoxelRarityBadge } from './VoxelRarityBadge';

interface Props {
  name: string;
  description?: string;
  preview: React.ReactNode;
  rarity?: AvatarRarity;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * アイテム選択画面用の汎用カードコンポーネント (レアリティ対応)
 */
export function SelectionCard({
  name,
  description,
  preview,
  rarity,
  isSelected,
  isLocked,
  onClick,
  className = ''
}: Props) {
  const rarityConfig = rarity ? RARITY_CONFIG[rarity] : null;

  // 枠線とシャドウのスタイル決定
  let cardStyles = 'bg-black/30 border-white/10 hover:border-white/30';
  if (isSelected) {
    if (rarityConfig) {
      cardStyles = `bg-black/50 border-2 ${rarityConfig.glowShadow}`;
    } else {
      cardStyles = 'bg-[#4cc9f0]/10 border-[#4cc9f0] shadow-[4px_4px_0_0_#4cc9f0]';
    }
  } else if (rarityConfig) {
    cardStyles = `bg-black/30 border ${rarityConfig.borderColor} hover:border-opacity-100`;
  }

  return (
    <div 
      className={`relative flex flex-col p-3 transition-all duration-200 ${cardStyles} ${
        isLocked ? 'opacity-50 grayscale' : ''
      } ${className}`}
      style={isSelected && rarityConfig ? {
        borderColor: rarityConfig.color,
      } : undefined}
    >
      {/* Item Preview (3D or Icon) */}
      <div className="relative aspect-square mb-3 flex items-center justify-center bg-black/40 border border-white/5 overflow-hidden">
        {/* レアリティバッジ (右上) */}
        {rarity && !isLocked && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <VoxelRarityBadge rarity={rarity} size="sm" />
          </div>
        )}

        {!isLocked ? (
          preview
        ) : (
          <span className="text-4xl">🔒</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mb-1">
        <h3 
          className="font-bold text-[11px] truncate uppercase tracking-tighter"
          style={{ color: rarityConfig ? rarityConfig.textColor : '#ffffff' }}
        >
          {name}
        </h3>
      </div>
      
      {description && (
        <p className="text-white/40 text-[9px] leading-tight h-8 overflow-hidden mb-3">
          {description}
        </p>
      )}

      <VoxelButton 
        disabled={isLocked || isSelected}
        variant={isSelected ? 'primary' : 'secondary'}
        className="w-full !text-[9px] !py-1"
        style={isSelected && rarityConfig ? {
          backgroundColor: rarityConfig.color,
          boxShadow: `0 4px 0 0 ${rarityConfig.accentColor}`,
        } : undefined}
        onClick={onClick}
      >
        {isSelected ? 'SELECTED' : isLocked ? 'LOCKED' : 'SELECT'}
      </VoxelButton>
    </div>
  );
}
