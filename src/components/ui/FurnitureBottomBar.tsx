'use client';

import React from 'react';
import { useRoomStore } from '@/stores/roomStore';
import { ROOM_ITEMS, ROOM_CATEGORIES } from '@/constants/roomItems';
import { FurniturePreview } from './FurniturePreview';
import { RARITY_CONFIG } from '@/constants/rarity';
import { VoxelRarityBadge } from './VoxelRarityBadge';

export function FurnitureBottomBar() {
  const { 
    isEditing, 
    selectedItemId, 
    selectedCategoryId,
    setSelectedItem, 
    setCategoryId 
  } = useRoomStore();

  if (!isEditing) return null;

  // 選択されたカテゴリーに基づいてアイテムをフィルタリング
  const filteredItems = ROOM_ITEMS.filter(item => item.type === selectedCategoryId);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4">
      <div className="flex flex-col gap-2">
        
        {/* Category Tabs (Outside the main box) */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
          {ROOM_CATEGORIES.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-1.5 border-2 transition-all duration-200
                  text-[11px] font-black uppercase tracking-tighter
                  ${isActive 
                    ? 'bg-[#4cc9f0] border-white text-white shadow-[0_4px_0_0_#4361ee] -translate-y-1' 
                    : 'bg-[#1a1a2e]/80 border-[#4361ee]/50 text-white/60 hover:text-white hover:border-[#4cc9f0]'}
                `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Main Inventory Box */}
        <div className="bg-[#1a1a2e]/90 backdrop-blur-md border-4 border-[#4361ee] p-4 shadow-[0_0_24px_rgba(67,97,238,0.5)] flex flex-col gap-3">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#4361ee]/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#4cc9f0] animate-pulse" />
              <span className="text-white font-black text-xs tracking-widest uppercase opacity-80">
                {ROOM_CATEGORIES.find(c => c.id === selectedCategoryId)?.name} Inventory
              </span>
            </div>
            <span className="text-[#4cc9f0] text-[10px] font-bold tracking-widest">
              {filteredItems.length} ITEMS AVAILABLE
            </span>
          </div>

          {/* Items Grid/Carousel (横スクロール対応 & 大判カード) */}
          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-slate-800/40 min-h-[148px]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const rarity = item.rarity || 'common';
                const rarityConfig = RARITY_CONFIG[rarity];

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(isSelected ? null : item.id)}
                    className={`
                      relative flex-shrink-0 w-32 h-32 border-4 transition-all duration-200 group flex flex-col overflow-hidden
                      ${isSelected 
                        ? 'scale-105 shadow-[0_0_20px_rgba(76,201,240,0.6)]' 
                        : 'hover:scale-102'}
                      bg-[radial-gradient(circle_at_center,_#334155_0%,_#1e293b_60%,_#090d16_100%)]
                    `}
                    style={{
                      borderColor: isSelected ? '#4cc9f0' : (rarityConfig ? rarityConfig.color : '#4361ee'),
                      boxShadow: isSelected 
                        ? `0 0 20px ${rarityConfig ? rarityConfig.color : '#4cc9f0'}` 
                        : (rarity !== 'common' ? `0 0 10px ${rarityConfig.color}40` : undefined),
                    }}
                  >
                    {/* レアリティバッジ */}
                    {item.rarity && (
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <VoxelRarityBadge rarity={item.rarity} size="sm" showLabel={false} />
                      </div>
                    )}

                    {/* 3D Model Preview */}
                    <div className="w-full flex-1 flex items-center justify-center p-1 overflow-hidden">
                      <FurniturePreview item={item} />
                    </div>
                    
                    {/* Item Name Label */}
                    <div className={`
                      w-full py-1 transition-colors border-t border-black/20
                      ${isSelected ? 'bg-[#4cc9f0]' : 'bg-[#4361ee]/90 group-hover:bg-[#4361ee]'}
                    `}
                    style={!isSelected && rarity !== 'common' ? {
                      backgroundColor: `${rarityConfig.color}cc`,
                    } : undefined}
                    >
                      <span className="text-[9px] text-white font-black truncate block px-1 uppercase tracking-tighter text-center">
                        {item.name}
                      </span>
                    </div>

                    {/* Selection Marker */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-[#4cc9f0] border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-white text-[10px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="w-full flex flex-col items-center justify-center opacity-40 gap-2 py-4">
                <div className="w-8 h-8 border-2 border-dashed border-white/50 animate-spin" />
                <span className="text-white text-[10px] font-bold">NO ITEMS IN THIS CATEGORY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
