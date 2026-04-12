export type ItemType = 'desk' | 'chair' | 'plant' | 'decoration' | 'wall' | 'floor';

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
    type: 'plant',
    sizeX: 1,
    sizeZ: 1,
    isSeat: false,
    modelComponent: 'PottedPlant',
  },
];
