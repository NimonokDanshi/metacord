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
    setMyFurnitureId, // 追加
    setConnected,
    setFurnitures,
    addFurniture,
    removeFurniture,
    mySeatIndex, // 追加
    myFurnitureId, // 追加
  } = useRoomStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 1. メインの接続・同期ロジック (avatarType は依存関係に含めない)
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

    // ボイスチャンネルIDを優先して使用
    const roomKey = channelId ? `room:${channelId}` : `room:${instanceId}`;
    console.log(`[useRoom] ルームへの接続を試みます: ${roomKey} (User: ${user.id})`);

    const channel = supabase.channel(roomKey, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>();
      console.log('[useRoom] Presence Sync:', state);
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

    // --- サーバー情報の自動登録 (m_servers) ---
    const roomId = channelId || instanceId || 'local-dev-room';
    const initServer = async () => {
      if (!supabase || channelRef.current !== channel) return;
      
      const msg = `[useRoom] Registering server: ${roomId}`;
      console.log(msg);
      useDiscordStore.getState().addLogMessage(msg);

      try {
        const { error } = await supabase.from('m_servers').upsert({
          server_id: roomId,
          name: channelId ? 'Discord Channel' : 'Local Dev Room',
          layout_id: 'default',
          last_activity_at: new Date().toISOString(),
        }, { onConflict: 'server_id' });

        if (channelRef.current !== channel) return;

        if (error) {
          const errBox = `[useRoom] Server registration failed: ${error.message}`;
          console.error(errBox);
          useDiscordStore.getState().addLogMessage(errBox);
          return;
        }
        
        const okMsg = `[useRoom] Server ready: ${roomId}`;
        console.log(okMsg);
        useDiscordStore.getState().addLogMessage(okMsg);

        // サーバー登録成功後に家具と Presence の同期を開始
        fetchAndSubscribe();
      } catch (e: any) {
        console.error('[useRoom] initServer error', e);
      }
    };

    // 家具データの同期 & チャンネルの購読を開始する関数
    const fetchAndSubscribe = async () => {
      if (!supabase || channelRef.current !== channel) return;

      // 1. 初期家具データのロード
      const { data, error } = await supabase
        .from('t_server_furniture')
        .select('*')
        .eq('server_id', roomId);
      
      if (channelRef.current !== channel) return;
          
      if (!error && data) {
        setFurnitures(data);
      }

      // 2. 家具データの同期監視
      const furnitureChannelName = `${roomKey}:furniture`;
      // 既存の同名チャンネルがあれば削除（再試行時などの衝突回避）
      const existing = supabase.getChannels().find(c => c.topic === `realtime:${furnitureChannelName}`);
      if (existing) {
        await supabase.removeChannel(existing);
      }
      
      if (channelRef.current !== channel) return;

      const furnitureChannel = supabase
        .channel(furnitureChannelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 't_server_furniture',
            filter: `server_id=eq.${roomId}`,
          },
          (payload) => {
            console.log('[useRoom] Furniture INSERT detected');
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
            console.log('[useRoom] Furniture DELETE detected');
            if (payload.old.id) {
              removeFurniture(payload.old.id);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 't_server_furniture',
          },
          (payload) => {
            console.log('[useRoom] Furniture UPDATE detected');
            const { furnitures } = useRoomStore.getState();
            const next = furnitures.map(f => f.id === payload.new.id ? (payload.new as Furniture) : f);
            setFurnitures(next);
          }
        )
        .subscribe((status) => {
          console.log(`[useRoom] Furniture channel status: ${status}`);
        });

      // 3. Presence の開始
      channel.subscribe(async (status) => {
        if (channelRef.current !== channel) return;

        const pmsg = `[useRoom] Presence status: ${status}`;
        console.log(pmsg);
        useDiscordStore.getState().addLogMessage(pmsg);

        if (status === 'SUBSCRIBED') {
          const currentState = channel.presenceState<PresencePayload>();
          const occupiedSeats = new Set<number>();
          const occupiedFurnitureIds = new Set<string>();
          const currentFurnitures = useRoomStore.getState().furnitures;

          for (const [userId, presenceList] of Object.entries(currentState)) {
            if (userId === user.id) continue;
            const payload = presenceList[0] as PresencePayload;
            if (typeof payload.seat_index === 'number') occupiedSeats.add(payload.seat_index);
            if (payload.furniture_id) occupiedFurnitureIds.add(payload.furniture_id);
          }

          const seatInfo = pickEmptySeat(occupiedSeats, occupiedFurnitureIds, currentFurnitures);
          setMySeatIndex(seatInfo.seat_index);
          setMyFurnitureId(seatInfo.furniture_id || null);
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useRoom] Presence channel error (CHANNEL_ERROR)');
        }
      });

      // クリーンアップ用の参照を保持
      (channel as any)._furnitureChannel = furnitureChannel;
    };

    initServer();

    return () => {
      console.log('[useRoom] Cleaning up connection');
      setConnected(false);
      setMySeatIndex(null);
      setMyFurnitureId(null);
      
      if (channelRef.current && supabase) {
        const chan = channelRef.current;
        const fChan = (chan as any)._furnitureChannel;
        if (fChan) {
          supabase.removeChannel(fChan);
        }
        supabase.removeChannel(chan);
      }
      channelRef.current = null;
    };
  }, [user, instanceId, channelId, setOccupants, upsertOccupant, removeOccupant, setMySeatIndex, setMyFurnitureId, setConnected, setFurnitures, addFurniture, removeFurniture]);

  // 2. Presence 同期情報の更新 (接続済み && 座席確定後に実行)
  useEffect(() => {
    const channel = channelRef.current;
    // 接続状態と座席が確定していない場合は track しない
    const isReady = useRoomStore.getState().isConnected && mySeatIndex !== null;
    if (!channel || !user || !isReady) return;

    const updatePresence = async () => {
      const avatarUrl = getDiscordAvatarUrl(user);
      const displayName = user.global_name ?? (user.discriminator !== '0' ? `${user.username}#${user.discriminator}` : user.username);

      const presencePayload: PresencePayload = {
        user_id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        seat_index: mySeatIndex!,
        furniture_id: myFurnitureId || undefined,
        avatar_type: avatarType,
        joined_at: new Date().toISOString(),
      };

      console.log('[useRoom] Presence を送信/更新します:', { seat: mySeatIndex, avatar: avatarType });
      const result = await channel.track(presencePayload).catch(e => {
        console.error('[useRoom] Presence track error:', e);
        return 'error';
      });
      
      if (result !== 'ok') {
        console.error('[useRoom] Presence 更新失敗:', result);
      }
    };

    updatePresence();
  }, [avatarType, user, mySeatIndex, myFurnitureId]);
}

