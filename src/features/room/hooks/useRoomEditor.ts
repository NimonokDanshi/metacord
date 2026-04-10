'use client';

import { supabase } from '@/lib/supabase';
import { useDiscordStore } from '@/store/discordStore';
import { useRoomStore } from '@/store/roomStore';
import { NewFurniture } from '../types/furniture';

export function useRoomEditor() {
  const { channelId, instanceId } = useDiscordStore();
  const { addFurniture, removeFurniture } = useRoomStore();

  const getRoomId = () => channelId || instanceId;

  /**
   * 家具を保存します
   */
  const saveFurniture = async (item_id: string, x: number, z: number, rotation: number) => {
    const roomId = getRoomId();
    if (!roomId) return { error: 'No room ID' };

    const newFurniture: NewFurniture = {
      server_id: roomId,
      item_id,
      pos_x: x,
      pos_z: z,
      rotation,
    };

    const { data, error } = await supabase
      .from('t_server_furniture')
      .insert(newFurniture)
      .select()
      .single();

    if (error) {
      console.error('Failed to save furniture:', error);
      return { error };
    }

    if (data) {
      addFurniture(data);
    }
    
    return { data };
  };

  /**
   * 家具を削除します
   */
  const deleteFurniture = async (id: string) => {
    const { error } = await supabase
      .from('t_server_furniture')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete furniture:', error);
      return { error };
    }

    removeFurniture(id);
    return { success: true };
  };

  return { saveFurniture, deleteFurniture };
}
