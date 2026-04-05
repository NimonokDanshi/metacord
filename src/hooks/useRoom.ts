'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useDiscordStore } from '@/store/discordStore';
import { useRoomStore } from '@/store/roomStore';
import type { PresencePayload, SeatOccupant } from '@/types/room';
import { getDiscordAvatarUrl } from '@/types/discord';
import { GRID_SIZE_X, GRID_SIZE_Z } from '@/constants/voxel';

const MAX_SEATS = GRID_SIZE_X * GRID_SIZE_Z;

function pickEmptySeat(occupiedSeats: Set<number>): number {
  for (let i = 0; i < MAX_SEATS; i++) {
    if (!occupiedSeats.has(i)) return i;
  }
  return MAX_SEATS;
}

export function useRoom() {
  const { user, instanceId } = useDiscordStore();
  const {
    setOccupants,
    upsertOccupant,
    removeOccupant,
    setMySeatIndex,
    setConnected,
  } = useRoomStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!supabase) {
      console.warn(
        '[useRoom] Supabase が未設定のため Presence 機能はスキップされます。\n' +
        '環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。'
      );
      return;
    }

    // Discordユーザー情報とインスタンスIDが取得できるまで待機
    if (!user || !instanceId) return;

    const channel = supabase.channel(`room:${instanceId}`, {
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

        // ★ SUBSCRIBED 時点で Zustand の occupants はまだ空の可能性がある。
        // channel.presenceState() から直接、他ユーザーの使用席を取得する。
        const currentState = channel.presenceState<PresencePayload>();
        const occupiedByOthers = new Set<number>();
        for (const [userId, presenceList] of Object.entries(currentState)) {
          if (userId === user.id) continue; // 再接続時の自分の古いエントリを除外
          const payload = presenceList[0] as PresencePayload;
          if (typeof payload.seat_index === 'number') {
            occupiedByOthers.add(payload.seat_index);
          }
        }

        const seatIndex = pickEmptySeat(occupiedByOthers);
        setMySeatIndex(seatIndex);

        const avatarUrl = getDiscordAvatarUrl(user);
        const displayName = user.global_name ?? (user.discriminator !== '0' ? `${user.username}#${user.discriminator}` : user.username);

        const presencePayload: PresencePayload = {
          user_id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          seat_index: seatIndex,
          joined_at: new Date().toISOString(),
        };
        await channel.track(presencePayload);
      }
    });

    return () => {
      setConnected(false);
      setMySeatIndex(null);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user, instanceId, setOccupants, upsertOccupant, removeOccupant, setMySeatIndex, setConnected]);
}
