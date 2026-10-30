import React from 'react';

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

/**
 * すべての家具3Dモデルが受け取れる共通インターフェース
 */
export interface FurnitureModelProps {
  pos?: { x: number; y: number; z: number };
  rotation?: number;
  isOccupied?: boolean;
  occupantMySet?: any;
  colorOverride?: string;
  opacity?: number;
}
