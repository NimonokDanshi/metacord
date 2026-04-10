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
  },
  {
    id: 'standard-chair',
    name: 'オフィスチェア',
    type: 'chair',
    sizeX: 1,
    sizeZ: 1,
    isSeat: false,
    modelComponent: 'Chair',
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
