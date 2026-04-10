'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useDiscordStore } from '@/store/discordStore';
import { useRoomStore } from '@/store/roomStore';
import type { PresencePayload, SeatOccupant } from '@/types/room';
import { getDiscordAvatarUrl } from '@/types/discord';
import { GRID_SIZE_X, GRID_SIZE_Z } from '@/constants/voxel';
import { Furniture } from '@/features/room/types/furniture';

const MAX_SEATS = GRID_SIZE_X * GRID_SIZE_Z;
const ISLAND_SEATS = [51, 53, 55, 87, 89, 91];

function pickEmptySeat(occupiedSeats: Set<number>): number {
  // まずは島（デスクのある席）から探す
  for (const seat of ISLAND_SEATS) {
    if (!occupiedSeats.has(seat)) return seat;
  }
  // 島がいっぱいなら若い順に探す
  for (let i = 0; i < MAX_SEATS; i++) {
    if (!occupiedSeats.has(i)) return i;
  }
  return MAX_SEATS;
}

export function useRoom() {
  const { user, instanceId, channelId, avatarType } = useDiscordStore();
  const {
    setOccupants,
    upsertOccupant,
    removeOccupant,
    setMySeatIndex,
    setConnected,
    setFurnitures,
    addFurniture,
    removeFurniture,
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

    // Discordユーザー情報とチャンネルID（またはインスタンスID）が取得できるまで待機
    if (!user || (!channelId && !instanceId)) return;

    // ボイスチャンネルIDを優先して使用。これにより「参加」経由でなくても同じチャンネルにいれば同期される。
    const roomKey = channelId ? `room:${channelId}` : `room:${instanceId}`;
    console.log(`[useRoom] ルームへの接続を試みます: ${roomKey} (User: ${user.id})`);

    const channel = supabase.channel(roomKey, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>();
      console.log('[useRoom] Presence Sync 発生:', state);
      const next = new Map<string, SeatOccupant>();
      for (const [userId, presenceList] of Object.entries(state)) {
        const payload = presenceList[0] as PresencePayload;
        next.set(userId, {
          user_id: payload.user_id,
          display_name: payload.display_name,
          avatar_url: payload.avatar_url,
          seat_index: payload.seat_index,
          avatar_type: payload.avatar_type,
        });
      }
      setOccupants(next);
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      console.log('[useRoom] User Joined:', newPresences);
      for (const p of newPresences) {
        const payload = p as unknown as PresencePayload;
        upsertOccupant({
          user_id: payload.user_id,
          display_name: payload.display_name,
          avatar_url: payload.avatar_url,
          seat_index: payload.seat_index,
          avatar_type: payload.avatar_type,
        });
      }
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      console.log('[useRoom] User Left:', leftPresences);
      for (const p of leftPresences) {
        const payload = p as unknown as PresencePayload;
        removeOccupant(payload.user_id);
      }
    });

    // --- 家具データの同期設定 ---
    const furnitureChannel = supabase
      .channel(`${roomKey}:furniture`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 't_server_furniture',
          filter: `server_id=eq.${channelId || instanceId}`,
        },
        (payload) => {
          console.log('[useRoom] Furniture Inserted:', payload.new);
          addFurniture(payload.new as Furniture);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 't_server_furniture',
        },
        (payload) => {
          console.log('[useRoom] Furniture Deleted:', payload.old);
          if (payload.old.id) {
            removeFurniture(payload.old.id);
          }
        }
      )
      .subscribe();

    // 初期家具データのロード
    const fetchFurnitures = async () => {
      let roomId = channelId || instanceId;
      if (!roomId) roomId = 'local-dev-room';
      
      if (!supabase) return;

      const { data, error } = await supabase
        .from('t_server_furniture')
        .select('*')
        .eq('server_id', roomId);
        
      if (!error && data) {
        console.log('[useRoom] Furnitures loaded:', data.length);
        setFurnitures(data);
      } else {
        console.error('[useRoom] Failed to load furnitures:', error);
      }
    };
    fetchFurnitures();

    channel.subscribe(async (status) => {
      console.log(`[useRoom] サブスクリプションステータス: ${status}`);
      
      if (status === 'CHANNEL_ERROR') {
        console.error('[useRoom] チャンネルエラー。URLマッピングの設定やネットワーク制限を確認してください。');
      }

      if (status === 'SUBSCRIBED') {
        setConnected(true);
        console.log('[useRoom] 接続成功！トラックを開始します。');

        const currentState = channel.presenceState<PresencePayload>();
        const occupiedByOthers = new Set<number>();
        for (const [userId, presenceList] of Object.entries(currentState)) {
          if (userId === user.id) continue;
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
          avatar_type: avatarType,
          joined_at: new Date().toISOString(),
        };
        
        const trackResult = await channel.track(presencePayload);
        console.log('[useRoom] トラック結果:', trackResult);
      }
    });

    return () => {
      setConnected(false);
      setMySeatIndex(null);
      channel.unsubscribe();
      furnitureChannel.unsubscribe();
      channelRef.current = null;
    };
  }, [user, instanceId, channelId, avatarType, setOccupants, upsertOccupant, removeOccupant, setMySeatIndex, setConnected, setFurnitures, addFurniture, removeFurniture]);
}
