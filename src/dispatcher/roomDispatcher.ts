'use client';

import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { useDiscordStore } from '@/stores/discordStore';
import { useRoomStore } from '@/stores/roomStore';
import type { PresencePayload, SeatOccupant } from '@/types/room';
import { getDiscordAvatarUrl } from '@/types/discord';
import { GRID_SIZE_X, GRID_SIZE_Z } from '@/constants/voxel';
import { Furniture } from '@/types/furniture';

import { ROOM_ITEMS } from '@/constants/roomItems';

const MAX_SEATS = GRID_SIZE_X * GRID_SIZE_Z;

interface SeatInfo {
  seat_index: number;
  furniture_id?: string;
}

/**
 * 空いている座席（家具またはグリッド）を選択します。
 */
function pickEmptySeat(
  occupiedSeats: Set<number>, 
  occupiedFurnitureIds: Set<string>,
  furnitures: Furniture[]
): SeatInfo {
  // 1. まずは配置されている「座席属性を持つ家具」から空いているものを探す
  const seatFurnitures = furnitures.filter(f => {
    const item = ROOM_ITEMS.find(it => it.id === f.item_id);
    return item?.isSeat && !occupiedFurnitureIds.has(f.id);
  });

  if (seatFurnitures.length > 0) {
    // ランダムに選択
    const target = seatFurnitures[Math.floor(Math.random() * seatFurnitures.length)];
    // 家具のベースとなるグリッドインデックスを算出 (Fallback用)
    const seatIdx = target.pos_z * GRID_SIZE_X + target.pos_x;
    return { seat_index: seatIdx, furniture_id: target.id };
  }

  // 2. 家具がない、または満席の場合は、空いているグリッド（「立ち」位置）をランダムに探す
  const availableGrids: number[] = [];
  for (let i = 0; i < MAX_SEATS; i++) {
    if (!occupiedSeats.has(i)) {
      availableGrids.push(i);
    }
  }

  if (availableGrids.length > 0) {
    const seatIdx = availableGrids[Math.floor(Math.random() * availableGrids.length)];
    return { seat_index: seatIdx };
  }

  return { seat_index: 0 }; // 最終フォールバック
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
    furnitures, // roomStore から現在配置されている家具を取得
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
          furniture_id: payload.furniture_id,
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
          furniture_id: payload.furniture_id,
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
        const occupiedSeats = new Set<number>();
        const occupiedFurnitureIds = new Set<string>();

        // 最新の家具情報を取得 (roomStore の最新状態を使うため getState() を利用)
        const currentFurnitures = useRoomStore.getState().furnitures;

        for (const [userId, presenceList] of Object.entries(currentState)) {
          if (userId === user.id) continue;
          const payload = presenceList[0] as PresencePayload;
          if (typeof payload.seat_index === 'number') {
            occupiedSeats.add(payload.seat_index);
          }
          if (payload.furniture_id) {
            occupiedFurnitureIds.add(payload.furniture_id);
          }
        }

        const seatInfo = pickEmptySeat(occupiedSeats, occupiedFurnitureIds, currentFurnitures);
        setMySeatIndex(seatInfo.seat_index);

        const avatarUrl = getDiscordAvatarUrl(user);
        const displayName = user.global_name ?? (user.discriminator !== '0' ? `${user.username}#${user.discriminator}` : user.username);

        const presencePayload: PresencePayload = {
          user_id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          seat_index: seatInfo.seat_index,
          furniture_id: seatInfo.furniture_id,
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

