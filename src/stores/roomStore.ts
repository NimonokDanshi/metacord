import { create } from 'zustand';
import { SeatOccupant } from '@/types/room';
import { Furniture } from '@/types/furniture';
import { PresenceService } from '@/utils/presenceUtils';
import { ROOM_ITEMS } from '@/constants/roomItems';

interface RoomToast {
  id: string;
  message: string;
  type: 'join' | 'leave' | 'info';
  timestamp: number;
}

interface RoomStore {
  /** 現在の在室者リスト（user_id → SeatOccupant） */
  occupants: Map<string, SeatOccupant>;
  /** 退室演出中の在室者リスト（user_id → { occupant, leavingStartedAt }） */
  leavingOccupants: Map<string, { occupant: SeatOccupant; leavingStartedAt: number }>;
  /** ユーザーごとの最新エモート（user_id → { emote, timestamp }） */
  userEmotes: Record<string, { emote: string; timestamp: number }>;
  /** 入退室などのトースト通知リスト */
  toasts: RoomToast[];

  /** 自分自身のseat_index（未着席は null） */
  mySeatIndex: number | null;
  /** 自分自身が座っている家具のID */
  myFurnitureId: string | null;

  /** Supabase Realtimeチャンネルの接続状態 */
  isConnected: boolean;
  /** Presence 同期用のサービスインスタンス */
  presenceService: PresenceService | null;

  /** 在室者リストを全件更新する（Presence sync時に呼ぶ） */
  setOccupants: (occupants: Map<string, SeatOccupant>) => void;

  /** 1人分の着席情報を追加・更新する（Presence join時） */
  upsertOccupant: (occupant: SeatOccupant) => void;

  /** 1人分の着席情報を削除する（Presence leave時） */
  removeOccupant: (userId: string) => void;

  /** 退室アニメーションを開始する */
  startLeavingAnimation: (userId: string) => void;
  /** 退室アニメーション終了後に完全削除 */
  finishLeavingAnimation: (userId: string) => void;

  /** エモートをセット */
  setUserEmote: (userId: string, emote: string) => void;
  /** トーストを追加 */
  addToast: (message: string, type?: 'join' | 'leave' | 'info') => void;
  /** トーストを削除 */
  removeToast: (id: string) => void;

  /** 自分のseat_indexをセット */
  setMySeatIndex: (index: number | null) => void;
  /** 自分が座っている家具のIDをセット */
  setMyFurnitureId: (id: string | null) => void;

  /** 接続状態をセット */
  setConnected: (connected: boolean) => void;
  /** Presence サービスをセット */
  setPresenceService: (service: PresenceService | null) => void;


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
  /** 現在移動中の既存家具のID */
  movingFurnitureId: string | null;
  /** 現在選択中のインベントリカテゴリーID */
  selectedCategoryId: string;

  /** 編集モードの切り替え */
  setEditing: (isEditing: boolean) => void;
  /** 選択中のアイテムをセット */
  setSelectedItem: (itemId: string | null) => void;
  /** プレビュー位置をセット */
  setPreviewPosition: (pos: [number, number] | null) => void;
  /** プレビュー回転をセット */
  setPreviewRotation: (rotation: number) => void;
  /** 移動中の家具IDをセット */
  setMovingFurnitureId: (id: string | null) => void;
  /** インベントリカテゴリーをセット */
  setCategoryId: (categoryId: string) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  occupants: new Map(),
  leavingOccupants: new Map(),
  userEmotes: {},
  toasts: [],
  mySeatIndex: null,
  myFurnitureId: null,
  isConnected: false,
  presenceService: null,

  // 編集モード初期値
  isEditing: false,
  selectedItemId: null,
  previewPosition: null,
  previewRotation: 0,
  movingFurnitureId: null,
  selectedCategoryId: 'desk',
  // 家具データの初期値
  furnitures: [],

  setOccupants: (occupants) => set({ occupants }),

  upsertOccupant: (occupant) =>
    set((state) => {
      const next = new Map(state.occupants);
      next.set(occupant.user_id, occupant);
      // 退室リストに存在していた場合は復活
      const nextLeaving = new Map(state.leavingOccupants);
      if (nextLeaving.has(occupant.user_id)) {
        nextLeaving.delete(occupant.user_id);
      }
      return { occupants: next, leavingOccupants: nextLeaving };
    }),

  removeOccupant: (userId) =>
    set((state) => {
      const next = new Map(state.occupants);
      next.delete(userId);
      return { occupants: next };
    }),

  startLeavingAnimation: (userId) =>
    set((state) => {
      const occupant = state.occupants.get(userId);
      if (!occupant) return state;

      const nextOccupants = new Map(state.occupants);
      nextOccupants.delete(userId);

      const nextLeaving = new Map(state.leavingOccupants);
      nextLeaving.set(userId, { occupant, leavingStartedAt: Date.now() });

      return { occupants: nextOccupants, leavingOccupants: nextLeaving };
    }),

  finishLeavingAnimation: (userId) =>
    set((state) => {
      const nextLeaving = new Map(state.leavingOccupants);
      nextLeaving.delete(userId);
      return { leavingOccupants: nextLeaving };
    }),

  setUserEmote: (userId, emote) =>
    set((state) => ({
      userEmotes: {
        ...state.userEmotes,
        [userId]: { emote, timestamp: Date.now() }
      }
    })),

  addToast: (message, type = 'info') =>
    set((state) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: RoomToast = { id, message, type, timestamp: Date.now() };
      // 最大3件まで表示
      return { toasts: [...state.toasts.slice(-2), newToast] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),

  setMySeatIndex: (index) => set({ mySeatIndex: index }),
  setMyFurnitureId: (id) => set({ myFurnitureId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setPresenceService: (service) => set({ presenceService: service }),

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
    const { furnitures, movingFurnitureId } = get();
    furnitures.forEach(f => {
      if (f.id === movingFurnitureId) return; // 移動中の家具は計算から除外
      const item = ROOM_ITEMS.find(it => it.id === f.item_id);
      const sizeX = item?.sizeX ?? 1;
      const sizeZ = item?.sizeZ ?? 1;
      for (let dx = 0; dx < sizeX; dx++) {
        for (let dz = 0; dz < sizeZ; dz++) {
          occupied.add(`${f.pos_x + dx},${f.pos_z + dz}`);
        }
      }
    });
    return occupied;
  },

  // 編集モードアクション
  setEditing: (isEditing) => set({ isEditing, selectedItemId: null, previewPosition: null, previewRotation: 0, movingFurnitureId: null }),
  setSelectedItem: (selectedItemId) => set({ selectedItemId, previewRotation: 0, movingFurnitureId: selectedItemId === null ? null : get().movingFurnitureId }),
  setPreviewPosition: (previewPosition) => set({ previewPosition }),
  setPreviewRotation: (rotation) => set({ previewRotation: rotation }),
  setMovingFurnitureId: (movingFurnitureId) => set({ movingFurnitureId }),
  setCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
}));
