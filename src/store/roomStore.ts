import { create } from 'zustand';
import { SeatOccupant } from '@/types/room';

interface RoomStore {
  /** 現在の在室者リスト（user_id → SeatOccupant） */
  occupants: Map<string, SeatOccupant>;

  /** 自分自身のseat_index（未着席は null） */
  mySeatIndex: number | null;

  /** Supabase Realtimeチャンネルの接続状態 */
  isConnected: boolean;

  /** 在室者リストを全件更新する（Presence sync時に呼ぶ） */
  setOccupants: (occupants: Map<string, SeatOccupant>) => void;

  /** 1人分の着席情報を追加・更新する（Presence join時） */
  upsertOccupant: (occupant: SeatOccupant) => void;

  /** 1人分の着席情報を削除する（Presence leave時） */
  removeOccupant: (userId: string) => void;

  /** 自分のseat_indexをセット */
  setMySeatIndex: (index: number | null) => void;

  /** 接続状態をセット */
  setConnected: (connected: boolean) => void;

  /** 現在使用中のseat_indexの集合を返すゲッター */
  getOccupiedSeats: () => Set<number>;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  occupants: new Map(),
  mySeatIndex: null,
  isConnected: false,

  setOccupants: (occupants) => set({ occupants }),

  upsertOccupant: (occupant) =>
    set((state) => {
      const next = new Map(state.occupants);
      next.set(occupant.user_id, occupant);
      return { occupants: next };
    }),

  removeOccupant: (userId) =>
    set((state) => {
      const next = new Map(state.occupants);
      next.delete(userId);
      return { occupants: next };
    }),

  setMySeatIndex: (index) => set({ mySeatIndex: index }),
  setConnected: (connected) => set({ isConnected: connected }),

  getOccupiedSeats: () => {
    const seats = new Set<number>();
    get().occupants.forEach((o) => seats.add(o.seat_index));
    return seats;
  },
}));
