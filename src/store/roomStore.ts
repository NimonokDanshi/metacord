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

  // --- 編集モード関連 ---
  /** 編集モード中かどうか */
  isEditing: boolean;
  /** 現在選択中の家具アイテムID */
  selectedItemId: string | null;
  /** グリッド上のプレビュー位置 [x, z] */
  previewPosition: [number, number] | null;

  /** 編集モードの切り替え */
  setEditing: (isEditing: boolean) => void;
  /** 選択中のアイテムをセット */
  setSelectedItem: (itemId: string | null) => void;
  /** プレビュー位置をセット */
  setPreviewPosition: (pos: [number, number] | null) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  occupants: new Map(),
  mySeatIndex: null,
  isConnected: false,

  // 編集モード初期値
  isEditing: false,
  selectedItemId: null,
  previewPosition: null,

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

  // 編集モードアクション
  setEditing: (isEditing) => set({ isEditing, selectedItemId: null, previewPosition: null }),
  setSelectedItem: (selectedItemId) => set({ selectedItemId }),
  setPreviewPosition: (previewPosition) => set({ previewPosition }),
}));
