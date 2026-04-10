'use client';

import React from 'react';
import { useRoomStore } from '@/store/roomStore';
import { ROOM_ITEMS } from '../../constants/items';

export function FurnitureBottomBar() {
  const { isEditing, selectedItemId, setSelectedItem } = useRoomStore();

  if (!isEditing) return null;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4">
      <div className="bg-[#1a1a2e]/80 backdrop-blur-md border-4 border-[#4361ee] p-4 shadow-[0_0_20px_rgba(67,97,238,0.4)] flex flex-col gap-3">
        {/* Title */}
        <div className="flex justify-between items-center">
          <span className="text-white font-black text-xs tracking-widest uppercase opacity-70">
            Furniture Inventory
          </span>
          <span className="text-[#4cc9f0] text-[10px] font-bold">
            SELECT TO PLACE
          </span>
        </div>

        {/* Items Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {ROOM_ITEMS.map((item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(isSelected ? null : item.id)}
                className={`
                  relative flex-shrink-0 w-20 h-20 border-4 transition-all
                  ${isSelected 
                    ? 'border-[#4cc9f0] bg-[#4cc9f0]/20 scale-105 shadow-[0_0_15px_#4cc9f0]' 
                    : 'border-[#4361ee]/50 bg-white/5 hover:border-[#4cc9f0]/50'}
                `}
              >
                {/* Item Thumbnail Placeholder (Voxel-ish box) */}
                <div className="w-full h-full flex items-center justify-center p-2">
                  <div className={`w-8 h-8 ${isSelected ? 'bg-[#4cc9f0]' : 'bg-[#4361ee]'} shadow-[2px_2px_0_0_#3f37c9] opacity-80`} />
                </div>
                
                {/* Item Name Label */}
                <div className="absolute -bottom-1 left-0 w-full bg-[#4361ee] py-0.5">
                  <span className="text-[8px] text-white font-black truncate block px-1 uppercase">
                    {item.name}
                  </span>
                </div>

                {/* Selection Marker */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#4cc9f0] border-2 border-white rotate-45" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
