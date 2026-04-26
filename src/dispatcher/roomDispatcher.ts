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
import { PresenceService } from '@/utils/presenceUtils';

const MAX_SEATS = GRID_SIZE_X * GRID_SIZE_Z;

export interface SeatInfo {
  seat_index: number;
  furniture_id?: string;
}

/**
 * 空いている座席（家具またはグリッド）を選択します。
 */
export function pickEmptySeat(
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
    const target = seatFurnitures[Math.floor(Math.random() * seatFurnitures.length)];
    const seatIdx = target.pos_z * GRID_SIZE_X + target.pos_x;
    return { seat_index: seatIdx, furniture_id: target.id };
  }

  // 2. 家具がない、または満席の場合は、空いているグリッドを探す
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

  return { seat_index: 0 };
}

export function useRoom() {
  const { user, instanceId, channelId, avatarType, mySet } = useDiscordStore();
  const {
    setOccupants,
    upsertOccupant,
    removeOccupant,
    setMySeatIndex,
    setMyFurnitureId,
    setConnected,
    setFurnitures,
    addFurniture,
    removeFurniture,
    mySeatIndex,
    myFurnitureId,
  } = useRoomStore();
  
  const presenceServiceRef = useRef<PresenceService | null>(null);

  // 1. 接続・同期ロジック
  useEffect(() => {
    if (!supabase || !user || (!channelId && !instanceId)) return;

    const roomKey = channelId ? `room:${channelId}` : `room:${instanceId}`;
    const presenceService = new PresenceService(supabase, roomKey, user.id);
    presenceServiceRef.current = presenceService;

    // --- Presence イベントハンドラの定義 (Dispatcher の役割) ---
    const handlers = {
      onSync: (state: Record<string, PresencePayload[]>) => {
        console.log('[useRoom] Presence Sync');
        const next = new Map<string, SeatOccupant>();
        for (const [userId, presenceList] of Object.entries(state)) {
          const payload = presenceList[0];
          next.set(userId, { ...payload });
        }
        setOccupants(next);
      },
      onJoin: (payloads: PresencePayload[]) => {
        console.log('[useRoom] User Joined:', payloads);
        payloads.forEach(p => upsertOccupant({ ...p }));
      },
      onLeave: (payloads: PresencePayload[]) => {
        console.log('[useRoom] User Left:', payloads);
        payloads.forEach(p => removeOccupant(p.user_id));
      }
    };

    const roomId = channelId || instanceId || 'local-dev-room';

    // 家具データの同期 & チャンネルの購読を開始
    const fetchAndSubscribe = async () => {
      if (!supabase) return;

      // 1. 初期家具データのロード
      const { data, error } = await supabase
        .from('t_server_furniture')
        .select('*')
        .eq('server_id', roomId);
          
      if (!error && data) {
        setFurnitures(data);
      }

      // 2. 家具データの Postgres リアルタイム同期監視
      const furnitureChannelName = `${roomKey}:furniture`;
      const furnitureChannel = supabase
        .channel(furnitureChannelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 't_server_furniture', filter: `server_id=eq.${roomId}` }, 
          (payload) => addFurniture(payload.new as Furniture))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 't_server_furniture' }, 
          (payload) => payload.old.id && removeFurniture(payload.old.id))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 't_server_furniture' }, 
          (payload) => {
            const { furnitures } = useRoomStore.getState();
            const next = furnitures.map(f => f.id === payload.new.id ? (payload.new as Furniture) : f);
            setFurnitures(next);
          })
        .subscribe();

      // 3. Presence の購読開始
      const status = await presenceService.subscribe(handlers);
      console.log(`[useRoom] Presence status: ${status}`);

      if (status === 'SUBSCRIBED') {
        const channel = presenceService.getChannel();
        if (channel) {
          const currentState = channel.presenceState<PresencePayload>();
          const occupiedSeats = new Set<number>();
          const occupiedFurnitureIds = new Set<string>();
          const currentFurnitures = useRoomStore.getState().furnitures;

          for (const [userId, presenceList] of Object.entries(currentState)) {
            if (userId === user.id) continue;
            const payload = presenceList[0];
            if (typeof payload.seat_index === 'number') occupiedSeats.add(payload.seat_index);
            if (payload.furniture_id) occupiedFurnitureIds.add(payload.furniture_id);
          }

          const seatInfo = pickEmptySeat(occupiedSeats, occupiedFurnitureIds, currentFurnitures);
          setMySeatIndex(seatInfo.seat_index);
          setMyFurnitureId(seatInfo.furniture_id || null);
          setConnected(true);
        }
      }

      // クリーンアップ用に保持
      (presenceService as any)._furnitureChannel = furnitureChannel;
    };

    // サーバー情報の自動登録 (m_servers)
    const initServer = async () => {
      if (!supabase) return;
      try {
        await supabase.from('m_servers').upsert({
          server_id: roomId,
          name: channelId ? 'Discord Channel' : 'Local Dev Room',
          layout_id: 'default',
          last_activity_at: new Date().toISOString(),
        }, { onConflict: 'server_id' });
        
        fetchAndSubscribe();
      } catch (e) {
        console.error('[useRoom] initServer error', e);
      }
    };

    initServer();

    return () => {
      console.log('[useRoom] Cleaning up connection');
      setConnected(false);
      setMySeatIndex(null);
      setMyFurnitureId(null);
      
      if (presenceServiceRef.current) {
        const pService = presenceServiceRef.current;
        const fChan = (pService as any)._furnitureChannel;
        if (fChan && supabase) {
          supabase.removeChannel(fChan);
        }
        pService.unsubscribe();
      }
      presenceServiceRef.current = null;
    };
  }, [user, instanceId, channelId]);

  // 2. 自分の Presence 情報を更新 (接続済み && 座席確定後に実行)
  useEffect(() => {
    const pService = presenceServiceRef.current;
    const isReady = useRoomStore.getState().isConnected && mySeatIndex !== null;
    if (!pService || !user || !isReady) return;

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
        metadata: { myset: mySet },
        joined_at: new Date().toISOString(),
      };

      console.log('[useRoom] Presence 更新:', { seat: mySeatIndex, avatar: avatarType });
      await pService.track(presencePayload);
    };

    updatePresence();
  }, [avatarType, mySet, user, mySeatIndex, myFurnitureId]);
}

