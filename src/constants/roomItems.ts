export type ItemType = 'desk' | 'chair' | 'furniture' | 'wall' | 'floor' | 'background' | 'lighting';

export interface RoomCategory {
  id: ItemType;
  name: string;
}

export const ROOM_CATEGORIES: RoomCategory[] = [
  { id: 'desk', name: '椅子机セット' },
  { id: 'chair', name: '椅子' },
  { id: 'furniture', name: '家具' },
  { id: 'wall', name: '壁紙' },
  { id: 'floor', name: '床' },
  { id: 'background', name: '背景' },
  { id: 'lighting', name: '照明' },
];

export interface RoomItem {
  id: string;
  name: string;
  type: ItemType;
  sizeX: number; // グリッド単位 (1 = 1x1マス)
  sizeZ: number;
  isSeat: boolean;
  thumbnailUrl?: string;
  modelComponent: string; // DynamicFurniture で利用するコンポーネント名
  /** 
   * 座席の基準点からの相対オフセット 
   * x, z: グリッド単位のオフセット
   * rotation: 家具の向きに対する相対回転 (ラジアン)
   */
  seatOffset?: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
}

export const ROOM_ITEMS: RoomItem[] = [
  {
    id: 'standard-desk',
    name: 'Standard Desk',
    type: 'desk',
    sizeX: 2,
    sizeZ: 2,
    isSeat: true,
    modelComponent: 'Workstation',
    seatOffset: {
      x: 0.5,
      y: 0,
      z: 1.25,
      rotation: Math.PI, // デスクに向き合うように (180度)
    },
  },
  {
    id: 'standard-chair',
    name: 'オフィスチェア',
    type: 'chair',
    sizeX: 1,
    sizeZ: 1,
    isSeat: true,
    modelComponent: 'Chair',
    seatOffset: {
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
    },
  },
  {
    id: 'potted-plant',
    name: '観葉植物',
    type: 'furniture',
    sizeX: 1,
    sizeZ: 1,
    isSeat: false,
    modelComponent: 'PottedPlant',
  },
  // 以下、空のカテゴリー確認用プレースホルダ
  {
    id: 'sample-wall',
    name: 'サンプル壁紙',
    type: 'wall',
    sizeX: 1,
    sizeZ: 1,
    isSeat: false,
    modelComponent: 'Wall',
  },
  {
    id: 'sample-floor',
    name: 'サンプル床',
    type: 'floor',
    sizeX: 1,
    sizeZ: 1,
    isSeat: false,
    modelComponent: 'Floor',
  },
];
