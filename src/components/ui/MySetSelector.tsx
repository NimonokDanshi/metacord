import React, { useState } from 'react';
import { useDiscordStore } from '@/stores/discordStore';
import { ROOM_ITEMS } from '@/constants/roomItems';
import { FurniturePreview } from './FurniturePreview';
import { SelectionGrid } from './SelectionGrid';
import { SelectionCard } from './SelectionCard';
import { roomActions } from '@/actions/roomActions';

type MySetCategory = 'desk' | 'chair';

export function MySetSelector() {
  const { mySet } = useDiscordStore();
  const [activeCategory, setActiveCategory] = useState<MySetCategory>('desk');

  const handleSelect = async (category: MySetCategory, itemId: string) => {
    const newMySet = {
      ...mySet,
      [category]: itemId
    };

    await roomActions.updateMySet(newMySet);
  };

  const filteredItems = ROOM_ITEMS.filter(item => item.type === activeCategory);

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {(['desk', 'chair'] as const).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 font-black uppercase tracking-widest text-[11px] transition-all border-2 ${
                isActive
                  ? "bg-[#4cc9f0] border-white text-white shadow-[4px_4px_0_0_#4361ee]"
                  : "bg-black/20 border-white/10 text-white/40 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat === 'desk' ? 'DESK SET' : 'CHAIR'}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <SelectionGrid>
        {filteredItems.map((item) => {
          const isSelected = mySet[activeCategory] === item.id;
          
          return (
            <SelectionCard
              key={item.id}
              name={item.name}
              preview={<FurniturePreview item={item} />}
              isSelected={isSelected}
              onClick={() => handleSelect(activeCategory, item.id)}
            />
          );
        })}
      </SelectionGrid>
    </div>
  );
}
