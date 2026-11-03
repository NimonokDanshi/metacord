'use client';

import React from 'react';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';

const EMOTES = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'heart', emoji: '❤️', label: 'Heart' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'question', emoji: '❓', label: 'Question' },
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
];

export function EmoteBar() {
  const { presenceService, setUserEmote } = useRoomStore();
  const { user } = useDiscordStore();

  const handleSendEmote = (emoji: string) => {
    if (!user) return;
    // ローカルストアに即時反映
    setUserEmote(user.id, emoji);
    // 同じボイスチャンネルの全参加者にブロードキャスト
    if (presenceService) {
      presenceService.broadcastEmote(emoji);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-[45] flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-md border-2 border-[#4361ee]/60 rounded-xl shadow-[4px_4px_0_0_#4361ee]/30 select-none">
      <div className="text-[10px] font-black text-blue-300 uppercase px-2 tracking-wider hidden sm:block">
        EMOTE
      </div>
      <div className="flex items-center gap-1">
        {EMOTES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSendEmote(item.emoji)}
            title={item.label}
            className="w-9 h-9 flex items-center justify-center text-lg bg-slate-800/80 hover:bg-[#4cc9f0] hover:text-black rounded-lg transition-all border border-white/10 hover:border-cyan-300 hover:scale-110 active:scale-95 shadow-sm"
          >
            <span className="transform active:translate-y-0.5">{item.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
