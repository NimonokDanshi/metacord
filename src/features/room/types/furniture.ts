export interface Furniture {
  id: string;
  server_id: string;
  item_id: string; // items.ts で定義したID (standard-deskなど)
  pos_x: number;
  pos_z: number;
  rotation: number;
  metadata?: any;
}

export type NewFurniture = Omit<Furniture, 'id'>;
