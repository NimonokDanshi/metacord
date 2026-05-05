import { supabase } from '@/utils/supabase';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { Furniture, NewFurniture } from '@/types/furniture';
import { PresencePayload, AvatarType } from '@/types/room';
import { getDiscordAvatarUrl } from '@/types/discord';
import { MySet, mergeMySet } from '@/utils/userMetadataUtil';

/**
 * 部屋の編集に関するアクション
 */
export const roomActions = {
  /**
   * 家具を保存します
   */
  saveFurniture: async (item_id: string, x: number, z: number, rotation: number) => {
    const { channelId, instanceId } = useDiscordStore.getState();
    const { addFurniture } = useRoomStore.getState();
    
    let roomId = channelId || instanceId;
    if (!roomId) {
      roomId = 'local-dev-room';
    }

    const { addSyncEvent } = useDiscordStore.getState();
    addSyncEvent({ type: 'DB_REQ', label: 'saveFurniture', payload: { item_id, x, z } });

    const newFurniture: NewFurniture = {
      server_id: roomId,
      item_id,
      pos_x: x,
      pos_z: z,
      rotation,
    };

    if (!supabase) return { error: 'Supabase client not initialized' };

    const { data, error } = await (supabase
      .from('t_server_furniture') as any)
      .insert(newFurniture as any)
      .select()
      .single();

    if (error) {
      const msg = `[roomActions] saveFurniture error: ${error.message} (${error.details})`;
      console.error(msg);
      useDiscordStore.getState().addLogMessage(msg);
    } else if (data) {
      const msg = `[roomActions] saveFurniture success: ${data.id}`;
      console.log(msg);
      addSyncEvent({ type: 'DB_RES', label: 'saveFurniture', payload: data });
      useDiscordStore.getState().addLogMessage(msg);
      addFurniture(data);
    }
    
    return { data, error };
  },

  /**
   * 家具を削除します
   */
  deleteFurniture: async (id: string) => {
    const { removeFurniture } = useRoomStore.getState();
    const { addSyncEvent } = useDiscordStore.getState();

    if (!supabase) return { error: 'Supabase client not initialized' };

    addSyncEvent({ type: 'DB_REQ', label: 'deleteFurniture', payload: { id } });

    const { error } = await supabase
      .from('t_server_furniture')
      .delete()
      .eq('id', id);

    if (error) {
      const msg = `[roomActions] deleteFurniture error: ${error.message}`;
      console.error(msg);
      useDiscordStore.getState().addLogMessage(msg);
    } else {
      const msg = `[roomActions] deleteFurniture success: ${id}`;
      console.log(msg);
      addSyncEvent({ type: 'DB_RES', label: 'deleteFurniture', payload: { id } });
      useDiscordStore.getState().addLogMessage(msg);
      removeFurniture(id);
    }
    return { success: !error, error };
  },

  /**
   * 家具を更新します (再配置用)
   */
  updateFurniture: async (id: string, x: number, z: number, rotation: number) => {
    const { furnitures, setFurnitures } = useRoomStore.getState();
    const { addSyncEvent } = useDiscordStore.getState();

    if (!supabase) return { error: 'Supabase client not initialized' };

    addSyncEvent({ type: 'DB_REQ', label: 'updateFurniture', payload: { id, x, z } });

    const { data, error } = await (supabase
      .from('t_server_furniture') as any)
      .update({
        pos_x: x,
        pos_z: z,
        rotation,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const msg = `[roomActions] updateFurniture error: ${error.message} (${error.details})`;
      console.error(msg);
      useDiscordStore.getState().addLogMessage(msg);
    } else if (data) {
      const msg = `[roomActions] updateFurniture success: ${data.id}`;
      console.log(msg);
      addSyncEvent({ type: 'DB_RES', label: 'updateFurniture', payload: data });
      useDiscordStore.getState().addLogMessage(msg);
      // ストアを更新
      const next = furnitures.map(f => f.id === id ? (data as Furniture) : f);
      setFurnitures(next);
    }

    return { data, error };
  },

  /**
   * 自分の現在の状態を PresenceService を通じて同期します。
   */
  syncPresence: async () => {
    const { user, avatarType, mySet } = useDiscordStore.getState();
    const { mySeatIndex, myFurnitureId, presenceService, isConnected } = useRoomStore.getState();

    if (!user || !presenceService || !isConnected || mySeatIndex === null) {
      return;
    }

    const avatarUrl = getDiscordAvatarUrl(user);
    const displayName = user.global_name ?? (user.discriminator !== '0' ? `${user.username}#${user.discriminator}` : user.username);

    const presencePayload: PresencePayload = {
      user_id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      seat_index: mySeatIndex,
      furniture_id: myFurnitureId || undefined,
      avatar_type: avatarType,
      metadata: { myset: mySet },
      joined_at: new Date().toISOString(),
    };

    console.log('[roomActions] Syncing Presence:', {
      seat: mySeatIndex,
      avatar: avatarType,
      myset: mySet
    });

    useDiscordStore.getState().addSyncEvent({ type: 'PRESENCE', label: 'trackSelf', payload: presencePayload });
    await presenceService.track(presencePayload);
  },

  /**
   * 座席を変更し、即座に同期します。
   */
  changeSeat: async (seatIndex: number, furnitureId: string | null = null) => {
    const { user, mySet } = useDiscordStore.getState();
    const { myFurnitureId: oldFurnitureId, setMySeatIndex, setMyFurnitureId } = useRoomStore.getState();
    
    if (!user) return;

    // 1. 自分の ID が紐付いている家具のメタデータを一旦すべてクリア (念のため)
    if (supabase) {
      await supabase
        .from('t_server_furniture')
        .update({ metadata: {} } as any)
        .eq('metadata->>occupant_id', user.id);
    }

    // 2. ストアを更新
    setMySeatIndex(seatIndex);
    setMyFurnitureId(furnitureId);

    // 3. 新しい家具にメタデータをセット (占有情報とMySet)
    if (furnitureId && supabase) {
      await supabase
        .from('t_server_furniture')
        .update({ 
          metadata: { 
            occupant_id: user.id,
            myset: mySet
          } 
        } as any)
        .eq('id', furnitureId);
    }

    await roomActions.syncPresence();
  },

  /**
   * アバタータイプを変更し、Supabase と Presence 両方を同期します。
   */
  updateAvatar: async (avatarType: AvatarType) => {
    const { user, setAvatarType, addLogMessage } = useDiscordStore.getState();
    if (!user) return;

    setAvatarType(avatarType);
    
    if (supabase) {
      addLogMessage(`[roomActions] Updating avatar in DB to ${avatarType}...`);
      const { error } = await (supabase.from('m_users') as any)
        .update({ avatar_id: avatarType })
        .eq('user_id', user.id);
      
      if (error) {
        addLogMessage(`[roomActions] Error updating avatar DB: ${error.message}`);
      }
    }

    await roomActions.syncPresence();
  },

  /**
   * MySet を変更し、Supabase と Presence 両方を同期します。
   */
  updateMySet: async (newMySet: MySet) => {
    const { user, setMySet, addLogMessage } = useDiscordStore.getState();
    const { myFurnitureId } = useRoomStore.getState();
    if (!user) return;

    setMySet(newMySet);

    if (supabase) {
      addLogMessage(`[roomActions] Updating MySet in DB...`);
      
      // 1. m_users の更新
      const { data: userData } = await supabase.from('m_users')
        .select('metadata')
        .eq('user_id', user.id)
        .single();

      const updatedMetadata = mergeMySet(userData?.metadata || {}, newMySet);

      const { error: userError } = await (supabase.from('m_users') as any)
        .update({ metadata: updatedMetadata })
        .eq('user_id', user.id);

      if (userError) {
        addLogMessage(`[roomActions] Error updating MySet DB: ${userError.message}`);
      }

      // 2. 現在座っている家具があれば、そのメタデータも更新
      if (myFurnitureId) {
        const { error: furnError } = await (supabase.from('t_server_furniture') as any)
          .update({ 
            metadata: { 
              occupant_id: user.id,
              myset: newMySet
            } 
          })
          .eq('id', myFurnitureId);
        
        if (furnError) {
          addLogMessage(`[roomActions] Error updating furniture metadata: ${furnError.message}`);
        }
      }
    }

    await roomActions.syncPresence();
  }
};
