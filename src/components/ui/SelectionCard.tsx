import React from 'react';
import { VoxelButton } from './VoxelButton';

interface Props {
  name: string;
  description?: string;
  preview: React.ReactNode;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * アイテム選択画面用の汎用カードコンポーネント
 */
export function SelectionCard({
  name,
  description,
  preview,
  isSelected,
  isLocked,
  onClick,
  className = ''
}: Props) {
  return (
    <div 
      className={`flex flex-col p-3 border-2 transition-all duration-200 ${
        isSelected 
        ? "bg-[#4cc9f0]/10 border-[#4cc9f0] shadow-[4px_4px_0_0_#4cc9f0]" 
        : "bg-black/20 border-white/10 hover:border-white/30"
      } ${isLocked ? "opacity-50 grayscale" : ""} ${className}`}
    >
      {/* Item Preview (3D or Icon) */}
      <div className={`aspect-square mb-3 flex items-center justify-center bg-black/40 border-2 border-white/5 overflow-hidden`}>
        {!isLocked ? (
          preview
        ) : (
          <span className="text-4xl">🔒</span>
        )}
      </div>

      <h3 className="text-white font-bold text-[11px] mb-1 truncate uppercase tracking-tighter">
        {name}
      </h3>
      
      {description && (
        <p className="text-white/40 text-[9px] leading-tight h-8 overflow-hidden mb-3">
          {description}
        </p>
      )}

      <VoxelButton 
        disabled={isLocked || isSelected}
        variant={isSelected ? "primary" : "secondary"}
        className="w-full !text-[9px] !py-1"
        onClick={onClick}
      >
        {isSelected ? "SELECTED" : isLocked ? "LOCKED" : "SELECT"}
      </VoxelButton>
    </div>
  );
}
