'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useDiscordStore } from '@/store/discordStore';
import { useRoomStore } from '@/store/roomStore';
import type { PresencePayload, SeatOccupant } from '@/types/room';
import { getDiscordAvatarUrl } from '@/types/discord';
import { GRID_COLS, GRID_ROWS } from '@/constants/layout';

const MAX_SEATS = GRID_COLS * GRID_ROWS;

function pickEmptySeat(occupiedSeats: Set<number>): number {
  for (let i = 0; i < MAX_SEATS; i++) {
    if (!occupiedSeats.has(i)) return i;
  }
  return MAX_SEATS;
}

export function useRoom(channelName: string) {
  const { user } = useDiscordStore();
  const {
    setOccupants,
    upsertOccupant,
    removeOccupant,
    setMySeatIndex,
    setConnected,
    getOccupiedSeats,
  } = useRoomStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Supabaseが未設定の場合は接続しない（コンソールに警告を出すだけ）
    if (!supabase) {
      console.warn(
        '[useRoom] Supabase が未設定のため Presence 機能はスキップされます。\n' +
        '環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。'
      );
      return;
    }

    // Discordユーザー情報が取得できるまで待機
    if (!user) return;

    const channel = supabase.channel(`room:${channelName}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>();
      const next = new Map<string, SeatOccupant>();
      for (const [userId, presenceList] of Object.entries(state)) {
        const payload = presenceList[0] as PresencePayload;
        next.set(userId, {
          user_id: payload.user_id,
          display_name: payload.display_name,
          avatar_url: payload.avatar_url,
          seat_index: payload.seat_index,
        });
      }
      setOccupants(next);
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      for (const p of newPresences) {
        const payload = p as unknown as PresencePayload;
        upsertOccupant({
          user_id: payload.user_id,
          display_name: payload.display_name,
          avatar_url: payload.avatar_url,
          seat_index: payload.seat_index,
        });
      }
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) {
        const payload = p as unknown as PresencePayload;
        removeOccupant(payload.user_id);
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true);
        const occupiedSeats = getOccupiedSeats();
        const seatIndex = pickEmptySeat(occupiedSeats);
        setMySeatIndex(seatIndex);

        const avatarUrl = user.avatar ? getDiscordAvatarUrl(user) : null;
        const payload: PresencePayload = {
          user_id: user.id,
          display_name: user.global_name ?? user.username,
          avatar_url: avatarUrl,
          seat_index: seatIndex,
          joined_at: new Date().toISOString(),
        };
        await channel.track(payload);
      }
    });

    return () => {
      setConnected(false);
      setMySeatIndex(null);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user, channelName, setOccupants, upsertOccupant, removeOccupant, setMySeatIndex, setConnected, getOccupiedSeats]);
}
