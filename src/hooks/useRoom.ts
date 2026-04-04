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

/**
 * 空席の中から最小のseat_indexを返す
 * @param occupiedSeats 現在使用中のseat_indexの集合
 */
function pickEmptySeat(occupiedSeats: Set<number>): number {
  for (let i = 0; i < MAX_SEATS; i++) {
    if (!occupiedSeats.has(i)) return i;
  }
  // 满席の場合は末尾に追加（表示は重複するが、エラーを避ける）
  return MAX_SEATS;
}

/**
 * Supabase Realtime Presence を使って着席状態をリアルタイム同期するフック
 *
 * - Discordアクティビティに参加したユーザーが自動的に空き席に着席する
 * - 退出すると自動的に席が解放される（Supabaseの接続切断時にPresenceが自動削除される）
 * - 着席情報は Zustand の roomStore で管理し、PixiJSの描画に反映される
 *
 * @param channelName Supabaseチャンネル名（Discordのチャンネルキー等で分離）
 */
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
    // Discordユーザー情報が取得できるまで待機
    if (!user) return;

    const channel = supabase.channel(`room:${channelName}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    // --------------------------------------------------
    // Presence: sync
    // 自分を含む全員の現在の状態を受信する（チャンネル参加後 & 変化時）
    // --------------------------------------------------
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>();
      const next = new Map<string, SeatOccupant>();

      for (const [userId, presenceList] of Object.entries(state)) {
        // 同一ユーザーが複数接続している場合は最初のエントリを使用
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

    // --------------------------------------------------
    // Presence: join（他のユーザーが入室した時）
    // --------------------------------------------------
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

    // --------------------------------------------------
    // Presence: leave（他のユーザーが退出した時）
    // --------------------------------------------------
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) {
        const payload = p as unknown as PresencePayload;
        removeOccupant(payload.user_id);
      }
    });

    // --------------------------------------------------
    // チャンネルを購読開始
    // --------------------------------------------------
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true);

        // 現在の在室者から空席を選んで着席
        const occupiedSeats = getOccupiedSeats();
        const seatIndex = pickEmptySeat(occupiedSeats);
        setMySeatIndex(seatIndex);

        // Presence に自分の情報をトラック
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

    // アンマウント時にチャンネルを解除（着席が自動で解放される）
    return () => {
      setConnected(false);
      setMySeatIndex(null);
      channel.unsubscribe();
    };
  }, [
    user,
    channelName,
    setOccupants,
    upsertOccupant,
    removeOccupant,
    setMySeatIndex,
    setConnected,
    getOccupiedSeats,
  ]);
}
