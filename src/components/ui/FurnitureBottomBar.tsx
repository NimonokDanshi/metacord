'use client';

import React from 'react';
import { useRoomStore } from '@/stores/roomStore';
import { ROOM_ITEMS, ROOM_CATEGORIES } from '@/constants/roomItems';
import { FurniturePreview } from './FurniturePreview';

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
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-3xl px-4">
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
                  text-[10px] font-black uppercase tracking-tighter
                  ${isActive 
                    ? 'bg-[#4cc9f0] border-white text-white shadow-[0_4px_0_0_#4361ee] -translate-y-1' 
                    : 'bg-[#1a1a2e]/60 border-[#4361ee]/50 text-white/50 hover:text-white hover:border-[#4cc9f0]'}
                `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Main Inventory Box */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-md border-4 border-[#4361ee] p-4 shadow-[0_0_20px_rgba(67,97,238,0.4)] flex flex-col gap-3">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#4361ee]/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4cc9f0] animate-pulse" />
              <span className="text-white font-black text-xs tracking-widest uppercase opacity-70">
                {ROOM_CATEGORIES.find(c => c.id === selectedCategoryId)?.name} Inventory
              </span>
            </div>
            <span className="text-[#4cc9f0] text-[9px] font-bold tracking-widest">
              {filteredItems.length} ITEMS AVAILABLE
            </span>
          </div>

          {/* Items Grid/Carousel */}
          <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide min-h-[120px]">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(isSelected ? null : item.id)}
                    className={`
                      relative flex-shrink-0 w-24 h-24 border-4 transition-all duration-200 group
                      ${isSelected 
                        ? 'border-[#4cc9f0] bg-[#4cc9f0]/20 scale-105 shadow-[0_0_20px_#4cc9f0]/50' 
                        : 'border-[#4361ee]/30 bg-white/5 hover:border-[#4cc9f0]/50 hover:bg-white/10'}
                    `}
                  >
                    {/* 3D Model Preview */}
                    <div className="w-full h-full flex items-center justify-center">
                      <FurniturePreview item={item} />
                    </div>
                    
                    {/* Item Name Label */}
                    <div className={`
                      absolute -bottom-1 left-0 w-full py-1 transition-colors
                      ${isSelected ? 'bg-[#4cc9f0]' : 'bg-[#4361ee]/80 group-hover:bg-[#4361ee]'}
                    `}>
                      <span className="text-[8px] text-white font-black truncate block px-1 uppercase tracking-tighter">
                        {item.name}
                      </span>
                    </div>

                    {/* Selection Marker */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#4cc9f0] border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-white text-[10px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="w-full flex flex-col items-center justify-center opacity-30 gap-2">
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
