import { create } from 'zustand';
import { SeatOccupant } from '@/types/room';
import { Furniture } from '@/types/furniture';

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

  // --- 家具配置データ ---
  /** 配置済みの家具リスト */
  furnitures: Furniture[];
  /** 家具リストを更新 */
  setFurnitures: (furnitures: Furniture[]) => void;
  /** 家具を追加 */
  addFurniture: (furniture: Furniture) => void;
  /** 家具を削除 */
  removeFurniture: (id: string) => void;
  /** 占有済みのグリッド ("x,z"形式) の集合を返す */
  getOccupiedGrids: () => Set<string>;

  // --- 編集モード関連 ---
  /** 編集モード中かどうか */
  isEditing: boolean;
  /** 現在選択中の家具アイテムID */
  selectedItemId: string | null;
  /** グリッド上のプレビュー位置 [x, z] */
  previewPosition: [number, number] | null;
  /** プレビュー中の回転 (ラジアン) */
  previewRotation: number;

  /** 編集モードの切り替え */
  setEditing: (isEditing: boolean) => void;
  /** 選択中のアイテムをセット */
  setSelectedItem: (itemId: string | null) => void;
  /** プレビュー位置をセット */
  setPreviewPosition: (pos: [number, number] | null) => void;
  /** プレビュー回転をセット */
  setPreviewRotation: (rotation: number) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  occupants: new Map(),
  mySeatIndex: null,
  isConnected: false,

  // 編集モード初期値
  isEditing: false,
  selectedItemId: null,
  previewPosition: null,
  previewRotation: 0,
  // 家具データの初期値
  furnitures: [],

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

  // 家具アクション
  setFurnitures: (furnitures) => set({ furnitures }),
  addFurniture: (f) => set((s) => ({ furnitures: [...s.furnitures, f] })),
  removeFurniture: (id) => set((s) => ({ furnitures: s.furnitures.filter(f => f.id !== id) })),
  getOccupiedGrids: () => {
    const occupied = new Set<string>();
    const { furnitures } = get();
    furnitures.forEach(f => {
      const isDesk = f.item_id === 'standard-desk';
      const sizeX = isDesk ? 2 : 1;
      const sizeZ = isDesk ? 2 : 1; 
      for (let dx = 0; dx < sizeX; dx++) {
        for (let dz = 0; dz < sizeZ; dz++) {
          occupied.add(`${f.pos_x + dx},${f.pos_z + dz}`);
        }
      }
    });
    return occupied;
  },

  // 編集モードアクション
  setEditing: (isEditing) => set({ isEditing, selectedItemId: null, previewPosition: null, previewRotation: 0 }),
  setSelectedItem: (selectedItemId) => set({ selectedItemId, previewRotation: 0 }),
  setPreviewPosition: (previewPosition) => set({ previewPosition }),
  setPreviewRotation: (rotation) => set({ previewRotation: rotation }),
}));
