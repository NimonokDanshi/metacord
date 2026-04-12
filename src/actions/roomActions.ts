import { supabase } from '@/utils/supabase';
import { useRoomStore } from '@/stores/roomStore';
import { useDiscordStore } from '@/stores/discordStore';
import { Furniture, NewFurniture } from '@/types/furniture';

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
    if (!supabase) return { error: 'Supabase client not initialized' };

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
    if (!supabase) return { error: 'Supabase client not initialized' };

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
      useDiscordStore.getState().addLogMessage(msg);
      // ストアを更新
      const next = furnitures.map(f => f.id === id ? (data as Furniture) : f);
      setFurnitures(next);
    }

    return { data, error };
  }
};
